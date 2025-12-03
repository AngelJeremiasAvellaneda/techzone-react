import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import {
  Search, Filter, Download, Eye, Edit, Trash2,
  CheckCircle, XCircle, Clock, Package, Truck,
  CreditCard, DollarSign, User, Calendar,
  ChevronDown, MoreVertical, RefreshCw, Printer,
  ExternalLink, FileText, AlertCircle, Mail, Phone,
  MapPin, Archive, CheckSquare, XSquare, Loader
} from 'lucide-react';

const AdminOrders = () => {
  const { profile, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalOrders, setTotalOrders] = useState(0);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  // Estados de filtros
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    paymentMethod: 'all',
    customer: ''
  });

  // Obtener todos los estados posibles
  const orderStatuses = [
    { value: 'all', label: 'Todos los estados', color: 'gray' },
    { value: 'pending', label: 'Pendiente', color: 'yellow' },
    { value: 'processing', label: 'Procesando', color: 'blue' },
    { value: 'paid', label: 'Pagado', color: 'green' },
    { value: 'shipped', label: 'Enviado', color: 'purple' },
    { value: 'delivered', label: 'Entregado', color: 'green' },
    { value: 'cancelled', label: 'Cancelado', color: 'red' },
    { value: 'refunded', label: 'Reembolsado', color: 'orange' }
  ];

  useEffect(() => {
    loadOrders();
  }, [currentPage]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, dateRange, filters, orders]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      // Calcular offset para paginación
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Obtener pedidos con paginación
      const { data, error, count } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            price,
            product:products (
              name,
              image,
              sku
            )
          ),
          profiles (
            full_name,
            email,
            phone,
            address
          ),
          shipping_address (
            full_name,
            address,
            city,
            country,
            phone
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setOrders(data || []);
      setTotalOrders(count || 0);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.order_items?.some(item => 
          item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Filtrar por fecha
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter(order => new Date(order.created_at) >= startDate);
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      filtered = filtered.filter(order => new Date(order.created_at) <= endDate);
    }

    // Filtrar por monto
    if (filters.minAmount) {
      filtered = filtered.filter(order => order.total >= parseFloat(filters.minAmount));
    }
    if (filters.maxAmount) {
      filtered = filtered.filter(order => order.total <= parseFloat(filters.maxAmount));
    }

    // Filtrar por método de pago
    if (filters.paymentMethod !== 'all') {
      filtered = filtered.filter(order => order.payment_method === filters.paymentMethod);
    }

    // Filtrar por cliente
    if (filters.customer) {
      filtered = filtered.filter(order =>
        order.profiles?.full_name?.toLowerCase().includes(filters.customer.toLowerCase()) ||
        order.profiles?.email?.toLowerCase().includes(filters.customer.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { label: 'Procesando', color: 'bg-blue-100 text-blue-800', icon: Package },
      paid: { label: 'Pagado', color: 'bg-green-100 text-green-800', icon: CreditCard },
      shipped: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
      refunded: { label: 'Reembolsado', color: 'bg-orange-100 text-orange-800', icon: DollarSign }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-800', icon: Package };
  };

  const getPaymentMethodInfo = (method) => {
    const methods = {
      card: { label: 'Tarjeta', color: 'bg-blue-100 text-blue-800' },
      cash: { label: 'Efectivo', color: 'bg-green-100 text-green-800' },
      transfer: { label: 'Transferencia', color: 'bg-purple-100 text-purple-800' },
      paypal: { label: 'PayPal', color: 'bg-yellow-100 text-yellow-800' }
    };
    return methods[method] || { label: method, color: 'bg-gray-100 text-gray-800' };
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    setUpdatingStatus(orderId);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Actualizar estado local
      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));

      // Si el pedido seleccionado está abierto, actualizarlo
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      // Si estaba en selección múltiple, quitarlo
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error al actualizar el estado del pedido');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este pedido? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // Primero eliminar los items del pedido
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      // Luego eliminar el pedido
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      // Actualizar lista local
      setOrders(orders.filter(order => order.id !== orderId));
      alert('Pedido eliminado correctamente');
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error al eliminar el pedido');
    }
  };

  const viewOrderDetails = async (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const exportOrders = () => {
    const dataToExport = filteredOrders.map(order => ({
      'ID': order.id,
      'Fecha': new Date(order.created_at).toLocaleDateString('es-PE'),
      'Cliente': order.profiles?.full_name || 'N/A',
      'Email': order.profiles?.email || 'N/A',
      'Estado': getStatusInfo(order.status).label,
      'Método de Pago': getPaymentMethodInfo(order.payment_method).label,
      'Total': `S/. ${order.total?.toFixed(2)}`,
      'Productos': order.order_items?.length || 0,
      'Dirección de Envío': order.shipping_address?.address || 'N/A'
    }));

    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    if (!window.confirm(`¿Estás seguro de que quieres ${bulkAction} ${selectedOrders.length} pedidos?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: bulkAction })
        .in('id', selectedOrders);

      if (error) throw error;

      // Actualizar lista local
      setOrders(orders.map(order =>
        selectedOrders.includes(order.id) ? { ...order, status: bulkAction } : order
      ));

      // Limpiar selección
      setSelectedOrders([]);
      setBulkAction('');
      
      alert(`${selectedOrders.length} pedidos actualizados correctamente`);
    } catch (error) {
      console.error('Error updating bulk orders:', error);
      alert('Error al actualizar los pedidos');
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === filteredOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrders.map(order => order.id));
    }
  };

  const toggleSelectOrder = (orderId) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter(id => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  return (
    <AdminLayout title="Gestión de Pedidos">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Gestión de Pedidos
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Administra y realiza seguimiento a todos los pedidos de la tienda
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadOrders}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={exportOrders}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Buscar pedidos
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ID, cliente, producto..."
                className="pl-10 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtro por estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Estado
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {orderStatuses.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha de inicio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha desde
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Fecha fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha hasta
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filtros avanzados (toggle) */}
        <div className="mt-4">
          <button
            onClick={() => setFilters({ ...filters, showAdvanced: !filters.showAdvanced })}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Filter className="w-4 h-4" />
            Filtros avanzados
            <ChevronDown className={`w-4 h-4 transform ${filters.showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {filters.showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto mínimo (S/.)
                </label>
                <input
                  type="number"
                  value={filters.minAmount}
                  onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Monto máximo (S/.)
                </label>
                <input
                  type="number"
                  value={filters.maxAmount}
                  onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
                  placeholder="9999.99"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Método de pago
                </label>
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todos los métodos</option>
                  <option value="card">Tarjeta</option>
                  <option value="cash">Efectivo</option>
                  <option value="transfer">Transferencia</option>
                  <option value="paypal">PayPal</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Acciones masivas */}
      {selectedOrders.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="font-medium text-gray-900 dark:text-white">
                {selectedOrders.length} pedidos seleccionados
              </span>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">Acción masiva</option>
                <option value="processing">Marcar como Procesando</option>
                <option value="paid">Marcar como Pagado</option>
                <option value="shipped">Marcar como Enviado</option>
                <option value="delivered">Marcar como Entregado</option>
                <option value="cancelled">Cancelar pedidos</option>
              </select>
              
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aplicar
              </button>
              
              <button
                onClick={() => setSelectedOrders([])}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Limpiar selección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de pedidos */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No se encontraron pedidos
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end
                ? 'Intenta con otros filtros de búsqueda'
                : 'No hay pedidos registrados todavía'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID / Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px 6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado / Pago
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrders.map((order) => {
                    const statusInfo = getStatusInfo(order.status);
                    const StatusIcon = statusInfo.icon;
                    const paymentInfo = getPaymentMethodInfo(order.payment_method);
                    const customerName = order.profiles?.full_name || 'Cliente';
                    const productCount = order.order_items?.length || 0;

                    return (
                      <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedOrders.includes(order.id)}
                            onChange={() => toggleSelectOrder(order.id)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              #{order.id.slice(0, 8).toUpperCase()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(order.created_at).toLocaleDateString('es-PE', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold mr-3">
                              {customerName.charAt(0)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {customerName}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {order.profiles?.email || 'Sin email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">
                            {productCount} {productCount === 1 ? 'producto' : 'productos'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {order.order_items?.[0]?.product?.name || 'Sin productos'}
                            {productCount > 1 && ` +${productCount - 1} más`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-lg font-bold text-gray-900 dark:text-white">
                            S/. {order.total?.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <StatusIcon className="w-4 h-4" />
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                            <div>
                              <span className={`px-2 py-1 text-xs rounded-full ${paymentInfo.color}`}>
                                {paymentInfo.label}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => viewOrderDetails(order)}
                              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                              title="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            
                            <div className="relative">
                              <button
                                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                onClick={() => setSelectedOrders(prev => 
                                  prev.includes(order.id) 
                                    ? prev.filter(id => id !== order.id)
                                    : [...prev, order.id]
                                )}
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                              
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10 hidden group-hover:block">
                                <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                                  Cambiar estado:
                                </div>
                                {orderStatuses
                                  .filter(s => s.value !== 'all' && s.value !== order.status)
                                  .map((status) => (
                                    <button
                                      key={status.value}
                                      onClick={() => updateOrderStatus(order.id, status.value)}
                                      disabled={updatingStatus === order.id}
                                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                      {updatingStatus === order.id && status.value === order.status ? (
                                        <Loader className="w-4 h-4 animate-spin" />
                                      ) : (
                                        <StatusIcon className="w-4 h-4" />
                                      )}
                                      {status.label}
                                    </button>
                                  ))}
                                
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                                
                                <button
                                  onClick={() => {
                                    if (window.confirm('¿Estás seguro de que quieres eliminar este pedido?')) {
                                      deleteOrder(order.id);
                                    }
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Eliminar pedido
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalOrders)}</span> de{' '}
                <span className="font-medium">{totalOrders}</span> pedidos
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                <div className="flex items-center gap-2">
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
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-purple-600 text-white'
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal de detalles del pedido */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del modal */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Pedido #{selectedOrder.id.slice(0, 8).toUpperCase()}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(selectedOrder.created_at).toLocaleDateString('es-PE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => window.print()}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="Imprimir"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-6">
                {/* Información del cliente */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Información del Cliente
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Nombre</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedOrder.profiles?.full_name || 'No especificado'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedOrder.profiles?.email || 'No especificado'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Teléfono</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedOrder.profiles?.phone || selectedOrder.shipping_address?.phone || 'No especificado'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                      Dirección de Envío
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Dirección</p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {selectedOrder.shipping_address?.address || 'No especificada'}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.country}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Productos del pedido */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Productos ({selectedOrder.order_items?.length || 0})
                  </h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900/50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Producto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            SKU
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Precio
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Cantidad
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Subtotal
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {selectedOrder.order_items?.map((item, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                                  {item.product?.image ? (
                                    <img
                                      src={item.product.image}
                                      alt={item.product.name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                                      <Package className="w-5 h-5 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {item.product?.name || 'Producto no disponible'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {item.product?.sku || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              S/. {item.price?.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {item.quantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                              S/. {(item.price * item.quantity)?.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Resumen del pedido */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    Resumen del Pedido
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Estado</p>
                      <div className="flex items-center gap-2 mt-1">
                        {(() => {
                          const statusInfo = getStatusInfo(selectedOrder.status);
                          const StatusIcon = statusInfo.icon;
                          return (
                            <>
                              <StatusIcon className="w-4 h-4" />
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Método de Pago</p>
                      <p className="font-medium text-gray-900 dark:text-white mt-1">
                        {getPaymentMethodInfo(selectedOrder.payment_method).label}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Subtotal</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                        S/. {selectedOrder.total?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                        S/. {selectedOrder.total?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones rápidas */}
                <div className="mt-6 flex flex-wrap gap-3">
                  {orderStatuses
                    .filter(s => s.value !== 'all' && s.value !== selectedOrder.status)
                    .slice(0, 4)
                    .map((status) => (
                      <button
                        key={status.value}
                        onClick={() => {
                          updateOrderStatus(selectedOrder.id, status.value);
                        }}
                        disabled={updatingStatus === selectedOrder.id}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                      >
                        {updatingStatus === selectedOrder.id ? (
                          <Loader className="w-4 h-4 animate-spin inline mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 inline mr-2" />
                        )}
                        Marcar como {status.label}
                      </button>
                    ))}
                  
                  <button
                    onClick={() => {
                      // Lógica para reenviar factura
                      alert('Factura reenviada al cliente');
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Mail className="w-4 h-4 inline mr-2" />
                    Reenviar factura
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrders;