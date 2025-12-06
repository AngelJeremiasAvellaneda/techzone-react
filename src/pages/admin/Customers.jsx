// src/pages/admin/Customers.jsx
import React, { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  Search, Filter, UserPlus, Mail, Phone, Calendar,
  Edit, Trash2, Eye, ChevronLeft, ChevronRight,
  Download, CheckCircle, XCircle, MoreVertical,
  TrendingUp, Users as UsersIcon, CreditCard,
  MapPin, Package, Shield
} from "lucide-react";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    newThisMonth: 0,
    totalOrders: 0,
    avgOrderValue: 0
  });

  const customersPerPage = 10;

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      
      // Cargar clientes
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (customersError) throw customersError;
      
      // Cargar estadísticas de pedidos para cada cliente
      const customersWithStats = await Promise.all(
        (customersData || []).map(async (customer) => {
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('id, total, created_at')
            .eq('user_id', customer.id);

          if (!ordersError && ordersData) {
            const totalOrders = ordersData.length;
            const totalSpent = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
            const lastOrder = ordersData.length > 0 
              ? new Date(Math.max(...ordersData.map(o => new Date(o.created_at)))) 
              : null;

            return {
              ...customer,
              total_orders: totalOrders,
              total_spent: totalSpent,
              last_order: lastOrder,
              avg_order_value: totalOrders > 0 ? totalSpent / totalOrders : 0
            };
          }
          
          return {
            ...customer,
            total_orders: 0,
            total_spent: 0,
            last_order: null,
            avg_order_value: 0
          };
        })
      );

      setCustomers(customersWithStats);
      calculateStats(customersWithStats);
    } catch (error) {
      console.error('Error loading customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (customersData) => {
    const total = customersData.length;
    const active = customersData.filter(c => c.total_orders > 0).length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newThisMonth = customersData.filter(c => {
      if (!c.created_at) return false;
      const created = new Date(c.created_at);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length;

    const totalOrders = customersData.reduce((sum, c) => sum + c.total_orders, 0);
    const totalSpent = customersData.reduce((sum, c) => sum + c.total_spent, 0);
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

    setStats({
      total,
      active,
      newThisMonth,
      totalOrders,
      avgOrderValue
    });
  };

  const getStatusBadge = (customer) => {
    if (customer.total_orders === 0) {
      return { label: 'Nuevo', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' };
    } else if (customer.total_orders >= 5) {
      return { label: 'Premium', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' };
    } else {
      return { label: 'Activo', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' };
    }
  };

  const getOrderFrequency = (customer) => {
    if (!customer.created_at) return 'N/A';
    const created = new Date(customer.created_at);
    const monthsSinceJoin = Math.max(1, (new Date() - created) / (30 * 24 * 60 * 60 * 1000));
    const ordersPerMonth = customer.total_orders / monthsSinceJoin;
    
    if (ordersPerMonth >= 2) return 'Alta';
    if (ordersPerMonth >= 0.5) return 'Media';
    return 'Baja';
  };

  const filteredCustomers = customers.filter(customer => {
    // Filtro por búsqueda
    const matchesSearch = searchTerm === "" ||
      customer.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtro por estado
    const statusInfo = getStatusBadge(customer);
    const matchesStatus = selectedStatus === "all" || 
      (selectedStatus === "active" && customer.total_orders > 0) ||
      (selectedStatus === "new" && customer.total_orders === 0) ||
      (selectedStatus === "premium" && customer.total_orders >= 5);

    return matchesSearch && matchesStatus;
  });

  // Paginación
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);
  const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedCustomers(currentCustomers.map(c => c.id));
    } else {
      setSelectedCustomers([]);
    }
  };

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const handleDeleteSelected = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar ${selectedCustomers.length} cliente(s)?`)) return;
    
    try {
      // Aquí iría la lógica para eliminar clientes
      console.log('Eliminar clientes:', selectedCustomers);
      // Recargar la lista
      await loadCustomers();
      setSelectedCustomers([]);
    } catch (error) {
      console.error('Error deleting customers:', error);
    }
  };

  const handleExportData = () => {
    // Lógica para exportar datos
    const exportData = filteredCustomers.map(customer => ({
      Nombre: customer.full_name || 'Sin nombre',
      Email: customer.email,
      Teléfono: customer.phone || 'No proporcionado',
      'Total Pedidos': customer.total_orders,
      'Total Gastado': formatCurrency(customer.total_spent),
      'Último Pedido': formatDate(customer.last_order),
      'Fecha Registro': formatDate(customer.created_at),
      Estado: getStatusBadge(customer).label
    }));

    // Crear CSV
    const csvContent = [
      Object.keys(exportData[0]).join(','),
      ...exportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `clientes-techzone-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      {/* Header y estadísticas */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Gestión de Clientes</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administra y analiza la base de clientes de tu tienda
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clientes Totales</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <UsersIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <TrendingUp className="w-4 h-4" />
            <span>+{stats.newThisMonth} este mes</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Clientes Activos</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.active}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% del total` : 'Sin datos'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pedidos Totales</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalOrders}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            Ticket promedio: {formatCurrency(stats.avgOrderValue)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nuevos (30 días)</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.newThisMonth}</p>
            </div>
            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <UserPlus className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            {stats.total > 0 ? `${Math.round((stats.newThisMonth / stats.total) * 100)}% crecimiento` : 'Sin datos'}
          </p>
        </div>
      </div>

      {/* Barra de herramientas */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar cliente por nombre, email o teléfono..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                className="border border-gray-300 dark:border-gray-600 rounded-lg bg-transparent text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Todos los clientes</option>
                <option value="new">Nuevos (sin pedidos)</option>
                <option value="active">Clientes activos</option>
                <option value="premium">Clientes premium</option>
              </select>
            </div>
          </div>

          {selectedCustomers.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedCustomers.length} seleccionado(s)
              </span>
              <button
                onClick={handleDeleteSelected}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar seleccionados
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabla de clientes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <th className="py-3 px-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                    onChange={handleSelectAll}
                    checked={selectedCustomers.length === currentCustomers.length && currentCustomers.length > 0}
                  />
                </th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Cliente</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Contacto</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Estadísticas</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Estado</th>
                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-900 dark:text-white">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {currentCustomers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500 dark:text-gray-400">
                    {searchTerm || selectedStatus !== "all" ? (
                      <div className="flex flex-col items-center">
                        <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p>No se encontraron clientes con los filtros aplicados</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <UsersIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                        <p>No hay clientes registrados</p>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                currentCustomers.map((customer) => {
                  const statusInfo = getStatusBadge(customer);
                  
                  return (
                    <tr 
                      key={customer.id} 
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 dark:border-gray-600 text-purple-600 focus:ring-purple-500"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => handleSelectCustomer(customer.id)}
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                            {customer.full_name?.charAt(0) || customer.email?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {customer.full_name || 'Sin nombre'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Registrado: {formatDate(customer.created_at)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-900 dark:text-white">{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400">{customer.phone}</span>
                            </div>
                          )}
                          {customer.address && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              <span className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[200px]">
                                {customer.address}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Pedidos:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{customer.total_orders}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total gastado:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              {formatCurrency(customer.total_spent)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Frecuencia:</span>
                            <span className={`text-sm font-medium px-2 py-1 rounded ${
                              getOrderFrequency(customer) === 'Alta' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : getOrderFrequency(customer) === 'Media'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                            }`}>
                              {getOrderFrequency(customer)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        {customer.role === 'admin' && (
                          <div className="mt-1 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-purple-500" />
                            <span className="text-xs text-purple-600 dark:text-purple-400">Administrador</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
                            title="Editar cliente"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Eliminar cliente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {currentCustomers.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando <span className="font-medium">{indexOfFirstCustomer + 1}</span> -{" "}
                <span className="font-medium">
                  {Math.min(indexOfLastCustomer, filteredCustomers.length)}
                </span>{" "}
                de <span className="font-medium">{filteredCustomers.length}</span> clientes
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium ${
                        currentPage === pageNum
                          ? 'bg-purple-600 text-white'
                          : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      } transition-colors`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AdminCustomers;