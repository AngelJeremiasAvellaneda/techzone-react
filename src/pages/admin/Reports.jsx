import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from './AdminLayout';
import {
  BarChart3, TrendingUp, TrendingDown, DollarSign,
  Users, ShoppingCart, Package, Download,
  Calendar, Filter, RefreshCw, Printer,
  PieChart, LineChart, Activity, Award,
  ChevronDown, ChevronUp, ExternalLink, Eye
} from 'lucide-react';

const AdminReports = () => {
  const [loading, setLoading] = useState(true);
  const [reportType, setReportType] = useState('sales'); // 'sales', 'products', 'customers', 'inventory'
  const [dateRange, setDateRange] = useState('month'); // 'day', 'week', 'month', 'quarter', 'year', 'custom'
  const [customDateRange, setCustomDateRange] = useState({
    start: '',
    end: ''
  });
  const [compareWithPrevious, setCompareWithPrevious] = useState(true);
  
  // Datos de reportes
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [customerMetrics, setCustomerMetrics] = useState({});
  const [inventoryMetrics, setInventoryMetrics] = useState({});
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [conversionMetrics, setConversionMetrics] = useState({});

  useEffect(() => {
    loadReportData();
  }, [reportType, dateRange]);

  const loadReportData = async () => {
    setLoading(true);
    try {
      switch (reportType) {
        case 'sales':
          await loadSalesReport();
          break;
        case 'products':
          await loadProductsReport();
          break;
        case 'customers':
          await loadCustomersReport();
          break;
        case 'inventory':
          await loadInventoryReport();
          break;
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesReport = async () => {
    try {
      // Calcular fechas basadas en el rango seleccionado
      const { startDate, endDate } = calculateDateRange();
      
      // Obtener pedidos en el rango de fechas
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Procesar datos de ventas
      const salesByDay = {};
      const salesByStatus = {};
      let totalRevenue = 0;
      let totalOrders = 0;
      let averageOrderValue = 0;

      orders?.forEach(order => {
        const date = new Date(order.created_at).toLocaleDateString('es-PE');
        
        // Ventas por día
        if (!salesByDay[date]) {
          salesByDay[date] = { revenue: 0, orders: 0 };
        }
        salesByDay[date].revenue += order.total || 0;
        salesByDay[date].orders += 1;

        // Ventas por estado
        if (!salesByStatus[order.status]) {
          salesByStatus[order.status] = { revenue: 0, orders: 0 };
        }
        salesByStatus[order.status].revenue += order.total || 0;
        salesByStatus[order.status].orders += 1;

        // Totales
        totalRevenue += order.total || 0;
        totalOrders += 1;
      });

      // Calcular promedio
      averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Convertir a array para gráficos
      const salesArray = Object.entries(salesByDay)
        .map(([date, data]) => ({
          date,
          revenue: data.revenue,
          orders: data.orders
        }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      setSalesData(salesArray);

      // Métricas de conversión
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      const totalSessions = sessions?.length || 0;
      const conversionRate = totalSessions > 0 ? (totalOrders / totalSessions) * 100 : 0;

      setConversionMetrics({
        totalSessions,
        conversionRate,
        totalOrders,
        averageOrderValue
      });

    } catch (error) {
      console.error('Error loading sales report:', error);
    }
  };

  const loadProductsReport = async () => {
    try {
      const { startDate, endDate } = calculateDateRange();

      // Obtener items de pedidos en el rango
      const { data: orderItems, error } = await supabase
        .from('order_items')
        .select(`
          quantity,
          price,
          product:products (
            id,
            name,
            image,
            category:categories (name)
          ),
          order:orders!inner (
            created_at,
            status
          )
        `)
        .gte('order.created_at', startDate.toISOString())
        .lte('order.created_at', endDate.toISOString())
        .eq('order.status', 'delivered'); // Solo pedidos entregados

      if (error) throw error;

      // Agrupar por producto
      const productSales = {};
      const categorySales = {};

      orderItems?.forEach(item => {
        const productId = item.product?.id;
        const categoryName = item.product?.category?.name || 'Sin categoría';
        
        if (productId) {
          if (!productSales[productId]) {
            productSales[productId] = {
              product: item.product,
              quantity: 0,
              revenue: 0,
              profit: 0 // Esto sería calculado con el costo
            };
          }
          productSales[productId].quantity += item.quantity;
          productSales[productId].revenue += item.quantity * item.price;
        }

        // Por categoría
        if (!categorySales[categoryName]) {
          categorySales[categoryName] = { quantity: 0, revenue: 0 };
        }
        categorySales[categoryName].quantity += item.quantity;
        categorySales[categoryName].revenue += item.quantity * item.price;
      });

      // Productos más vendidos
      const topProductsArray = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10);

      // Categorías más vendidas
      const topCategoriesArray = Object.entries(categorySales)
        .map(([name, data]) => ({
          name,
          ...data
        }))
        .sort((a, b) => b.revenue - a.revenue);

      setTopProducts(topProductsArray);
      setTopCategories(topCategoriesArray);

    } catch (error) {
      console.error('Error loading products report:', error);
    }
  };

  const loadCustomersReport = async () => {
    try {
      const { startDate, endDate } = calculateDateRange();

      // Obtener métricas de clientes
      const { data: customers, error } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('role', 'customer')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      if (error) throw error;

      // Obtener pedidos de clientes
      const { data: orders } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!inner (
            id,
            full_name
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Calcular métricas
      const newCustomers = customers?.length || 0;
      const totalOrdersCount = orders?.length || 0;
      
      // Clientes recurrentes
      const customerOrderCounts = {};
      orders?.forEach(order => {
        const customerId = order.profiles?.id;
        if (customerId) {
          customerOrderCounts[customerId] = (customerOrderCounts[customerId] || 0) + 1;
        }
      });
      
      const repeatCustomers = Object.values(customerOrderCounts).filter(count => count > 1).length;
      const repeatRate = newCustomers > 0 ? (repeatCustomers / newCustomers) * 100 : 0;

      // Clientes con más compras
      const topCustomers = Object.entries(customerOrderCounts)
        .map(([customerId, orderCount]) => {
          const customer = orders?.find(o => o.profiles?.id === customerId)?.profiles;
          return {
            id: customerId,
            name: customer?.full_name || 'Cliente',
            orders: orderCount,
            totalSpent: orders
              ?.filter(o => o.profiles?.id === customerId)
              .reduce((sum, o) => sum + (o.total || 0), 0) || 0
          };
        })
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 10);

      setCustomerMetrics({
        newCustomers,
        repeatCustomers,
        repeatRate,
        totalOrders: totalOrdersCount,
        topCustomers
      });

    } catch (error) {
      console.error('Error loading customers report:', error);
    }
  };

  const loadInventoryReport = async () => {
    try {
      // Obtener todos los productos
      const { data: products, error } = await supabase
        .from('products')
        .select('*');

      if (error) throw error;

      // Calcular métricas de inventario
      const totalProducts = products?.length || 0;
      const outOfStock = products?.filter(p => p.stock <= 0).length || 0;
      const lowStock = products?.filter(p => p.stock > 0 && p.stock <= (p.low_stock_threshold || 5)).length || 0;
      const inStock = products?.filter(p => p.stock > (p.low_stock_threshold || 5)).length || 0;
      
      const totalInventoryValue = products?.reduce((sum, p) => sum + (p.price * p.stock), 0) || 0;
      const averageStockValue = totalProducts > 0 ? totalInventoryValue / totalProducts : 0;

      // Productos que no se venden
      const { data: orderItems } = await supabase
        .from('order_items')
        .select('product_id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const soldProductIds = [...new Set(orderItems?.map(item => item.product_id))];
      const notSellingProducts = products?.filter(p => !soldProductIds.includes(p.id)).length || 0;

      setInventoryMetrics({
        totalProducts,
        outOfStock,
        lowStock,
        inStock,
        totalInventoryValue,
        averageStockValue,
        notSellingProducts,
        products: products?.map(p => ({
          ...p,
          inventoryValue: p.price * p.stock
        })) || []
      });

    } catch (error) {
      console.error('Error loading inventory report:', error);
    }
  };

  const calculateDateRange = () => {
    let endDate = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'custom':
        if (customDateRange.start) {
          startDate = new Date(customDateRange.start);
          endDate = customDateRange.end ? new Date(customDateRange.end) : new Date();
        }
        break;
    }

    return { startDate, endDate };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const exportReport = () => {
    let dataToExport = [];
    let filename = '';

    switch (reportType) {
      case 'sales':
        filename = `reporte_ventas_${new Date().toISOString().split('T')[0]}.csv`;
        dataToExport = salesData.map(item => ({
          'Fecha': item.date,
          'Ingresos': item.revenue,
          'Pedidos': item.orders,
          'Ticket Promedio': item.orders > 0 ? item.revenue / item.orders : 0
        }));
        break;
      case 'products':
        filename = `reporte_productos_${new Date().toISOString().split('T')[0]}.csv`;
        dataToExport = topProducts.map(item => ({
          'Producto': item.product?.name || 'N/A',
          'Categoría': item.product?.category?.name || 'N/A',
          'Cantidad Vendida': item.quantity,
          'Ingresos': item.revenue,
          'Promedio por Unidad': item.quantity > 0 ? item.revenue / item.quantity : 0
        }));
        break;
      case 'customers':
        filename = `reporte_clientes_${new Date().toISOString().split('T')[0]}.csv`;
        dataToExport = customerMetrics.topCustomers?.map(customer => ({
          'Cliente': customer.name,
          'Pedidos': customer.orders,
          'Total Gastado': customer.totalSpent,
          'Promedio por Pedido': customer.orders > 0 ? customer.totalSpent / customer.orders : 0
        })) || [];
        break;
      case 'inventory':
        filename = `reporte_inventario_${new Date().toISOString().split('T')[0]}.csv`;
        dataToExport = inventoryMetrics.products?.map(product => ({
          'Producto': product.name,
          'SKU': product.sku || 'N/A',
          'Stock': product.stock,
          'Precio': product.price,
          'Valor Inventario': product.inventoryValue,
          'Estado': product.stock <= 0 ? 'Sin stock' : 
                   product.stock <= (product.low_stock_threshold || 5) ? 'Stock bajo' : 'En stock'
        })) || [];
        break;
    }

    if (dataToExport.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const printReport = () => {
    window.print();
  };

  const getReportTitle = () => {
    const titles = {
      sales: 'Reporte de Ventas',
      products: 'Reporte de Productos',
      customers: 'Reporte de Clientes',
      inventory: 'Reporte de Inventario'
    };
    return titles[reportType] || 'Reporte';
  };

  return (
    <AdminLayout title={getReportTitle()}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            {getReportTitle()}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Análisis y métricas detalladas de tu tienda
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadReportData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={exportReport}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button
            onClick={printReport}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </button>
        </div>
      </div>

      {/* Selector de reporte y filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Tipo de reporte */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Reporte
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="sales">Ventas</option>
              <option value="products">Productos</option>
              <option value="customers">Clientes</option>
              <option value="inventory">Inventario</option>
            </select>
          </div>

          {/* Rango de fechas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rango de Fechas
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="day">Hoy</option>
              <option value="week">Última semana</option>
              <option value="month">Último mes</option>
              <option value="quarter">Último trimestre</option>
              <option value="year">Último año</option>
              <option value="custom">Personalizado</option>
            </select>
          </div>

          {/* Comparar con período anterior */}
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={compareWithPrevious}
                onChange={(e) => setCompareWithPrevious(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Comparar con período anterior
              </span>
            </label>
          </div>

          {/* Botón de aplicar filtros */}
          <div className="flex items-end">
            <button
              onClick={loadReportData}
              disabled={loading}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              <Filter className="w-4 h-4 inline mr-2" />
              Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Filtros personalizados */}
        {dateRange === 'custom' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de inicio
              </label>
              <input
                type="date"
                value={customDateRange.start}
                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Fecha de fin
              </label>
              <input
                type="date"
                value={customDateRange.end}
                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Contenido del reporte */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Generando reporte...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Reporte de Ventas */}
          {reportType === 'sales' && (
            <>
              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      +12.5%
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(salesData.reduce((sum, item) => sum + item.revenue, 0))}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ingresos Totales</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      +8.2%
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {conversionMetrics.totalOrders || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Pedidos</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      +5.1%
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(conversionMetrics.averageOrderValue || 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ticket Promedio</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <BarChart3 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-green-600 dark:text-green-400">
                      <TrendingUp className="w-4 h-4" />
                      +3.4%
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {(conversionMetrics.conversionRate || 0).toFixed(2)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tasa de Conversión</p>
                </div>
              </div>

              {/* Gráfico de ventas (simulado) */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Tendencia de Ventas
                </h3>
                <div className="h-80 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Gráfico de ventas por día (simulado)
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                      En una implementación real, aquí se mostraría un gráfico con Chart.js o Recharts
                    </p>
                  </div>
                </div>
              </div>

              {/* Tabla de ventas detallada */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    Ventas por Día
                  </h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Pedidos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Ingresos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Ticket Promedio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Tendencia
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {salesData.slice(-10).reverse().map((item, index) => {
                      const prevItem = salesData[salesData.length - 11 + index];
                      const growth = prevItem ? 
                        ((item.revenue - prevItem.revenue) / prevItem.revenue) * 100 : 0;
                      
                      return (
                        <tr key={item.date} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {item.orders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(item.revenue)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {formatCurrency(item.orders > 0 ? item.revenue / item.orders : 0)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              {growth > 0 ? (
                                <>
                                  <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
                                  <span className="text-sm text-green-600 dark:text-green-400">
                                    +{growth.toFixed(1)}%
                                  </span>
                                </>
                              ) : growth < 0 ? (
                                <>
                                  <TrendingDown className="w-4 h-4 text-red-600 dark:text-red-400" />
                                  <span className="text-sm text-red-600 dark:text-red-400">
                                    {growth.toFixed(1)}%
                                  </span>
                                </>
                              ) : (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Sin cambio
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Reporte de Productos */}
          {reportType === 'products' && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Productos más vendidos */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Productos Más Vendidos
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Top 10
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {topProducts.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No hay datos de ventas</p>
                      </div>
                    ) : (
                      topProducts.map((item, index) => (
                        <div key={item.product?.id || index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900/50">
                          <div className="flex items-center gap-3">
                            <div className="text-lg font-bold text-gray-400 dark:text-gray-600">
                              #{index + 1}
                            </div>
                            <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex-shrink-0">
                              {item.product?.image ? (
                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                                  <Package className="w-5 h-5 text-white" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white truncate max-w-xs">
                                {item.product?.name || 'Producto'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {item.product?.category?.name || 'Sin categoría'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <p className="font-bold text-gray-900 dark:text-white">
                              {item.quantity} unidades
                            </p>
                            <p className="text-sm text-purple-600 dark:text-purple-400">
                              {formatCurrency(item.revenue)}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Categorías más vendidas */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      Ventas por Categoría
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Distribución
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    {topCategories.length === 0 ? (
                      <div className="text-center py-8">
                        <PieChart className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No hay datos de categorías</p>
                      </div>
                    ) : (
                      topCategories.map((category, index) => {
                        const percentage = (category.revenue / topCategories.reduce((sum, c) => sum + c.revenue, 0)) * 100;
                        
                        return (
                          <div key={category.name} className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900 dark:text-white">
                                {category.name}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {percentage.toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                              <span>{category.quantity} unidades</span>
                              <span>{formatCurrency(category.revenue)}</span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Estadísticas de productos */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Métricas de Productos
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                      {topProducts.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Productos Vendidos
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                      {topProducts.reduce((sum, p) => sum + p.quantity, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Unidades Totales
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {formatCurrency(topProducts.reduce((sum, p) => sum + p.revenue, 0))}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Ingresos Totales
                    </div>
                  </div>
                  
                  <div className="text-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                      {topProducts.length > 0 
                        ? formatCurrency(topProducts.reduce((sum, p) => sum + p.revenue, 0) / topProducts.reduce((sum, p) => sum + p.quantity, 0))
                        : formatCurrency(0)
                      }
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Precio Promedio
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Reporte de Clientes */}
          {reportType === 'customers' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {customerMetrics.newCustomers || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Nuevos Clientes</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <Award className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {customerMetrics.repeatCustomers || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Clientes Recurrentes</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                      <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {(customerMetrics.repeatRate || 0).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Tasa de Retención</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                      <ShoppingCart className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {customerMetrics.totalOrders || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Pedidos Totales</p>
                </div>
              </div>

              {/* Top clientes */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Clientes con Más Compras
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Pedidos
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Gastado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Promedio por Pedido
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Última Compra
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {customerMetrics.topCustomers?.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            No hay datos de clientes
                          </td>
                        </tr>
                      ) : (
                        customerMetrics.topCustomers?.map((customer) => (
                          <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {customer.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {customer.orders}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                              {formatCurrency(customer.totalSpent)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {formatCurrency(customer.orders > 0 ? customer.totalSpent / customer.orders : 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              Hace 2 días
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Reporte de Inventario */}
          {reportType === 'inventory' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                      <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {inventoryMetrics.totalProducts || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Productos</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {inventoryMetrics.inStock || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">En Stock</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                      <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {inventoryMetrics.lowStock || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Stock Bajo</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-red-100 dark:bg-red-900/30">
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                    {inventoryMetrics.outOfStock || 0}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Sin Stock</p>
                </div>
              </div>

              {/* Valor del inventario */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Valor del Inventario
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                      {formatCurrency(inventoryMetrics.totalInventoryValue || 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Valor Total del Inventario
                    </div>
                  </div>
                  
                  <div className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-4">
                      {formatCurrency(inventoryMetrics.averageStockValue || 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Valor Promedio por Producto
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos que necesitan atención */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                  Productos que Necesitan Atención
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Producto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Acción
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {inventoryMetrics.products
                        ?.filter(p => p.stock <= (p.low_stock_threshold || 5))
                        .slice(0, 10)
                        .map((product) => (
                          <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden flex-shrink-0 mr-3">
                                  {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                                      <Package className="w-4 h-4 text-white" />
                                    </div>
                                  )}
                                </div>
                                <div className="font-medium text-gray-900 dark:text-white">
                                  {product.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                              {product.stock}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">
                              {formatCurrency(product.inventoryValue)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {product.stock <= 0 ? (
                                <span className="px-2 py-1 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-full">
                                  Sin Stock
                                </span>
                              ) : (
                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 rounded-full">
                                  Stock Bajo
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  // Navegar a la página del producto
                                  window.location.href = `/admin/products?edit=${product.id}`;
                                }}
                                className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                              >
                                <Edit className="w-4 h-4 inline mr-1" />
                                Reabastecer
                              </button>
                            </td>
                          </tr>
                        ))}
                      
                      {inventoryMetrics.products?.filter(p => p.stock <= (p.low_stock_threshold || 5)).length === 0 && (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            Todos los productos tienen stock suficiente
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReports;