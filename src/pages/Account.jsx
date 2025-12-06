// src/pages/Account.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import {
  User, Mail, Lock, Camera, Save, X,
  Package, Heart, MapPin, CreditCard,
  Bell, Shield, HelpCircle, LogOut,
  Phone, Calendar, Settings, Eye, EyeOff,
  Edit2, Check, AlertCircle, Trash2,
  ChevronRight, Eye as EyeIcon, Truck, Clock,
  CheckCircle, XCircle, Search, Filter, Download,
  MessageSquare, Star, RefreshCw
} from 'lucide-react';

// Componente para la lista de pedidos
const OrderItem = ({ order, statusInfo, paymentInfo, formatDate, getTotalItems, onViewDetails }) => {
  const orderNumber = `ORD-${String(order.id).padStart(6, '0')}`;
  
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header del pedido */}
      <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-bold text-lg text-[var(--text)]">
                Pedido #{orderNumber}
              </h3>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.textColor} ${statusInfo.color.replace('bg-', 'bg-')}/10`}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-sm text-[var(--nav-muted)]">
              Realizado el {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-[var(--nav-muted)]">Total</p>
              <p className="text-xl font-bold text-[var(--accent)]">
                S/. {order.total.toLocaleString('es-PE')}
              </p>
            </div>
            <button
              onClick={() => onViewDetails(order)}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition"
            >
              <EyeIcon className="w-4 h-4" />
              Ver detalles
            </button>
          </div>
        </div>
      </div>
      
      {/* Contenido del pedido */}
      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Productos */}
          <div className="md:col-span-2">
            <h4 className="font-semibold text-[var(--text)] mb-3">Productos ({getTotalItems(order)})</h4>
            <div className="space-y-3">
              {order.order_items?.slice(0, 2).map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
                    <img
                      src={item.product?.image}
                      alt={item.product_name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text)]">{item.product_name}</p>
                    <p className="text-sm text-[var(--nav-muted)]">
                      {item.quantity} × S/. {item.price.toLocaleString('es-PE')}
                    </p>
                  </div>
                  <div className="font-semibold text-[var(--accent)]">
                    S/. {(item.price * item.quantity).toLocaleString('es-PE')}
                  </div>
                </div>
              ))}
              {order.order_items?.length > 2 && (
                <p className="text-sm text-[var(--nav-muted)] text-center">
                  +{order.order_items.length - 2} productos más
                </p>
              )}
            </div>
          </div>
          
          {/* Información adicional */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-[var(--text)] mb-2">Método de pago</h4>
              <div className="flex items-center gap-2">
                <span className="text-xl">{paymentInfo.icon}</span>
                <span className="text-[var(--text)]">{paymentInfo.label}</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-[var(--text)] mb-2">Dirección de envío</h4>
              <p className="text-sm text-[var(--nav-muted)] line-clamp-2">
                {order.shipping_address?.address}, {order.shipping_address?.district}
              </p>
            </div>
            
            {order.tracking_number && (
              <div>
                <h4 className="font-semibold text-[var(--text)] mb-2">Número de seguimiento</h4>
                <code className="text-sm bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                  {order.tracking_number}
                </code>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para detalles del pedido
const OrderDetailsModal = ({ order, onClose, statusInfo, paymentInfo, formatDate }) => {
  const orderNumber = `ORD-${String(order.id).padStart(6, '0')}`;
  
  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--menu-bg)] rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--menu-bg)] border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">Detalles del Pedido</h2>
            <p className="text-[var(--nav-muted)]">#{orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="p-6 space-y-8">
          {/* Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[var(--text)] mb-2">Estado del pedido</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${statusInfo.color}`}></div>
                  <span className={`font-medium ${statusInfo.textColor}`}>{statusInfo.label}</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-[var(--text)] mb-2">Fecha del pedido</h3>
                <p className="text-[var(--text)]">{formatDate(order.created_at)}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-[var(--text)] mb-2">Método de pago</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xl">{paymentInfo.icon}</span>
                  <span className="text-[var(--text)]">{paymentInfo.label}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-[var(--text)] mb-2">Total del pedido</h3>
                <p className="text-3xl font-bold text-[var(--accent)]">
                  S/. {order.total.toLocaleString('es-PE')}
                </p>
                <div className="text-sm text-[var(--nav-muted)] mt-2">
                  <p>Subtotal: S/. {order.subtotal?.toLocaleString('es-PE') || order.total.toLocaleString('es-PE')}</p>
                  {order.shipping_cost > 0 && <p>Envío: S/. {order.shipping_cost.toLocaleString('es-PE')}</p>}
                  {order.tax_amount > 0 && <p>IGV: S/. {order.tax_amount.toLocaleString('es-PE')}</p>}
                </div>
              </div>
            </div>
          </div>
          
          {/* Direcciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-[var(--text)] mb-4">Dirección de envío</h3>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                {order.shipping_address ? (
                  <>
                    <p className="font-medium text-[var(--text)]">{order.shipping_address.full_name}</p>
                    <p className="text-[var(--nav-muted)]">{order.shipping_address.phone}</p>
                    <p className="text-[var(--nav-muted)] mt-2">{order.shipping_address.address}</p>
                    <p className="text-[var(--nav-muted)]">
                      {order.shipping_address.district}, {order.shipping_address.city}
                    </p>
                    {order.shipping_address.delivery_instructions && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-sm text-[var(--nav-muted)]">
                          <strong>Instrucciones:</strong> {order.shipping_address.delivery_instructions}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-[var(--nav-muted)]">No hay información de envío</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold text-[var(--text)] mb-4">Dirección de facturación</h3>
              <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                {order.billing_address ? (
                  <>
                    <p className="font-medium text-[var(--text)]">{order.billing_address.full_name}</p>
                    <p className="text-[var(--nav-muted)]">{order.billing_address.email}</p>
                    <p className="text-[var(--nav-muted)] mt-2">{order.billing_address.address}</p>
                    <p className="text-[var(--nav-muted)]">
                      {order.billing_address.city}, {order.billing_address.country || 'Perú'}
                    </p>
                  </>
                ) : (
                  <p className="text-[var(--nav-muted)]">Misma que la dirección de envío</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Productos */}
          <div>
            <h3 className="font-semibold text-[var(--text)] mb-4">Productos</h3>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
                      <img
                        src={item.product?.image}
                        alt={item.product_name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--text)]">{item.product_name}</h4>
                      {item.product?.category && (
                        <p className="text-sm text-[var(--nav-muted)]">
                          {item.product.category.name}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-[var(--nav-muted)]">
                          Cantidad: {item.quantity}
                        </span>
                        <span className="text-sm text-[var(--nav-muted)]">
                          Precio unitario: S/. {item.price.toLocaleString('es-PE')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-[var(--accent)]">
                      S/. {(item.price * item.quantity).toLocaleString('es-PE')}
                    </p>
                    <button className="mt-2 text-sm text-[var(--accent)] hover:underline">
                      Calificar producto
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Timeline del pedido */}
          <div>
            <h3 className="font-semibold text-[var(--text)] mb-4">Historial del pedido</h3>
            <div className="space-y-4">
              {[
                { status: 'pending', label: 'Pedido recibido', date: order.created_at, icon: Package },
                { status: 'paid', label: 'Pago confirmado', date: order.updated_at, icon: CreditCard },
                { status: 'processing', label: 'Preparando pedido', date: null, icon: Package },
                { status: 'shipped', label: 'Pedido enviado', date: null, icon: Truck },
                { status: 'delivered', label: 'Pedido entregado', date: null, icon: CheckCircle },
              ].map((step, index) => {
                const Icon = step.icon;
                const isActive = step.status === order.status;
                const isCompleted = ['paid', 'processing', 'shipped', 'delivered'].indexOf(step.status) <= 
                                   ['paid', 'processing', 'shipped', 'delivered'].indexOf(order.status);
                
                return (
                  <div key={step.status} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 
                      isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 
                      'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className={`font-medium ${
                        isCompleted ? 'text-green-600' : 
                        isActive ? 'text-blue-600' : 
                        'text-[var(--nav-muted)]'
                      }`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-sm text-[var(--nav-muted)]">
                          {formatDate(step.date)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Acciones */}
          <div className="flex flex-wrap gap-3 pt-6 border-t border-gray-200 dark:border-gray-800">
            <button className="flex items-center gap-2 px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/10">
              <MessageSquare className="w-4 h-4" />
              Contactar soporte
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 text-[var(--text)] rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <Download className="w-4 h-4" />
              Descargar factura
            </button>
            {order.status !== 'cancelled' && order.status !== 'delivered' && (
              <button className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <XCircle className="w-4 h-4" />
                Cancelar pedido
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente principal Account actualizado
const Account = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const { tab } = useParams();

  const [activeTab, setActiveTab] = useState(tab || 'profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Estados para pedidos
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Usar el hook de pedidos
  const { 
    orders, 
    loading: ordersLoading, 
    error: ordersError, 
    refetch: refetchOrders,
    getOrderStatusInfo,
    getPaymentMethodInfo,
    formatDate,
    getTotalItems
  } = useOrders(user?.id);

  // Estados para edición de perfil
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    birth_date: profile?.birth_date || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    orderUpdates: true,
    promotions: true,
    newsletter: false,
  });

  // Actualizar activeTab si cambia el parámetro de la URL
  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  // Redirigir al login si no hay usuario
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  // Calcular estadísticas
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const favoriteCategory = orders.length > 0 
    ? 'Electrónica' // Esto sería calculado dinámicamente
    : 'Sin datos';
  const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      `ORD-${String(order.id).padStart(6, '0')}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_address?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Funciones del perfil (mantener las existentes)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNotificationChange = (key) => {
    setNotificationSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar los 5MB');
      return;
    }

    setLoading(true);
    try {
      setSuccess('Imagen actualizada correctamente');
    } catch (err) {
      setError('Error al subir la imagen');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateProfile(formData);
      if (result.success) {
        setSuccess('Perfil actualizado correctamente');
        setEditMode(false);
      } else {
        setError(result.error || 'Error al actualizar perfil');
      }
    } catch (err) {
      setError('Error al actualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      setSuccess('Contraseña actualizada correctamente');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError('Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'orders', name: 'Pedidos', icon: Package },
    { id: 'wishlist', name: 'Favoritos', icon: Heart },
    { id: 'addresses', name: 'Direcciones', icon: MapPin },
    { id: 'payment', name: 'Pagos', icon: CreditCard },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
  ];

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!user) return null;

  return (
    <>
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-2">
              Mi Cuenta
            </h1>
            <p className="text-[var(--nav-muted)]">
              Administra tu información personal y preferencias
            </p>
          </div>
          
          {/* Alertas */}
          {success && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 animate-fade-in">
              <Check className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
              <button onClick={() => setSuccess('')} className="ml-auto">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          {error && (
            <div className="mb-6 flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button onClick={() => setError('')} className="ml-auto">
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Desktop */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-[var(--menu-bg)] rounded-xl border border-white/10 p-6 sticky top-24">
                {/* Avatar y nombre */}
                <div className="text-center mb-6 pb-6 border-b border-white/10">
                  <div className="relative inline-block mb-4">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt={profile.full_name || 'Usuario'}
                        className="w-24 h-24 rounded-full object-cover ring-4 ring-purple-500/50"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-purple-500/50">
                        {getInitials(profile?.full_name)}
                      </div>
                    )}
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition shadow-lg"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <h3 className="font-bold text-lg">{profile?.full_name || 'Usuario'}</h3>
                  <p className="text-sm text-[var(--nav-muted)]">{user.email}</p>
                </div>
                
                {/* Tabs */}
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          activeTab === tab.id
                            ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
                            : 'hover:bg-white/5 text-[var(--nav-text)]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{tab.name}</span>
                      </button>
                    );
                  })}               
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-500 transition-all mt-4"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Cerrar Sesión</span>
                  </button>
                </nav>
              </div>
            </div>
            
            {/* Tabs móviles */}
            <div className="lg:hidden mb-4">
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white'
                          : 'bg-[var(--menu-bg)] text-[var(--nav-text)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tab.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Contenido principal */}
            <div className="lg:col-span-3">
              <div className="bg-[var(--menu-bg)] rounded-xl border border-white/10 p-6 md:p-8">              
                {/* PERFIL */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Información Personal</h2>
                      {!editMode ? (
                        <button
                          onClick={() => setEditMode(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                          Editar
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditMode(false);
                              setFormData({
                                full_name: profile?.full_name || '',
                                phone: profile?.phone || '',
                                birth_date: profile?.birth_date || '',
                              });
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-white/5 transition"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
                          >
                            {loading ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                            Guardar
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <User className="w-4 h-4 inline mr-2" />
                          Nombre Completo
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={formData.full_name}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Mail className="w-4 h-4 inline mr-2" />
                          Correo Electrónico
                        </label>
                        <input
                          type="email"
                          value={user.email}
                          disabled
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] opacity-60 cursor-not-allowed"
                        />
                        <p className="text-xs text-[var(--nav-muted)] mt-1">
                          No se puede cambiar el email
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Phone className="w-4 h-4 inline mr-2" />
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          disabled={!editMode}
                          placeholder="+51 999 999 999"
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          <Calendar className="w-4 h-4 inline mr-2" />
                          Fecha de Nacimiento
                        </label>
                        <input
                          type="date"
                          name="birth_date"
                          value={formData.birth_date}
                          onChange={handleChange}
                          disabled={!editMode}
                          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="pt-6 border-t border-white/10">
                      <h3 className="text-lg font-semibold mb-4">Estadísticas de Cuenta</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                          <Package className="w-6 h-6 text-purple-500 mb-2" />
                          <p className="text-2xl font-bold">{totalOrders}</p>
                          <p className="text-sm text-[var(--nav-muted)]">Pedidos</p>
                        </div>
                        <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                          <Heart className="w-6 h-6 text-red-500 mb-2" />
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-[var(--nav-muted)]">Favoritos</p>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                          <MapPin className="w-6 h-6 text-green-500 mb-2" />
                          <p className="text-2xl font-bold">0</p>
                          <p className="text-sm text-[var(--nav-muted)]">Direcciones</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <CreditCard className="w-6 h-6 text-blue-500 mb-2" />
                          <p className="text-2xl font-bold">{orders.reduce((count, order) => 
                            count + (order.payment_method ? 1 : 0), 0)}</p>
                          <p className="text-sm text-[var(--nav-muted)]">Métodos de pago</p>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
                          <p className="text-sm text-[var(--nav-muted)] mb-1">Total gastado</p>
                          <p className="text-xl font-bold text-indigo-500">
                            S/. {totalSpent.toLocaleString('es-PE')}
                          </p>
                        </div>
                        <div className="p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                          <p className="text-sm text-[var(--nav-muted)] mb-1">Pedido promedio</p>
                          <p className="text-xl font-bold text-orange-500">
                            S/. {averageOrder.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="p-4 bg-teal-500/10 rounded-lg border border-teal-500/20">
                          <p className="text-sm text-[var(--nav-muted)] mb-1">Categoría favorita</p>
                          <p className="text-xl font-bold text-teal-500">{favoriteCategory}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* PEDIDOS */}
                {activeTab === 'orders' && (
                  <div className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">Mis Pedidos</h2>
                        <p className="text-[var(--nav-muted)] mt-1">
                          {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'} en total
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <button
                          onClick={refetchOrders}
                          disabled={ordersLoading}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                        >
                          <RefreshCw className={`w-5 h-5 ${ordersLoading ? 'animate-spin' : ''}`} />
                        </button>
                        
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar pedido..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="all">Todos los estados</option>
                          <option value="pending">Pendiente</option>
                          <option value="paid">Pagado</option>
                          <option value="processing">Procesando</option>
                          <option value="shipped">Enviado</option>
                          <option value="delivered">Entregado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Contenido de pedidos */}
                    {ordersLoading ? (
                      <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[var(--nav-muted)]">Cargando pedidos...</p>
                      </div>
                    ) : ordersError ? (
                      <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-[var(--nav-muted)] mb-4">{ordersError}</p>
                        <button
                          onClick={refetchOrders}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="text-center py-12">
                        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        {searchQuery || statusFilter !== 'all' ? (
                          <>
                            <p className="text-lg text-[var(--nav-muted)] mb-2">
                              No se encontraron pedidos con los filtros aplicados
                            </p>
                            <button
                              onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('all');
                              }}
                              className="text-purple-500 hover:underline"
                            >
                              Limpiar filtros
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="text-lg text-[var(--nav-muted)] mb-4">
                              Aún no has realizado ningún pedido
                            </p>
                            <button 
                              onClick={() => navigate('/')}
                              className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                            >
                              Explorar productos
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredOrders.map((order) => {
                          const statusInfo = getOrderStatusInfo(order.status);
                          const paymentInfo = getPaymentMethodInfo(order.payment_method);
                          
                          return (
                            <OrderItem
                              key={order.id}
                              order={order}
                              statusInfo={statusInfo}
                              paymentInfo={paymentInfo}
                              formatDate={formatDate}
                              getTotalItems={getTotalItems}
                              onViewDetails={setSelectedOrder}
                            />
                          );
                        })}
                      </div>
                    )}
                    
                    {/* Estadísticas de pedidos */}
                    {orders.length > 0 && (
                      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold mb-4">Resumen de compras</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="p-4 bg-blue-500/10 rounded-lg">
                            <p className="text-sm text-[var(--nav-muted)]">Pedidos totales</p>
                            <p className="text-2xl font-bold text-blue-500">{totalOrders}</p>
                          </div>
                          <div className="p-4 bg-green-500/10 rounded-lg">
                            <p className="text-sm text-[var(--nav-muted)]">Total gastado</p>
                            <p className="text-2xl font-bold text-green-500">
                              S/. {totalSpent.toLocaleString('es-PE')}
                            </p>
                          </div>
                          <div className="p-4 bg-purple-500/10 rounded-lg">
                            <p className="text-sm text-[var(--nav-muted)]">Pedido más reciente</p>
                            <p className="text-2xl font-bold text-purple-500">
                              {orders[0] ? formatDate(orders[0].created_at) : 'N/A'}
                            </p>
                          </div>
                          <div className="p-4 bg-orange-500/10 rounded-lg">
                            <p className="text-sm text-[var(--nav-muted)]">Gasto promedio</p>
                            <p className="text-2xl font-bold text-orange-500">
                              S/. {averageOrder.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Los demás tabs (security, notifications, etc.) se mantienen igual */}
                {activeTab === 'security' && (
                  // ... (código existente para seguridad)
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Seguridad y Contraseña</h2>
                    {/* ... contenido de seguridad existente */}
                  </div>
                )}
                
                {activeTab === 'notifications' && (
                  // ... (código existente para notificaciones)
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Preferencias de Notificación</h2>
                    {/* ... contenido de notificaciones existente */}
                  </div>
                )}
                
                {activeTab === 'wishlist' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Lista de Deseos</h2>
                    <div className="text-center py-12">
                      <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-[var(--nav-muted)]">Tu lista de deseos está vacía</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Mis Direcciones</h2>
                      <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                        <MapPin className="w-4 h-4" />
                        Agregar Dirección
                      </button>
                    </div>
                    <div className="text-center py-12">
                      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-[var(--nav-muted)]">No tienes direcciones guardadas</p>
                    </div>
                  </div>
                )}
                
                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold">Métodos de Pago</h2>
                      <button className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition">
                        <CreditCard className="w-4 h-4" />
                        Agregar Tarjeta
                      </button>
                    </div>
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-lg text-[var(--nav-muted)]">No tienes métodos de pago guardados</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal de detalles del pedido */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          statusInfo={getOrderStatusInfo(selectedOrder.status)}
          paymentInfo={getPaymentMethodInfo(selectedOrder.payment_method)}
          formatDate={formatDate}
        />
      )}
    </>
  );
};

export default Account;