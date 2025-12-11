// src/pages/CheckoutSuccess.jsx (CORREGIDO)
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCheckout } from '../hooks/useCheckout';
import { useOrderExpiration } from '../hooks/useOrderExpiration';
import { useAuth } from '../context/AuthContext';
import { 
  CheckCircle, Home, Package, Mail, Calendar, Download,
  Truck, CreditCard, Clock, Shield, Gift, Share2,
  Phone, MapPin, FileText, QrCode, CreditCard as CardIcon,
  Smartphone, DollarSign, AlertCircle, ChevronRight,
  ExternalLink, Copy, Check, ShoppingBag, RefreshCw,
  AlertTriangle, X, Zap, Loader, ShieldCheck, Ban
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'react-hot-toast';

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const { getOrderById, verifyPaymentStatus, cancelOrder } = useCheckout();
  const { 
    calculateTimeLeft, 
    startExpirationTimer, 
    stopExpirationTimer,
    clearOrderState,
    redirectToCartWithCleanup
  } = useOrderExpiration();
  
  const { user } = useAuth();
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [orderStatus, setOrderStatus] = useState('pending');
  const [paymentLink, setPaymentLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [verificationInterval, setVerificationInterval] = useState(null);
  
  const timerRef = useRef(null);
  const verificationRef = useRef(null);

  // CORRECCIÓN: Obtener orderId de múltiples fuentes
  const orderId = React.useMemo(() => {
    // 1. De location.state (si viene del checkout)
    if (location.state?.orderId) {
      return location.state.orderId;
    }
    
    // 2. De los query parameters
    const urlOrderId = searchParams.get('orderId');
    if (urlOrderId) {
      return urlOrderId;
    }
    
    // 3. Del localStorage
    const savedOrderId = localStorage.getItem('last_order_id');
    if (savedOrderId) {
      return savedOrderId;
    }
    
    // 4. De la URL si tiene formato de ID
    const pathParts = location.pathname.split('/');
    const lastPart = pathParts[pathParts.length - 1];
    if (lastPart && /^\d+$/.test(lastPart)) {
      return lastPart;
    }
    
    return null;
  }, [location.state, searchParams, location.pathname]);

  // CORRECCIÓN: Manejar expiración del pedido (ahora recibe orderId)
  const handleOrderExpired = useCallback((message, orderIdToExpire = orderId) => {    
    if (!orderIdToExpire) return;
    
    // Limpiar estados
    clearOrderState(orderIdToExpire);
    
    // Detener temporizadores
    if (timerRef.current) {
      stopExpirationTimer(orderIdToExpire);
    }
    if (verificationRef.current) {
      clearInterval(verificationRef.current);
    }
    
    // Redirigir al carrito
    navigate('/carrito', { 
      replace: true,
      state: { 
        expiredOrder: true,
        orderId: orderIdToExpire,
        message: message
      }
    });
  }, [navigate, clearOrderState, stopExpirationTimer, orderId]);

  // Bloquear navegación hacia atrás
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (orderId && orderStatus === 'pending') {
        e.preventDefault();
        e.returnValue = '¿Estás seguro de que quieres salir? Tu pedido podría expirar.';
      }
    };

    const handlePopState = (e) => {
      if (orderId && orderStatus === 'pending') {
        navigate(location.pathname, { replace: true });
        toast.error('No puedes navegar atrás durante un pago pendiente');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [orderId, orderStatus, navigate, location.pathname]);

  // CORRECCIÓN: Verificar validez del pedido al cargar (simplificado)
  useEffect(() => {
    const checkOrderValidity = async () => {
      if (!orderId) return false;
      
      try {
        const { success, orderStatus } = await verifyPaymentStatus(orderId);
        if (!success || orderStatus === 'cancelled' || orderStatus === 'expired') {
          handleOrderExpired('Este pedido ya no está disponible', orderId);
          return false;
        }
        return true;
      } catch (error) {
        console.error('Error checking order validity:', error);
        return false;
      }
    };

    if (orderId) {
      checkOrderValidity();
    }
  }, [orderId, verifyPaymentStatus, handleOrderExpired]);

  // CORRECCIÓN: Cargar detalles del pedido (sincronizado)
  useEffect(() => {
    const loadOrderDetails = async () => {
      if (!orderId) {
        toast.error('No se encontró información del pedido');
        navigate('/carrito', { replace: true });
        return;
      }

      try {
        console.log('Cargando detalles del pedido:', orderId);
        
        // Cargar detalles del pedido
        const result = await getOrderById(orderId);
        
        if (!result.success) {
          toast.error('No se pudo cargar el pedido');
          navigate('/carrito', { replace: true });
          return;
        }

        const order = result.order;
        console.log('Pedido cargado:', order);
        
        // Parsear items si es string
        if (order.items && typeof order.items === 'string') {
          try {
            order.items = JSON.parse(order.items);
          } catch (e) {
            console.error('Error parsing order items:', e);
            order.items = [];
          }
        }

        setOrderDetails(order);
        setPaymentStatus(order.payment_status || 'pending');
        setOrderStatus(order.status || 'pending');

        // CORRECCIÓN: Si el pedido ya no está pendiente, redirigir
        if (order.status !== 'pending') {
          handleOrderExpired(`El pedido ha sido ${order.status}`, orderId);
          return;
        }

        // Calcular tiempo restante
        if (order.expires_at) {
          const secondsLeft = calculateTimeLeft(order.expires_at);
          console.log('Tiempo restante:', secondsLeft);
          
          setTimeLeft(Math.max(0, secondsLeft));
          
          // Iniciar temporizador si hay tiempo
          if (secondsLeft > 0) {
            startTimer(order.expires_at);
          } else {
            handleOrderExpired('El tiempo para pagar ha expirado', orderId);
          }
        }

        // Generar enlace de pago para QR
        const paymentMethod = order.payment_method;
        if (paymentMethod === 'yape' || paymentMethod === 'plin') {
          const qrData = `Pedido: ${order.id}\nMonto: S/. ${order.total}\nMétodo: ${paymentMethod}`;
          setPaymentLink(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&format=png`);
        }

      } catch (error) {
        console.error('Error loading order details:', error);
        toast.error('Error al cargar los detalles del pedido');
        navigate('/carrito', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    loadOrderDetails();

    return () => {
      if (timerRef.current) {
        stopExpirationTimer(orderId);
      }
      if (verificationRef.current) {
        clearInterval(verificationRef.current);
      }
    };
  }, [orderId, getOrderById, navigate, calculateTimeLeft, startExpirationTimer, stopExpirationTimer, handleOrderExpired]);

  // CORRECCIÓN: Temporizador en tiempo real (simplificado)
  useEffect(() => {
    if (timeLeft <= 0 || orderStatus !== 'pending' || !orderId) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          clearInterval(interval);
          handleAutoCancel();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, orderStatus, orderId]);

  // CORRECCIÓN: Cancelación automática
  const handleAutoCancel = useCallback(async () => {
    if (!orderId) return;
    
    try {
      console.log('Cancelando pedido automáticamente:', orderId);
      const result = await cancelOrder(orderId, 'Tiempo de pago expirado (automático)');
      
      if (result.success) {
        handleOrderExpired('El tiempo para pagar ha expirado', orderId);
      } else {
        console.log('El pedido ya estaba cancelado:', result.error);
        handleOrderExpired('El pedido ya ha sido cancelado', orderId);
      }
    } catch (error) {
      console.error('Error in auto-cancel:', error);
      toast.error('Error al cancelar el pedido automáticamente');
    }
  }, [orderId, cancelOrder, handleOrderExpired]);

  // CORRECCIÓN: Iniciar temporizador
  const startTimer = (expiresAt) => {
    if (!orderId) return;
    
    if (timerRef.current) {
      stopExpirationTimer(orderId);
    }

    timerRef.current = startExpirationTimer(orderId, expiresAt, async () => {
      await handleAutoCancel();
    });
  };

  // CORRECCIÓN: Verificar estado periódicamente
  useEffect(() => {
    if (!orderId || orderStatus !== 'pending') return;

    const intervalId = setInterval(async () => {
      try {
        const result = await verifyPaymentStatus(orderId);
        if (result.success) {
          setPaymentStatus(result.status);
          setOrderStatus(result.orderStatus);
          
          // Si el administrador canceló el pedido
          if (result.orderStatus !== 'pending') {
            clearInterval(intervalId);
            handleOrderExpired('El pedido ha sido cancelado por el administrador', orderId);
          }
        }
      } catch (error) {
        console.error('Error verifying order status:', error);
      }
    }, 30000); // 30 segundos

    verificationRef.current = intervalId;

    return () => {
      if (verificationRef.current) {
        clearInterval(verificationRef.current);
      }
    };
  }, [orderId, orderStatus, verifyPaymentStatus, handleOrderExpired]);

  // CORRECCIÓN: Cancelar pedido manualmente
  const handleCancelOrder = async () => {
    if (!orderId) return;
    
    setCancelling(true);
    try {
      const result = await cancelOrder(orderId, 'Cancelado por el usuario');
      if (result.success) {
        handleOrderExpired('Has cancelado el pedido', orderId);
      } else {
        toast.error(result.error || 'Error al cancelar el pedido');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Error al cancelar el pedido');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  // Formatear tiempo
  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // CORRECCIÓN: Efecto confetti (sintaxis correcta)
  useEffect(() => {
    if (orderStatus === 'pending' && timeLeft > 0 && timeLeft < 10) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [orderStatus, timeLeft]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando detalles del pedido...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pedido no encontrado</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">No se pudo cargar la información del pedido.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // CORRECCIÓN: Usar datos reales del pedido
  const orderNumber = orderDetails?.id ? `ORD-${String(orderDetails.id).padStart(6, '0')}` : 'N/A';
  const total = orderDetails?.total || 0;
  
  // CORRECCIÓN: Obtener email y nombre de múltiples fuentes
  const email = orderDetails?.shipping_address?.email || 
               (typeof orderDetails?.shipping_address === 'object' && orderDetails?.shipping_address?.email) ||
               user?.email || 
               'No especificado';
  
  const name = orderDetails?.shipping_address?.full_name || 
              (typeof orderDetails?.shipping_address === 'object' && orderDetails?.shipping_address?.full_name) ||
              user?.user_metadata?.full_name || 
              'No especificado';
  
  const paymentMethodType = orderDetails?.payment_method || 'tarjeta';
  const shippingAddress = orderDetails?.shipping_address;
  const shippingPhone = shippingAddress?.phone || 'No especificado';

  const getPaymentMethodInfo = (method) => {
    const methods = {
      tarjeta: {
        name: 'Tarjeta de Crédito/Débito',
        icon: CardIcon,
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        instructions: 'Tu pago será procesado de forma segura'
      },
      yape: {
        name: 'Yape',
        icon: Smartphone,
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        instructions: 'Escanea el código QR para completar el pago'
      },
      plin: {
        name: 'Plin',
        icon: Smartphone,
        color: 'text-green-600 dark:text-green-400',
        bg: 'bg-green-100 dark:bg-green-900/30',
        instructions: 'Escanea el código QR para completar el pago'
      },
      efectivo: {
        name: 'Pago contra entrega',
        icon: DollarSign,
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        instructions: 'Paga al momento de recibir tu pedido'
      }
    };
    
    return methods[method] || methods.tarjeta;
  };

  const paymentInfo = getPaymentMethodInfo(paymentMethodType);

  // CORRECCIÓN: Calcular porcentaje para la barra de progreso
  const progressPercentage = Math.max(0, Math.min(100, (timeLeft / 3600) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navegación */}
          <nav className="mb-8">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              <Home className="w-4 h-4" />
              Volver al inicio
            </Link>
          </nav>

          {/* Contenido principal */}
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl overflow-hidden">
            {/* Encabezado con gradiente */}
            <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-12 h-12" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold">¡Pedido Confirmado!</h1>
                    <p className="text-indigo-100 mt-2">Tu compra ha sido procesada exitosamente</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl md:text-3xl font-bold">#{orderNumber}</div>
                  <div className="text-sm text-indigo-200 mt-1">Número de pedido</div>
                </div>
              </div>
            </div>

            {/* Información del pedido */}
            <div className="p-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Columna izquierda - Detalles */}
                <div className="space-y-6">
                  {/* Estado del pago con temporizador */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Estado del Pago</h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {paymentStatus === 'pending' ? 'Pendiente de pago' : 'Pagado'}
                        </p>
                      </div>
                      <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                        paymentStatus === 'paid' 
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      }`}>
                        {paymentStatus === 'paid' ? 'Pagado' : 'Pendiente'}
                      </div>
                    </div>
                    
                    {paymentStatus === 'pending' && (
                      <>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`p-3 rounded-xl ${paymentInfo.bg}`}>
                                <paymentInfo.icon className={`w-6 h-6 ${paymentInfo.color}`} />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">{paymentInfo.name}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{paymentInfo.instructions}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Temporizador de expiración */}
                          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                  Tiempo restante para pagar:
                                </span>
                              </div>
                              <div className="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-300 font-mono">
                                {formatTime(timeLeft)}
                              </div>
                            </div>
                            <div className="w-full bg-amber-200 dark:bg-amber-800 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-1000 ease-linear"
                                style={{ width: `${progressPercentage}%` }}
                              />
                            </div>
                            <div className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                              Después de este tiempo, tu pedido será cancelado automáticamente
                            </div>
                          </div>
                          
                          {/* Acciones de pago */}
                          {(paymentMethodType === 'yape' || paymentMethodType === 'plin') && (
                            <div className="text-center">
                              <button
                                onClick={() => setShowPaymentModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                              >
                                <QrCode className="w-5 h-5" />
                                Ver Código QR para Pagar
                              </button>
                            </div>
                          )}
                          
                          {paymentMethodType === 'tarjeta' && (
                            <div className="text-center">
                              <Link
                                to={`/payment/process/${orderId}`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                              >
                                <CreditCard className="w-5 h-5" />
                                Completar Pago con Tarjeta
                              </Link>
                            </div>
                          )}
                        </div>
                        
                        {/* Botón para cancelar pedido */}
                        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => setShowCancelModal(true)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                          >
                            <Ban className="w-5 h-5" />
                            Cancelar este pedido
                          </button>
                        </div>
                      </>
                    )}
                    
                    {paymentStatus === 'paid' && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                            <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Pago Confirmado</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Tu pago ha sido verificado exitosamente
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Detalles del cliente */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Información del Cliente</h2>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                          <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Email</div>
                          <div className="font-medium text-gray-900 dark:text-white">{email}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Dirección de envío</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {shippingAddress?.address || 'Por confirmar'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                          <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Teléfono</div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {shippingPhone}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Columna derecha - Resumen */}
                <div className="space-y-6">
                  {/* Resumen del pedido */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Resumen del Pedido</h2>
                    
                    <div className="space-y-3">
                      {orderDetails?.items?.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
                          <div className="w-16 h-16 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                            <img 
                              src={item.image || '/placeholder-product.jpg'} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/placeholder-product.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">Cantidad: {item.quantity}</div>
                          </div>
                          <div className="font-bold text-gray-900 dark:text-white">
                            S/. {(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>
                      ))}
                      
                      {/* Totales */}
                      <div className="pt-4 space-y-2">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Subtotal</span>
                          <span>S/. {(total * 0.82).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>IGV (18%)</span>
                          <span>S/. {(total * 0.18).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                          <span>Envío</span>
                          <span className="text-emerald-600 dark:text-emerald-400">Gratis</span>
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                              S/. {total.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Información de entrega */}
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Información de Entrega</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Fecha estimada</p>
                      </div>
                    </div>
                    <div className="text-center py-4">
                      <div className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('es-PE', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long'
                        })}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Entrega en 2-5 días hábiles
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Acciones */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => {
                    // Función para generar factura
                    toast.success('Factura generada correctamente');
                  }}
                  className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 group"
                >
                  <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 group-hover:bg-indigo-500/20 transition-colors">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Descargar Factura</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">PDF disponible</div>
                  </div>
                </button>
                
                <button
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({
                          title: `Mi pedido #${orderNumber}`,
                          text: `¡Hice mi pedido #${orderNumber} en TechZone! Total: S/. ${total.toLocaleString('es-PE')}`,
                          url: window.location.href,
                        });
                        toast.success('¡Pedido compartido!');
                      } else {
                        await navigator.clipboard.writeText(window.location.href);
                        setCopied(true);
                        toast.success('Enlace copiado al portapapeles');
                        setTimeout(() => setCopied(false), 2000);
                      }
                    } catch (error) {
                      console.error('Error sharing:', error);
                    }
                  }}
                  className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-all duration-300 group"
                >
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 group-hover:bg-purple-500/20 transition-colors">
                    {copied ? (
                      <Check className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-500" />
                    ) : (
                      <Share2 className="w-5 h-5 text-purple-600 dark:text-purple-400 group-hover:text-purple-500" />
                    )}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {copied ? '¡Copiado!' : 'Compartir Pedido'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {copied ? 'Enlace copiado' : 'Compartir en redes'}
                    </div>
                  </div>
                </button>
                
                <Link
                  to="/mi-cuenta/pedidos"
                  className="flex items-center justify-center gap-3 p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all duration-300 group"
                >
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-500/20 transition-colors">
                    <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white">Ver Mis Pedidos</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Historial completo</div>
                  </div>
                </Link>
              </div>
              
              {/* Pasos siguientes */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Proceso de Entrega</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Confirmación</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Recibirás un correo con todos los detalles de tu compra
                    </p>
                  </div>
                  
                  <div className="relative p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                        <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Procesamiento</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Tu pedido será preparado y empaquetado en 24-48 horas
                    </p>
                  </div>
                  
                  <div className="relative p-5 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                        <Truck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Envío</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Seguimiento en tiempo real de tu envío hasta la puerta
                    </p>
                  </div>
                  
                  <div className="relative p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl">
                    <div className="absolute -top-3 -left-3 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                        <Gift className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Entrega</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      ¡Tu pedido llega a tus manos con todas las garantías!
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Información importante */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-amber-800 dark:text-amber-300 mb-3">
                      Información Importante
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <ChevronRight className="w-4 h-4" />
                          <span>Conserva tu número de pedido: <strong>{orderNumber}</strong></span>
                        </li>
                        <li className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <ChevronRight className="w-4 h-4" />
                          <span>Para consultas: <strong>soporte@techzone.com</strong></span>
                        </li>
                      </ul>
                      <ul className="space-y-2">
                        <li className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <ChevronRight className="w-4 h-4" />
                          <span>Tiempo de entrega: <strong>2-5 días hábiles</strong></span>
                        </li>
                        <li className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                          <ChevronRight className="w-4 h-4" />
                          <span>Teléfono: <strong>(01) 123-4567</strong></span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botones finales */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 font-semibold group"
                >
                  <Home className="w-5 h-5" />
                  Seguir Comprando
                  <ChevronRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
                
                <Link
                  to="/contacto"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300 font-semibold"
                >
                  <Phone className="w-5 h-5" />
                  Contactar Soporte
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para código QR */}
      {showPaymentModal && (paymentMethodType === 'yape' || paymentMethodType === 'plin') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Pago con {paymentMethodType === 'yape' ? 'Yape' : 'Plin'}
              </h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="text-center mb-6">
              <div className="w-64 h-64 mx-auto bg-white p-4 rounded-xl mb-4">
                {paymentLink ? (
                  <img 
                    src={paymentLink} 
                    alt="QR Code for Payment" 
                    className="w-full h-full"
                    onError={(e) => {
                      e.target.src = '/placeholder-qr.jpg';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <QrCode className="w-32 h-32 text-gray-400" />
                  </div>
                )}
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Escanea el código QR con la app de {paymentMethodType === 'yape' ? 'Yape' : 'Plin'}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Monto: <strong>S/. {total.toFixed(2)}</strong>
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                Referencia: Pedido {orderNumber}
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Pedido ${orderNumber} - S/. ${total.toFixed(2)}`);
                  toast.success('Información copiada al portapapeles');
                }}
                className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <Copy className="w-4 h-4" />
                Copiar Información de Pago
              </button>
              
              <button
                onClick={() => window.open(
                  paymentMethodType === 'yape' ? 'https://www.yape.com.pe' : 'https://www.plin.com.pe', 
                  '_blank'
                )}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:border-indigo-500"
              >
                <ExternalLink className="w-4 h-4" />
                Abrir {paymentMethodType === 'yape' ? 'Yape' : 'Plin'} Web
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-r from-rose-100 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                ¿Cancelar este pedido?
              </h3>
              
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Estás a punto de cancelar el pedido <strong>#{orderNumber}</strong>. 
                Esta acción no se puede deshacer y el stock de los productos será restaurado.
              </p>
              
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={cancelling}
                  className="flex-1 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-xl hover:border-gray-400 dark:hover:border-gray-600 transition-colors disabled:opacity-50"
                >
                  No, mantener pedido
                </button>
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                >
                  {cancelling ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin inline mr-2" />
                      Cancelando...
                    </>
                  ) : (
                    'Sí, cancelar pedido'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutSuccess;