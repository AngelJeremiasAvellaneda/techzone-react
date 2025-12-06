// src/pages/CheckoutSuccess.jsx
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCheckout } from '../hooks/useCheckout';
import { 
  CheckCircle, Home, Package, Mail, Calendar, Download,
  Truck, CreditCard, Clock, Shield, Gift, Share2
} from 'lucide-react';

const CheckoutSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { getOrderById } = useCheckout();
  
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const {
    orderId,
    orderNumber: locationOrderNumber,
    total: locationTotal,
    customerEmail,
    customerName,
    estimatedDelivery
  } = location.state || {};

  // Cargar detalles de la orden desde Supabase
  useEffect(() => {
    const loadOrderDetails = async () => {
      if (orderId) {
        try {
          const result = await getOrderById(orderId);
          if (result.success) {
            setOrderDetails(result.order);
          }
        } catch (error) {
          console.error('Error loading order details:', error);
        }
      }
      setLoading(false);
    };

    loadOrderDetails();
  }, [orderId, getOrderById]);

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </>
    );
  }

  const orderNumber = orderDetails?.id ? `ORD-${String(orderDetails.id).padStart(6, '0')}` : locationOrderNumber;
  const total = orderDetails?.total || locationTotal || 0;
  const email = orderDetails?.shipping_address?.email || customerEmail;
  const name = orderDetails?.shipping_address?.full_name || customerName;

  // Función para generar PDF (simulada)
  const generateInvoice = () => {
    alert('Funcionalidad de descarga de factura en desarrollo...');
    // Aquí integrarías con una API para generar PDF
  };

  // Función para compartir
  const shareOrder = () => {
    if (navigator.share) {
      navigator.share({
        title: `Mi pedido #${orderNumber}`,
        text: `¡Hice mi pedido #${orderNumber} en TechZone! Total: S/. ${total.toLocaleString('es-PE')}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Enlace copiado al portapapeles');
    }
  };

  return (
    <>
      <main className="mt-16 px-4 md:px-6 lg:px-8 max-w-4xl mx-auto py-12">
        <div className="text-center">
          {/* Icono de éxito */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </div>
          </div>

          {/* Mensaje principal */}
          <h1 className="text-4xl font-bold text-[var(--text)] mb-4">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-xl text-[var(--nav-muted)] mb-8">
            Gracias por tu compra. Tu pedido ha sido procesado exitosamente.
          </p>

          {/* Detalles del pedido */}
          <div className="bg-[var(--menu-bg)] rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--nav-muted)]">Número de Pedido</p>
                    <p className="font-bold text-lg text-[var(--text)]">{orderNumber}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--nav-muted)]">Confirmación enviada a</p>
                    <p className="font-bold text-lg text-[var(--text)]">{email || "Tu email"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--nav-muted)]">Fecha estimada de entrega</p>
                    <p className="font-bold text-lg text-[var(--text)]">
                      {estimatedDelivery ? new Date(estimatedDelivery).toLocaleDateString("es-PE", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString("es-PE", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-[var(--accent)]" />
                  </div>
                  <div>
                    <p className="text-sm text-[var(--nav-muted)]">Total del Pedido</p>
                    <p className="font-bold text-2xl text-[var(--accent)]">
                      S/. {total.toLocaleString("es-PE")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botones de acción rápidos */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <button
                onClick={generateInvoice}
                className="flex flex-col items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Download className="w-5 h-5" />
                <span className="text-sm">Factura</span>
              </button>
              <button
                onClick={shareOrder}
                className="flex flex-col items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Compartir</span>
              </button>
              <Link
                to="/account/orders"
                className="flex flex-col items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Package className="w-5 h-5" />
                <span className="text-sm">Ver pedidos</span>
              </Link>
              <Link
                to="/"
                className="flex flex-col items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm">Inicio</span>
              </Link>
            </div>
          </div>

          {/* Pasos siguientes */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-[var(--text)] mb-6">
              ¿Qué sigue?
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <h3 className="font-semibold text-[var(--text)]">
                    Confirmación
                  </h3>
                </div>
                <p className="text-sm text-[var(--nav-muted)]">
                  Recibirás un email con los detalles de tu pedido.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <h3 className="font-semibold text-[var(--text)]">
                    Procesamiento
                  </h3>
                </div>
                <p className="text-sm text-[var(--nav-muted)]">
                  Tu pedido será preparado en 24-48 horas.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <h3 className="font-semibold text-[var(--text)]">
                    Envío
                  </h3>
                </div>
                <p className="text-sm text-[var(--nav-muted)]">
                  Recibirás actualizaciones sobre el envío.
                </p>
              </div>
              
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <h3 className="font-semibold text-[var(--text)]">
                    Entrega
                  </h3>
                </div>
                <p className="text-sm text-[var(--nav-muted)]">
                  ¡Tu pedido llegará pronto!
                </p>
              </div>
            </div>
          </div>

          {/* Recordatorio importante */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-[var(--text)] mb-2">
                  Información importante
                </h3>
                <ul className="text-sm text-[var(--nav-muted)] space-y-1">
                  <li>• Conserva tu número de pedido: <strong>{orderNumber}</strong></li>
                  <li>• El pago será verificado antes del envío</li>
                  <li>• Para consultas, contacta a soporte@techzone.com</li>
                  <li>• Tiempo de entrega: 2-5 días hábiles</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones principales */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--accent)] hover:opacity-90 text-white rounded-lg font-semibold transition-opacity"
            >
              <Home className="w-5 h-5" />
              Seguir comprando
            </Link>
            
            <Link
              to="/account/orders"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)]/10 rounded-lg font-semibold transition-colors"
            >
              <Package className="w-5 h-5" />
              Ver mis pedidos
            </Link>
          </div>

          {/* Nota */}
          <p className="text-sm text-[var(--nav-muted)] mt-8">
            ¿Tienes preguntas sobre tu pedido?{' '}
            <Link to="/contact" className="text-[var(--accent)] font-semibold hover:underline">
              Contáctanos
            </Link>{' '}
            o llama al <strong>(01) 123-4567</strong>
          </p>
        </div>
      </main>
    </>
  );
};

export default CheckoutSuccess;