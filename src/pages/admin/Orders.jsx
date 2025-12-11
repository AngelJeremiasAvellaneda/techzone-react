import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import {
  Search, Filter, Download, Eye, Edit, Trash2,
  CheckCircle, XCircle, Clock, Package, Truck,
  CreditCard, DollarSign, User, Calendar,
  ChevronDown, MoreVertical, RefreshCw, Printer,
  ExternalLink, FileText, AlertCircle, Mail, Phone,
  MapPin, Archive, CheckSquare, XSquare, Loader,
  ShoppingCart, BarChart, Tag, Percent, Building,
  CreditCard as CardIcon, CircleDollarSign, Banknote, Smartphone,
  Grid, List, Columns, Shield, AlertTriangle, QrCode,
  ClipboardCheck, Truck as TruckIcon, Home, Store, 
  ShoppingBag, ChevronLeft, ChevronRight, TrendingUp,
  Users, X, Check, AlertOctagon, Ban, Receipt,
  MessageSquare, Send, Copy, ExternalLink as ExternalLinkIcon,
  PhoneCall, Map, Navigation, Globe, FileSignature,
  Archive as ArchiveIcon, RotateCcw, Layers, CreditCard as CreditCardIcon
} from 'lucide-react';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from 'react-hot-toast';

const ConfirmationModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  type = "warning",
  loading = false 
}) => {
  if (!isOpen) return null;

  const iconMap = {
    warning: <AlertTriangle className="w-12 h-12 text-yellow-500" />,
    danger: <AlertOctagon className="w-12 h-12 text-red-500" />,
    info: <AlertCircle className="w-12 h-12 text-blue-500" />,
    success: <CheckCircle className="w-12 h-12 text-green-500" />
  };

  const bgColorMap = {
    warning: "bg-yellow-50",
    danger: "bg-red-50",
    info: "bg-blue-50",
    success: "bg-green-50"
  };

  const buttonColorMap = {
    warning: "bg-yellow-600 hover:bg-yellow-700",
    danger: "bg-red-600 hover:bg-red-700",
    info: "bg-blue-600 hover:bg-blue-700",
    success: "bg-green-600 hover:bg-green-700"
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              <div className={`p-4 rounded-full ${bgColorMap[type]} mb-4`}>
                {iconMap[type]}
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {message}
              </p>
              
              <div className="flex gap-3 w-full">
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                
                <button
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 px-4 py-3 text-white font-medium rounded-xl transition-colors ${buttonColorMap[type]} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                >
                  {loading ? (
                    <Loader className="w-5 h-5 animate-spin" />
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente de Quick Actions Bar
const QuickActionsBar = ({ onRefresh, onExport, loading }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl mb-6">
    <div className="flex items-center gap-2">
      <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <ShoppingBag className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      </div>
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white">Gestión de Pedidos</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">Administra y procesa todos los pedidos</p>
      </div>
    </div>
    
    <div className="flex items-center gap-2">
      <button
        onClick={onRefresh}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Actualizar</span>
      </button>
      
      <button
        onClick={onExport}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Exportar CSV</span>
      </button>
      
      <button className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors shadow-lg">
        <FileSignature className="w-4 h-4" />
        <span className="hidden sm:inline">Generar Reporte</span>
      </button>
    </div>
  </div>
);

// Componente de Stats Card Mejorado
const StatsCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        {trend && (
          <div className={`inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-full text-xs font-medium ${trend > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
            <TrendingUp className="w-3 h-3" />
            {trend > 0 ? '+' : ''}{trend}%
          </div>
        )}
        {subtitle && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

// Componente de Filtros Avanzados
const AdvancedFilters = ({ filters, setFilters, paymentMethods }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Monto mínimo (S/.)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="number"
            value={filters.minAmount}
            onChange={(e) => setFilters({ ...filters, minAmount: e.target.value })}
            placeholder="0.00"
            className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Monto máximo (S/.)
        </label>
        <div className="relative">
          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="number"
            value={filters.maxAmount}
            onChange={(e) => setFilters({ ...filters, maxAmount: e.target.value })}
            placeholder="9999.99"
            className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Método de pago
        </label>
        <select
          value={filters.paymentMethod}
          onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {paymentMethods.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
      </div>
    </div>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Buscar cliente
      </label>
      <div className="relative">
        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={filters.customer}
          onChange={(e) => setFilters({ ...filters, customer: e.target.value })}
          placeholder="Nombre, email o teléfono del cliente"
          className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>
    </div>
  </div>
);

const AdminOrders = () => {
  const { user } = useAuth();
  const userId = user?.id;

  const [showCancelReasonModal, setShowCancelReasonModal] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const CANCEL_REASONS = [
    "Pago no realizado",
    "Problemas de stock",
    "Problemas de envío",
    "Datos de dirección incorrectos",
    "Solicitud del cliente",
    "Otro (escribir motivo)"
  ];

  // Iniciar flujo de cancelación
  const startCancelWithReason = (orderId) => {
    setCancelOrderId(orderId);
    setShowCancelReasonModal(true);
  };

  // Confirmar cancelación
  const confirmCancelWithReason = async () => {
    if (!selectedReason) {
      return toast.error("Selecciona un motivo para cancelar.");
    }

    const finalReason =
      selectedReason === "Otro (escribir motivo)"
        ? customReason
        : selectedReason;

    // 1. Actualizar pedido
    await updateOrderStatus(cancelOrderId, "cancelled", finalReason);

    // 2. Obtener al cliente del pedido
    const { data: orderData } = await supabase
      .from("orders")
      .select("user_id")
      .eq("id", cancelOrderId)
      .single();

    // 3. Guardar notificación al cliente
    await supabase.from("notifications").insert({
      user_id: orderData.user_id,
      title: "Tu pedido fue cancelado",
      message: `Motivo: ${finalReason}`,
      type: "order"
    });

    toast.success("Pedido cancelado y cliente notificado.");

    // Cerrar modal
    setShowCancelReasonModal(false);
    setSelectedReason("");
    setCustomReason("");
  };

  const [open, setOpen] = useState(null);
  const menuRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
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
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    averageOrder: 0,
    cancelledOrders: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0
  });

  // Estados para modales y confirmaciones
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'warning',
    loading: false
  });

  // Estado para tracking number
  const [trackingModal, setTrackingModal] = useState({
    isOpen: false,
    orderId: null,
    trackingNumber: ''
  });

  // Estados de vista
  const [viewMode, setViewMode] = useState('table'); // 'table' o 'grid'
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Estados de filtros
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    paymentMethod: 'all',
    customer: '',
    showAdvanced: false
  });

  // Obtener todos los estados posibles
  const orderStatuses = [
    { value: 'all', label: 'Todos los estados', color: 'gray' },
    { value: 'pending', label: 'Pendiente', color: 'yellow', bgColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
    { value: 'confirmed', label: 'Confirmado', color: 'blue', bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: CheckCircle },
    { value: 'processing', label: 'Procesando', color: 'indigo', bgColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', icon: Package },
    { value: 'shipped', label: 'Enviado', color: 'purple', bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: Truck },
    { value: 'delivered', label: 'Entregado', color: 'green', bgColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
    { value: 'cancelled', label: 'Cancelado', color: 'red', bgColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
    { value: 'refunded', label: 'Reembolsado', color: 'orange', bgColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: DollarSign }
  ];

  const paymentMethods = [
    { value: 'all', label: 'Todos los métodos', icon: CreditCard },
    { value: 'cash', label: 'Efectivo', icon: CircleDollarSign, color: 'text-green-600' },
    { value: 'card', label: 'Tarjeta', icon: CardIcon, color: 'text-blue-600' },
    { value: 'transfer', label: 'Transferencia', icon: Banknote, color: 'text-purple-600' },
    { value: 'paypal', label: 'PayPal', icon: CreditCard, color: 'text-yellow-600' },
    { value: 'yape', label: 'Yape', icon: Smartphone, color: 'text-purple-600' },
    { value: 'plin', label: 'Plin', icon: Smartphone, color: 'text-red-600' }
  ];

  useEffect(() => {
    loadOrders();
    loadStats();
  }, [currentPage]);

  useEffect(() => {
    filterOrders();
  }, [searchTerm, statusFilter, dateRange, filters, orders]);

  // CORRECCIÓN: loadOrders actualizado para usar items de la tabla orders
  const loadOrders = async () => {
    setLoading(true);
    try {
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      // Traer pedidos con cliente y dirección
      const { data: ordersData, error: ordersError, count } = await supabase
        .from('orders')
        .select(`
          *,
          profiles:profiles (
            id,
            full_name,
            email,
            phone,
            avatar_url
          ),
          addresses:addresses (
            id,
            full_name,
            address,
            district,
            city,
            phone,
            delivery_instructions,
            address_type
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (ordersError) throw ordersError;

      // Parsear los items de cada pedido (almacenados en JSONB)
      const ordersWithParsedItems = ordersData.map(order => {
        let items = [];
        if (order.items) {
          try {
            // Si items es string, parsear a JSON
            items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
          } catch (e) {
            console.error('Error parsing order items:', e);
            items = [];
          }
        }
        return {
          ...order,
          items: items
        };
      });

      setOrders(ordersWithParsedItems);
      setTotalOrders(count || 0);

      toast.success('Pedidos cargados correctamente', {
        icon: '✅',
        style: {
          borderRadius: '12px',
          background: '#10B981',
          color: '#fff',
        }
      });

    } catch (err) {
      console.error("Error loading orders:", err.message);
      toast.error("Error al cargar pedidos", {
        icon: '❌',
        style: {
          borderRadius: '12px',
          background: '#EF4444',
          color: '#fff',
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Obtener estadísticas generales
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('total, status, created_at');

      if (ordersError) throw ordersError;

      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
      const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

      const totalRevenue = ordersData.reduce((sum, order) => sum + parseFloat(order.total || 0), 0);
      const totalOrdersCount = ordersData.length;
      const pendingOrders = ordersData.filter(order => order.status === 'pending').length;
      const deliveredOrders = ordersData.filter(order => order.status === 'delivered').length;
      const cancelledOrders = ordersData.filter(order => order.status === 'cancelled').length;
      const averageOrder = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

      // Calcular ingresos del mes actual
      const thisMonthRevenue = ordersData
        .filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === thisMonth && orderDate.getFullYear() === thisYear;
        })
        .reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

      // Calcular ingresos del mes anterior
      const lastMonthRevenue = ordersData
        .filter(order => {
          const orderDate = new Date(order.created_at);
          return orderDate.getMonth() === lastMonth && orderDate.getFullYear() === lastMonthYear;
        })
        .reduce((sum, order) => sum + parseFloat(order.total || 0), 0);

      setStats({
        totalRevenue,
        totalOrders: totalOrdersCount,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        averageOrder,
        thisMonthRevenue,
        lastMonthRevenue
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // CORRECCIÓN: filterOrders actualizado para usar items
  const filterOrders = () => {
    let filtered = [...orders];

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order.id?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.profiles?.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tracking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items?.some(item =>
          item.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.created_at);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate >= startDate;
      });
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
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
        order.profiles?.email?.toLowerCase().includes(filters.customer.toLowerCase()) ||
        order.profiles?.phone?.toLowerCase().includes(filters.customer.toLowerCase())
      );
    }

    setFilteredOrders(filtered);
  };

  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { label: 'Pendiente', color: 'yellow', bgColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: Clock },
      confirmed: { label: 'Confirmado', color: 'blue', bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: CheckCircle },
      processing: { label: 'Procesando', color: 'indigo', bgColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300', icon: Package },
      shipped: { label: 'Enviado', color: 'purple', bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: Truck },
      delivered: { label: 'Entregado', color: 'green', bgColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
      cancelled: { label: 'Cancelado', color: 'red', bgColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: XCircle },
      refunded: { label: 'Reembolsado', color: 'orange', bgColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300', icon: DollarSign }
    };
    return statusMap[status] || { label: status, color: 'gray', bgColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300', icon: Package };
  };

  const getPaymentMethodInfo = (method) => {
    const methods = {
      cash: { label: 'Efectivo', color: 'green', bgColor: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CircleDollarSign },
      card: { label: 'Tarjeta', color: 'blue', bgColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300', icon: CardIcon },
      transfer: { label: 'Transferencia', color: 'purple', bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: Banknote },
      paypal: { label: 'PayPal', color: 'yellow', bgColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300', icon: CreditCard },
      yape: { label: 'Yape', color: 'purple', bgColor: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300', icon: Smartphone },
      plin: { label: 'Plin', color: 'red', bgColor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: Smartphone }
    };
    return methods[method] || { label: method, color: 'gray', bgColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300', icon: CreditCard };
  };

  const showConfirmation = (title, message, onConfirm, type = 'warning') => {
    setConfirmationModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
      loading: false
    });
  };

  // CORRECCIÓN: updateOrderStatus actualizado para restaurar stock al cancelar
  const updateOrderStatus = async (orderId, newStatus, reason = '') => {
    if (selectedOrder?.status === "cancelled") {
      toast.error("No puedes modificar un pedido que ya está cancelado.", {
        icon: "⚠️",
        style: {
          borderRadius: "12px",
          background: "#F59E0B",
          color: "#fff",
        },
      });
      return;
    }

    setUpdatingStatus(orderId);

    try {
      // Si estamos cancelando, restaurar stock primero
      if (newStatus === 'cancelled') {
        await restoreOrderStock(orderId);
      }

      const updateData = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      // Si es cancelación, agregar razón y timestamp
      if (newStatus === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancellation_reason = reason || 'Cancelado por el administrador';
        updateData.payment_status = 'cancelled';
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;

      // Actualiza lista de pedidos
      setOrders(prev =>
        prev.map(o =>
          o.id === orderId ? { ...o, ...updateData } : o
        )
      );

      // Actualiza modal si está abierto
      setSelectedOrder(prev =>
        prev && prev.id === orderId ? { ...prev, ...updateData } : prev
      );

      loadStats();

      toast.success(`Estado cambiado a "${getStatusInfo(newStatus).label}"`, {
        icon: '✅',
        style: {
          borderRadius: '12px',
          background: '#10B981',
          color: '#fff',
        }
      });

    } catch (err) {
      console.error("Error updating order status:", err);

      toast.error("Error al actualizar el estado", {
        icon: '❌',
        style: {
          borderRadius: '12px',
          background: '#EF4444',
          color: '#fff',
        }
      });

    } finally {
      setUpdatingStatus(null);
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  // CORRECCIÓN: Función para restaurar stock
  const restoreOrderStock = async (orderId) => {
    try {
      // Obtener el pedido
      const { data: order, error } = await supabase
        .from('orders')
        .select('items')
        .eq('id', orderId)
        .single();
      
      if (error) throw error;

      if (!order.items) return;

      // Parsear items si es necesario
      let items = order.items;
      if (typeof items === 'string') {
        try {
          items = JSON.parse(items);
        } catch (e) {
          console.error('Error parsing items:', e);
          return;
        }
      }

      // Restaurar stock para cada producto
      for (const item of items) {
        if (!item.product_id || !item.quantity) continue;
        
        try {
          // Obtener producto actual
          const { data: product, error: prodError } = await supabase
            .from('products')
            .select('stock')
            .eq('id', item.product_id)
            .single();
          
          if (prodError) {
            console.error(`Error obteniendo producto ${item.product_id}:`, prodError);
            continue;
          }

          // Calcular nuevo stock
          const newStock = (product.stock || 0) + (item.quantity || 0);

          // Actualizar stock
          await supabase
            .from('products')
            .update({ 
              stock: newStock, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', item.product_id);

          console.log(`Stock restaurado: Producto ${item.product_id}, +${item.quantity} unidades`);
        } catch (itemError) {
          console.error(`Error restaurando stock del producto ${item.product_id}:`, itemError);
        }
      }
    } catch (error) {
      console.error('Error restoring order stock:', error);
    }
  };

  const cancelOrder = async (orderId) => {
    showConfirmation(
      'Cancelar Pedido',
      '¿Estás seguro de que quieres cancelar este pedido? El stock será restaurado y el cliente será notificado.',
      () => startCancelWithReason(orderId),
      'danger'
    );
  };

  const deleteOrder = async (orderId) => {
    showConfirmation(
      'Eliminar Pedido Permanentemente',
      '⚠️ Esta acción NO se puede deshacer. Se eliminará el pedido y todos sus datos asociados de la base de datos. ¿Estás completamente seguro?',
      async () => {
        setConfirmationModal(prev => ({ ...prev, loading: true }));
        try {
          // Primero restaurar stock
          await restoreOrderStock(orderId);

          // Luego eliminar el pedido
          const { error } = await supabase
            .from('orders')
            .delete()
            .eq('id', orderId);

          if (error) throw error;

          setOrders(orders.filter(order => order.id !== orderId));
          setTotalOrders(prev => prev - 1);
          
          if (selectedOrder && selectedOrder.id === orderId) {
            setShowDetails(false);
            setSelectedOrder(null);
          }
          
          loadStats();
          
          toast.success('Pedido eliminado permanentemente', {
            icon: '🗑️',
            style: {
              borderRadius: '12px',
              background: '#10B981',
              color: '#fff',
            }
          });
        } catch (error) {
          console.error('Error deleting order:', error);
          toast.error('Error al eliminar el pedido', {
            icon: '❌',
            style: {
              borderRadius: '12px',
              background: '#EF4444',
              color: '#fff',
            }
          });
        } finally {
          setConfirmationModal({ ...confirmationModal, isOpen: false });
        }
      },
      'danger'
    );
  };

  // CORRECCIÓN: viewOrderDetails actualizado para usar items
  const viewOrderDetails = async (orderId) => {
    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // PERFIL
      const { data: userData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', orderData.user_id)
        .single();

      // DIRECCIÓN – SOLO SI TIENE address_id
      let addressData = null;
      if (orderData.address_id !== null) {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('id', orderData.address_id)
          .single();

        if (!error) addressData = data;
      }

      // Parsear items si es necesario
      let items = [];
      if (orderData.items) {
        try {
          items = typeof orderData.items === 'string' ? JSON.parse(orderData.items) : orderData.items;
        } catch (e) {
          console.error('Error parsing items:', e);
          items = [];
        }
      }

      // SET ORDER FINAL
      setSelectedOrder({
        ...orderData,
        profiles: userData || null,
        addresses: addressData,
        items: items
      });

      setShowDetails(true);

    } catch (error) {
      console.error('Error loading order details:', error);
      toast.error('Error al cargar los detalles');
    }
  };

  // CORRECCIÓN: generateInvoice actualizado para usar items
  const generateInvoice = async (order) => {
    try {
      const doc = new jsPDF({
        format: "a4",
        unit: "pt",
      });

      const margin = 40;
      const pageWidth = doc.internal.pageSize.getWidth();

      // Título
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("COMPROBANTE DE PEDIDO", pageWidth / 2, 70, { align: "center" });

      // Datos de la empresa
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      const companyInfo = [
        "TechZone Store",
        "RUC: 20745612391",
        "Av. Los Jardines 320 - Huancayo, Perú",
        "Tel: +51 987 654 321",
        "Email: contacto@techzone.com",
      ];

      companyInfo.forEach((line, i) => {
        doc.text(line, margin, 140 + i * 15);
      });

      // Línea divisoria
      doc.setLineWidth(1);
      doc.line(margin, 220, pageWidth - margin, 220);

      // Datos del cliente y envío
      const customer = order.profiles || {};
      const address = order.addresses || {};

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Datos del Cliente", margin, 250);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      const customerInfo = [
        `Nombre: ${customer.full_name || "N/A"}`,
        `Email: ${customer.email || "N/A"}`,
        `Teléfono: ${customer.phone || "N/A"}`,
      ];

      customerInfo.forEach((line, i) => {
        doc.text(line, margin, 270 + i * 15);
      });

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Dirección de Envío", pageWidth / 2, 250);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);

      const shippingInfo = [
        `${address.full_name || customer.full_name || "N/A"}`,
        `${address.address || "N/A"}`,
        `${address.district || ""} - ${address.city || ""}`,
        `${address.phone || customer.phone || "N/A"}`,
      ];

      shippingInfo.forEach((line, i) => {
        doc.text(line, pageWidth / 2, 270 + i * 15);
      });

      // Detalles del pedido - usar items
      const tableData = order.items?.map((item) => [
        item.name || "Producto",
        item.quantity,
        `S/. ${item.price?.toFixed(2) || "0.00"}`,
        `S/. ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}`,
      ]) || [];

      autoTable(doc, {
        startY: 350,
        head: [["Producto", "Cant.", "P. Unit.", "Subtotal"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [30, 41, 59],
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        styles: {
          fontSize: 10,
          cellPadding: 6,
        },
      });

      // Totales
      const y = doc.lastAutoTable.finalY + 25;

      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      const totals = [
        ["Subtotal:", order.subtotal?.toFixed(2) || "0.00"],
        ["Envío:", order.shipping_cost?.toFixed(2) || "0.00"],
        ["Impuestos:", order.tax_amount?.toFixed(2) || "0.00"],
        ["Descuento:", order.discount_amount?.toFixed(2) || "0.00"],
      ];

      totals.forEach(([label, value], i) => {
        doc.text(label, pageWidth - 200, y + i * 15);
        doc.text(`S/. ${value}`, pageWidth - 110, y + i * 15);
      });

      // TOTAL FINAL
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("TOTAL:", pageWidth - 200, y + 85);
      doc.text(`S/. ${order.total?.toFixed(2) || "0.00"}`, pageWidth - 110, y + 85);

      // Información del pedido
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");

      const infoY = y + 120;

      doc.text(`Pedido N°: ${order.id}`, margin, infoY);
      doc.text(`Fecha: ${new Date(order.created_at).toLocaleDateString("es-PE")}`, margin, infoY + 15);
      doc.text(`Estado: ${getStatusInfo(order.status).label}`, margin, infoY + 30);
      doc.text(`Método de Pago: ${getPaymentMethodInfo(order.payment_method).label}`, margin, infoY + 45);

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(10);
      doc.text("Gracias por su compra — TechZone Store", pageWidth / 2, 800, { align: "center" });

      // Guardar PDF
      const fileName = `comprobante_pedido_${order.id}.pdf`;
      doc.save(fileName);

      toast.success("Comprobante generado", {
        icon: '📄',
        style: {
          borderRadius: '12px',
          background: '#10B981',
          color: '#fff',
        }
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      toast.error("Error al generar comprobante", {
        icon: '❌',
        style: {
          borderRadius: '12px',
          background: '#EF4444',
          color: '#fff',
        }
      });
    }
  };

  const exportOrders = () => {
    const dataToExport = filteredOrders.map(order => ({
      'ID': order.id,
      'Fecha': new Date(order.created_at).toLocaleDateString('es-PE'),
      'Cliente': order.profiles?.full_name || 'N/A',
      'Email': order.profiles?.email || 'N/A',
      'Teléfono': order.profiles?.phone || 'N/A',
      'Estado': getStatusInfo(order.status).label,
      'Método de Pago': getPaymentMethodInfo(order.payment_method).label,
      'Subtotal': `S/. ${order.subtotal?.toFixed(2) || '0.00'}`,
      'Envío': `S/. ${order.shipping_cost?.toFixed(2) || '0.00'}`,
      'Impuesto': `S/. ${order.tax_amount?.toFixed(2) || '0.00'}`,
      'Descuento': `S/. ${order.discount_amount?.toFixed(2) || '0.00'}`,
      'Total': `S/. ${order.total?.toFixed(2)}`,
      'Productos': order.items?.length || 0,
      'Dirección': order.addresses?.address || 'N/A',
      'Ciudad': order.addresses?.city || 'N/A',
      'Distrito': order.addresses?.district || 'N/A',
      'N° Seguimiento': order.tracking_number || 'N/A'
    }));

    const csvContent = [
      Object.keys(dataToExport[0]).join(','),
      ...dataToExport.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `reporte_pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Reporte exportado', {
      icon: '📊',
      style: {
        borderRadius: '12px',
        background: '#10B981',
        color: '#fff',
      }
    });
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    showConfirmation(
      'Acción Masiva',
      `¿Estás seguro de que quieres cambiar el estado de ${selectedOrders.length} pedido(s) seleccionados a "${orderStatuses.find(s => s.value === bulkAction)?.label}"?`,
      async () => {
        try {
          // Si estamos cancelando pedidos, restaurar stock para cada uno
          if (bulkAction === 'cancelled') {
            for (const orderId of selectedOrders) {
              await restoreOrderStock(orderId);
            }
          }

          const { error } = await supabase
            .from('orders')
            .update({ 
              status: bulkAction,
              updated_at: new Date().toISOString(),
              ...(bulkAction === 'cancelled' ? {
                cancelled_at: new Date().toISOString(),
                cancellation_reason: 'Cancelado masivamente por el administrador',
                payment_status: 'cancelled'
              } : {})
            })
            .in('id', selectedOrders);

          if (error) throw error;

          setOrders(orders.map(order =>
            selectedOrders.includes(order.id) ? { 
              ...order, 
              status: bulkAction,
              ...(bulkAction === 'cancelled' ? {
                cancelled_at: new Date().toISOString(),
                cancellation_reason: 'Cancelado masivamente por el administrador',
                payment_status: 'cancelled'
              } : {})
            } : order
          ));

          loadStats();
          setSelectedOrders([]);
          setBulkAction('');
          
          toast.success(`${selectedOrders.length} pedidos actualizados`, {
            icon: '✅',
            style: {
              borderRadius: '12px',
              background: '#10B981',
              color: '#fff',
            }
          });
        } catch (error) {
          console.error('Error updating bulk orders:', error);
          toast.error('Error al actualizar pedidos', {
            icon: '❌',
            style: {
              borderRadius: '12px',
              background: '#EF4444',
              color: '#fff',
            }
          });
        }
      },
      'info'
    );
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

  const updateTrackingNumber = async (orderId, trackingNumber) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          tracking_number: trackingNumber,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(orders.map(order =>
        order.id === orderId ? { ...order, tracking_number: trackingNumber } : order
      ));

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, tracking_number: trackingNumber });
      }

      toast.success('Número de seguimiento actualizado', {
        icon: '📦',
        style: {
          borderRadius: '12px',
          background: '#10B981',
          color: '#fff',
        }
      });
    } catch (error) {
      console.error('Error updating tracking number:', error);
      toast.error('Error al actualizar seguimiento', {
        icon: '❌',
        style: {
          borderRadius: '12px',
          background: '#EF4444',
          color: '#fff',
        }
      });
    }
  };

  const openTrackingModal = (orderId, currentTracking = '') => {
    setTrackingModal({
      isOpen: true,
      orderId,
      trackingNumber: currentTracking
    });
  };

  const handleTrackingSubmit = () => {
    if (trackingModal.orderId) {
      updateTrackingNumber(trackingModal.orderId, trackingModal.trackingNumber);
      setTrackingModal({ isOpen: false, orderId: null, trackingNumber: '' });
    }
  };

  const totalPages = Math.ceil(totalOrders / itemsPerPage);

  // CORRECCIÓN: renderOrderRow actualizado para usar items
  const renderOrderRow = (order) => {
    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;
    const paymentInfo = getPaymentMethodInfo(order.payment_method);
    const PaymentIcon = paymentInfo.icon;
    const customerName = order.profiles?.full_name || 'Cliente';
    const productCount = order.items?.length || 0;
    const isExpanded = expandedOrderId === order.id;

    return (
      <React.Fragment key={order.id}>
        <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
          <td className="px-4 py-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedOrders.includes(order.id)}
                onChange={() => toggleSelectOrder(order.id)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
            </div>
          </td>
          
          <td className="px-4 py-4">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                <span className="text-sm opacity-75">#</span>{order.id}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                <Calendar className="inline w-3 h-3 mr-1" />
                {new Date(order.created_at).toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </td>
          
          <td className="px-4 py-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-3">
                {customerName.charAt(0)}
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {customerName}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                  <Mail className="w-3 h-3" />
                  {order.profiles?.email || 'Sin email'}
                </div>
              </div>
            </div>
          </td>
          
          <td className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {productCount} {productCount === 1 ? 'producto' : 'productos'}
              </div>
              <button
                onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <ChevronDown className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </td>
          
          <td className="px-4 py-4">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              S/. {parseFloat(order.total || 0).toFixed(2)}
            </div>
          </td>
          
          <td className="px-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${statusInfo.bgColor}`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusInfo.label}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 ${paymentInfo.bgColor}`}>
                  <PaymentIcon className="w-3 h-3" />
                  {paymentInfo.label}
                </div>
              </div>
            </div>
          </td>
          
          <td className="px-4 py-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => viewOrderDetails(order.id)}
                className="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                title="Ver detalles"
              >
                <Eye className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => generateInvoice(order)}
                className="p-2.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors"
                title="Generar comprobante"
              >
                <FileText className="w-4 h-4" />
              </button>
              
            </div>
          </td>
        </tr>
        
        {/* Expanded row with order items */}
        {isExpanded && (
          <tr className="bg-gray-50 dark:bg-gray-900/30">
            <td colSpan="7" className="px-4 py-4">
              <div className="pl-14 pr-4">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-3">Productos del pedido:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg overflow-hidden flex items-center justify-center">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white truncate">
                            {item.name || 'Producto'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {item.quantity} × S/. {item.price?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                        <div className="font-bold text-gray-900 dark:text-white">
                          S/. {((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Total productos:</span> {productCount}
                    </div>
                    <div className="font-bold text-lg text-gray-900 dark:text-white">
                      Total: S/. {parseFloat(order.total || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </td>
          </tr>
        )}
      </React.Fragment>
    );
  };

  return (
    <div className="space-y-6">
      {showCancelReasonModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999]">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-[420px]">
            <h2 className="text-xl font-semibold mb-4">Motivo de cancelación</h2>

            <select
              className="w-full p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
            >
              <option value="">Selecciona un motivo</option>
              {CANCEL_REASONS.map((reason) => (
                <option key={reason} value={reason}>{reason}</option>
              ))}
            </select>

            {selectedReason === "Otro (escribir motivo)" && (
              <textarea
                className="w-full mt-3 p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
                placeholder="Escribe el motivo..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCancelReasonModal(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>

              <button
                onClick={confirmCancelWithReason}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Bar */}
      <QuickActionsBar onRefresh={loadOrders} onExport={exportOrders} loading={loading} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Ingresos Totales" 
          value={`S/. ${stats.totalRevenue.toFixed(2)}`} 
          icon={DollarSign} 
          color="text-green-600"
          subtitle="Todos los pedidos"
        />
        
        <StatsCard 
          title="Total Pedidos" 
          value={stats.totalOrders} 
          icon={ShoppingCart} 
          color="text-blue-600"
          trend={10}
        />
        
        <StatsCard 
          title="Pendientes" 
          value={stats.pendingOrders} 
          icon={Clock} 
          color="text-yellow-600"
          subtitle="Por procesar"
        />
        
        <StatsCard 
          title="Entregados" 
          value={stats.deliveredOrders} 
          icon={CheckCircle} 
          color="text-green-600"
          trend={5}
        />
      </div>

      {/* Filtros y Búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
                placeholder="ID, cliente, email, teléfono..."
                className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Fecha fin */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fecha hasta
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="pl-10 w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Filtros avanzados */}
        <div className="mt-4">
          <button
            onClick={() => setFilters({ ...filters, showAdvanced: !filters.showAdvanced })}
            className="flex items-center gap-2 text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
          >
            <Filter className="w-4 h-4" />
            {filters.showAdvanced ? 'Ocultar filtros avanzados' : 'Mostrar filtros avanzados'}
            <ChevronDown className={`w-4 h-4 transform transition-transform ${filters.showAdvanced ? 'rotate-180' : ''}`} />
          </button>

          {filters.showAdvanced && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <AdvancedFilters filters={filters} setFilters={setFilters} paymentMethods={paymentMethods} />
            </div>
          )}
        </div>
      </div>

      {/* Acciones masivas */}
      {selectedOrders.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-gray-800 rounded-xl">
                <CheckSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="font-bold text-gray-900 dark:text-white">
                  {selectedOrders.length} pedidos seleccionados
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Realiza acciones masivas sobre los pedidos seleccionados
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="pl-4 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                >
                  <option value="">Seleccionar acción...</option>
                  <option value="confirmed">Marcar como Confirmado</option>
                  <option value="processing">Marcar como Procesando</option>
                  <option value="shipped">Marcar como Enviado</option>
                  <option value="delivered">Marcar como Entregado</option>
                  <option value="cancelled">Cancelar pedidos</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Aplicar acción
              </button>
              
              <button
                onClick={() => setSelectedOrders([])}
                className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Limpiar selección
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vista de pedidos */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header de la tabla */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Pedidos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredOrders.length} de {totalOrders} pedidos encontrados
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <List className="w-4 h-4 inline mr-2" />
                Tabla
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
              >
                <Grid className="w-4 h-4 inline mr-2" />
                Tarjetas
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">Cargando pedidos...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-20 h-20 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              No se encontraron pedidos
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {searchTerm || statusFilter !== 'all' || dateRange.start || dateRange.end
                ? 'Intenta con otros filtros de búsqueda'
                : 'No hay pedidos registrados todavía'}
            </p>
            <button
              onClick={loadOrders}
              className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
            >
              Recargar pedidos
            </button>
          </div>
        ) : viewMode === 'table' ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID / Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Productos
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Estado / Pago
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredOrders.map(renderOrderRow)}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Mostrando <span className="font-bold">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                <span className="font-bold">{Math.min(currentPage * itemsPerPage, totalOrders)}</span> de{' '}
                <span className="font-bold">{totalOrders}</span> pedidos
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                
                <div className="flex items-center gap-1">
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
                        className={`w-10 h-10 rounded-xl font-medium ${
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
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        ) : (
          // Vista de tarjetas (grid)
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const StatusIcon = statusInfo.icon;
                const paymentInfo = getPaymentMethodInfo(order.payment_method);
                const PaymentIcon = paymentInfo.icon;
                const customerName = order.profiles?.full_name || 'Cliente';
                
                return (
                  <div key={order.id} className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Pedido #{order.id}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {new Date(order.created_at).toLocaleDateString('es-PE')}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelectOrder(order.id)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </div>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                        {customerName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 dark:text-white">{customerName}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{order.profiles?.email}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon className="w-4 h-4" />
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          S/. {parseFloat(order.total || 0).toFixed(2)}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <PaymentIcon className="w-4 h-4" />
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${paymentInfo.bgColor}`}>
                          {paymentInfo.label}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => viewOrderDetails(order.id)}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                      <button
                        onClick={() => generateInvoice(order)}
                        className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Factura
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modal de detalles del pedido */}
      {showDetails && selectedOrder && (
        <div className="fixed inset-0 z-[99] overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del modal */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <ShoppingBag className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                          Pedido #{selectedOrder.id}
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
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => generateInvoice(selectedOrder)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                    >
                      <FileText className="w-4 h-4" />
                      Generar Comprobante
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                      title="Imprimir"
                    >
                      <Printer className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Contenido del modal */}
              <div className="p-8">
                {/* Información del cliente y envío */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Información del cliente */}
                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Información del Cliente
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Nombre completo</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                          {selectedOrder.profiles?.full_name || 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {selectedOrder.profiles?.email || 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Teléfono</p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {selectedOrder.profiles?.phone || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dirección de envío */}
                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
                      Dirección de Envío
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Destinatario</p>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                          {selectedOrder.addresses?.full_name || selectedOrder.profiles?.full_name || 'No especificado'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dirección</p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1">
                          {selectedOrder.addresses?.address || 'No especificado'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                          <Navigation className="w-4 h-4" />
                          {selectedOrder.addresses?.district}, {selectedOrder.addresses?.city}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Teléfono de contacto</p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                          <PhoneCall className="w-4 h-4" />
                          {selectedOrder.addresses?.phone || selectedOrder.profiles?.phone || 'No especificado'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Información del pedido */}
                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      Resumen del Pedido
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Estado actual</p>
                        <div className="flex items-center gap-2 mt-1">
                          {(() => {
                            const statusInfo = getStatusInfo(selectedOrder.status);
                            const StatusIcon = statusInfo.icon;
                            return (
                              <>
                                <StatusIcon className="w-5 h-5" />
                                <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${statusInfo.bgColor}`}>
                                  {statusInfo.label}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Método de pago</p>
                        <p className="font-medium text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                          {(() => {
                            const paymentInfo = getPaymentMethodInfo(selectedOrder.payment_method);
                            const PaymentIcon = paymentInfo.icon;
                            return (
                              <>
                                <PaymentIcon className="w-5 h-5" />
                                {paymentInfo.label}
                              </>
                            );
                          })()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">N° Seguimiento</p>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="text"
                            value={selectedOrder.tracking_number || ''}
                            onChange={(e) => setSelectedOrder({...selectedOrder, tracking_number: e.target.value})}
                            onBlur={() => updateTrackingNumber(selectedOrder.id, selectedOrder.tracking_number)}
                            placeholder="Agregar número de seguimiento"
                            className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                          />
                          <TruckIcon className="w-5 h-5 text-blue-500" />
                        </div>
                      </div>
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                          <span className="font-bold text-gray-900 dark:text-white">S/. {parseFloat(selectedOrder.subtotal || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Envío</span>
                          <span className="font-bold text-gray-900 dark:text-white">S/. {parseFloat(selectedOrder.shipping_cost || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-gray-600 dark:text-gray-400">Descuento</span>
                          <span className="font-bold text-red-600 dark:text-red-400">- S/. {parseFloat(selectedOrder.discount_amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                          <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                            S/. {parseFloat(selectedOrder.total || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Productos del pedido */}
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Package className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    Productos ({selectedOrder.items?.length || 0})
                  </h3>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900/50">
                          <tr>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                              Producto
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                              Precio Unitario
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                              Cantidad
                            </th>
                            <th className="px-6 py-4 text-left text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                              Subtotal
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                          {selectedOrder.items?.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-900/50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                                    {item.image ? (
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="w-8 h-8 text-white" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <div className="font-bold text-gray-900 dark:text-white">
                                      {item.name || 'Producto'}
                                    </div>
                                    {item.specifications && (
                                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {Object.entries(item.specifications).slice(0, 2).map(([key, value]) => (
                                          <span key={key} className="inline-block bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded mr-2 mb-1">
                                            {key}: {value}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-lg font-bold text-gray-900 dark:text-white">
                                S/. {parseFloat(item.price || 0).toFixed(2)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-xl">
                                  <span className="text-lg font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                                  <span className="text-gray-500 dark:text-gray-400">unidades</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-xl font-bold text-purple-600 dark:text-purple-400">
                                S/. {(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                          <tr>
                            <td colSpan="3" className="px-6 py-6 text-right text-lg font-bold text-gray-900 dark:text-white">
                              Total del pedido:
                            </td>
                            <td className="px-6 py-6 text-2xl font-bold text-purple-600 dark:text-purple-400">
                              S/. {parseFloat(selectedOrder.total || 0).toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Acciones rápidas */}
                <div className="mt-8">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <ClipboardCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    Acciones Rápidas
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {orderStatuses
                      .filter(s => s.value !== 'all' && s.value !== selectedOrder.status && s.value !== 'cancelled')
                      .slice(0, 3)
                      .map((status) => (
                        <button
                          key={status.value}
                          onClick={() => showConfirmation(
                            `Cambiar estado a ${status.label}`,
                            `¿Cambiar el estado del pedido #${selectedOrder.id} a "${status.label}"?`,
                            () => updateOrderStatus(selectedOrder.id, status.value),
                            'info'
                          )}
                          disabled={updatingStatus === selectedOrder.id}
                          className="flex items-center gap-3 px-6 py-3.5 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                        >
                          {updatingStatus === selectedOrder.id ? (
                            <Loader className="w-5 h-5 animate-spin" />
                          ) : (
                            <status.icon className="w-5 h-5" />
                          )}
                          <span className="font-medium">Marcar como {status.label}</span>
                        </button>
                      ))}

                    <button
                      onClick={() => startCancelWithReason(selectedOrder.id)}
                      className="flex items-center gap-3 px-6 py-3.5 bg-red-50 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                      <span className="font-medium">Cancelar Pedido</span>
                    </button>

                    <button
                      onClick={() => deleteOrder(selectedOrder.id)}
                      className="flex items-center gap-3 px-6 py-3.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                      <span className="font-medium">Eliminar Permanentemente</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ ...confirmationModal, isOpen: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        loading={confirmationModal.loading}
        confirmText={confirmationModal.type === 'danger' ? 'Eliminar' : 'Confirmar'}
        cancelText="Cancelar"
      />

      {/* Modal para tracking number */}
      {trackingModal.isOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TruckIcon className="w-6 h-6 text-blue-600" />
                    Número de Seguimiento
                  </h3>
                  <button
                    onClick={() => setTrackingModal({ isOpen: false, orderId: null, trackingNumber: '' })}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Ingrese el número de seguimiento:
                    </label>
                    <input
                      type="text"
                      value={trackingModal.trackingNumber}
                      onChange={(e) => setTrackingModal({ ...trackingModal, trackingNumber: e.target.value })}
                      placeholder="Ej: ABC123456789XYZ"
                      className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      autoFocus
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <button
                      onClick={() => setTrackingModal({ isOpen: false, orderId: null, trackingNumber: '' })}
                      className="flex-1 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancelar
                    </button>
                    
                    <button
                      onClick={handleTrackingSubmit}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;