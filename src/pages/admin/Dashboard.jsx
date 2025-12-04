// src/pages/admin/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import {
  TrendingUp, DollarSign, ShoppingCart, Users,
  Package, BarChart3, Activity, Calendar,
  ArrowUp, ArrowDown, RefreshCw, Download,
  CreditCard, Truck, CheckCircle, Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    monthlyRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    averageOrderValue: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas
      await loadStats();
      
      // Cargar pedidos recientes
      await loadRecentOrders();
      
      // Cargar productos más vendidos
      await loadTopProducts();
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Total de ventas
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total, status, created_at');

      if (ordersError) throw ordersError;
      
      const totalSales = ordersData?.reduce((sum, order) => sum + (order.total || 0), 0) || 0;
      const totalOrders = ordersData?.length || 0;
      const pendingOrders = ordersData?.filter(order => order.status === 'pending').length || 0;
      const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

      // Total de clientes
      const { data: customersData, error: customersError } = await supabase
        .from('profiles')
        .select('id')
        .eq('role', 'customer');

      if (customersError) throw customersError;
      
      // Total de productos
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, stock');

      if (productsError) throw productsError;
      
      const lowStockProducts = productsData?.filter(product => product.stock <= 5).length || 0;

      // Ingresos del mes actual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyOrders = ordersData?.filter(order => {
        if (!order.created_at) return false;
        const orderDate = new Date(order.created_at);
        return orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear;
      }) || [];
      
      const monthlyRevenue = monthlyOrders.reduce((sum, order) => sum + (order.total || 0), 0);

      setStats({
        totalSales,
        totalOrders,
        totalCustomers: customersData?.length || 0,
        totalProducts: productsData?.length || 0,
        monthlyRevenue,
        pendingOrders,
        lowStockProducts,
        averageOrderValue
      });

    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            product:products (
              name,
              image
            )
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;
      setRecentOrders(data || []);
    } catch (error) {
      console.error('Error loading recent orders:', error);
    }
  };

  const loadTopProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          quantity,
          product:products (
            id,
            name,
            image,
            price
          )
        `)
        .limit(10); // Aumentado para mejor agrupación

      if (error) throw error;
      
      // Agrupar productos por ventas
      const productSales = {};
      data?.forEach(item => {
        const productId = item.product?.id;
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              product: item.product,
              totalQuantity: 0,
              totalRevenue: 0
            };
          }
          productSales[productId].totalQuantity += item.quantity || 0;
          productSales[productId].totalRevenue += (item.quantity || 0) * (item.product?.price || 0);
        }
      });

      const topProductsArray = Object.values(productSales)
        .sort((a, b) => b.totalQuantity - a.totalQuantity)
        .slice(0, 5);

      setTopProducts(topProductsArray);
    } catch (error) {
      console.error('Error loading top products:', error);
    }
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
      paid: { label: 'Pagado', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: CreditCard },
      processing: { label: 'Procesando', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: Package },
      shipped: { label: 'Enviado', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', icon: Truck },
      delivered: { label: 'Entregado', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
      cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: CheckCircle }
    };
    return statusMap[status] || { label: status || 'Desconocido', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300', icon: Package };
  };

  const statCards = [
    {
      label: 'Ventas Totales',
      value: `S/. ${stats.totalSales.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%',
      trend: 'up'
    },
    {
      label: 'Pedidos Totales',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-500',
      change: '+8.2%',
      trend: 'up'
    },
    {
      label: 'Clientes',
      value: stats.totalCustomers.toString(),
      icon: Users,
      color: 'bg-purple-500',
      change: '+5.1%',
      trend: 'up'
    },
    {
      label: 'Productos',
      value: stats.totalProducts.toString(),
      icon: Package,
      color: 'bg-orange-500',
      change: '+3.4%',
      trend: 'up'
    }
  ];

  return (
    <>
      {/* Header con acciones */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Panel de Control</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Resumen general de tu tienda - {new Date().toLocaleDateString('es-PE', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUp : ArrowDown;
          
          return (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                  <Icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
                <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                  <TrendIcon className="w-4 h-4" />
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Grilla de contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pedidos Recientes */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Pedidos Recientes</h2>
            <a href="/admin/orders" className="text-sm text-purple-600 dark:text-purple-400 hover:underline transition-colors">
              Ver todos →
            </a>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : recentOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No hay pedidos recientes</p>
              </div>
            ) : (
              recentOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const customerName = order.profiles?.full_name || 'Cliente';

                const orderId = order.id 
                  ? String(order.id).slice(-8).toUpperCase() 
                  : 'N/A';

                return (
                  <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">
                        {customerName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Pedido #{orderId}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{customerName}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <StatusIcon className="w-4 h-4" />
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        S/. {(order.total || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Productos Destacados */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Productos Destacados</h2>
            <a href="/admin/products" className="text-sm text-purple-600 dark:text-purple-400 hover:underline transition-colors">
              Ver todos →
            </a>
          </div>
          
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : topProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p>No hay productos destacados</p>
              </div>
            ) : (
              topProducts.map((item, index) => (
                <div key={item.product?.id || index} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.image ? (
                      <img 
                        src={item.product.image} 
                        alt={item.product.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '';
                          e.target.parentElement.innerHTML = `
                            <div class="w-full h-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                              </svg>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                        <Package className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {item.product?.name || 'Producto'}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {item.totalQuantity} vendidos
                      </span>
                      <span className="font-bold text-purple-600 dark:text-purple-400">
                        S/. {(item.totalRevenue || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas Adicionales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ingresos del Mes</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                S/. {(stats.monthlyRevenue || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pedidos Pendientes</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.pendingOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
              <Activity className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Productos Bajo Stock</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.lowStockProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Ticket Promedio</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                S/. {(stats.averageOrderValue || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;