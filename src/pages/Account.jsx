// src/pages/Account.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import { useFavorites } from '../hooks/useFavorites';
import { useAddresses } from '../hooks/useAddresses';
import { usePaymentMethods } from '../hooks/usePaymentMethods';
import { useNotifications } from '../hooks/useNotifications';
import { useSecurity } from '../hooks/useSecurity';
import { useToast } from '../hooks/useToast';
import { ROUTES } from '../constants/routes';
import { supabase } from '../lib/supabaseClient';
import {
  User, Mail, Lock, Camera, Save, X,
  Package, Heart, MapPin, CreditCard,
  Bell, Shield, HelpCircle, LogOut,
  Phone, Calendar, Settings, Eye, EyeOff,
  Edit2, Check, AlertCircle, Trash2,
  ChevronRight, Eye as EyeIcon, Truck, Clock,
  CheckCircle, XCircle, Search, Filter, Download,
  MessageSquare, Star, RefreshCw, Home,
  Plus, Minus, CreditCard as CreditCardIcon,
  Building, Mail as MailIcon,
  Smartphone, Globe, Shield as ShieldIcon,
  Bell as BellIcon, CreditCard as CardIcon
} from 'lucide-react';

// Componente para Toast
const ToastContainer = ({ toasts, dismissToast }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 p-4 rounded-lg shadow-lg animate-fade-in min-w-[300px] ${
            toast.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800' 
              : toast.type === 'error'
              ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800'
              : 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
          }`}
        >
          {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-500" />}
          {toast.type === 'info' && <Bell className="w-5 h-5 text-blue-500" />}
          <span className="flex-1 text-sm font-medium">{toast.message}</span>
          <button
            onClick={() => dismissToast(toast.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};

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

const OrderDetailsModal = ({ order, onClose, statusInfo, paymentInfo, formatDate, onCancelOrder, canCancelOrder }) => {
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
                { status: "pending", label: "Pedido recibido", icon: Package },
                { status: "paid", label: "Pago confirmado", icon: CreditCard },
                { status: "processing", label: "Preparando pedido", icon: Package },
                { status: "shipped", label: "Pedido enviado", icon: Truck },
                { status: "delivered", label: "Pedido entregado", icon: CheckCircle },
              ].map((step, index) => {
                const Icon = step.icon;

                const orderStatusRank = ["pending", "paid", "processing", "shipped", "delivered"];
                const currentRank = orderStatusRank.indexOf(order.status);
                const stepRank = orderStatusRank.indexOf(step.status);

                const isCompleted = stepRank < currentRank;
                const isActive = step.status === order.status;

                // Si el pedido está cancelado o reembolsado → se apagan todos
                const isCancelledFlow = ["cancelled", "refunded"].includes(order.status);

                return (
                  <div
                    key={index}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border
                      ${isCancelledFlow
                        ? "opacity-50 border-gray-300 dark:border-gray-800"
                        : isActive
                          ? "border-[var(--accent)] bg-[var(--accent)]/10"
                          : isCompleted
                            ? "border-green-500 bg-green-500/10"
                            : "border-gray-300 dark:border-gray-800"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        w-5 h-5 
                        ${isCancelledFlow
                          ? "text-gray-400"
                          : isActive
                            ? "text-[var(--accent)]"
                            : isCompleted
                              ? "text-green-500"
                              : "text-gray-500 dark:text-gray-400"
                        }
                      `}
                    />

                    <div>
                      <p className="font-medium">{step.label}</p>

                      {step.status === "pending" && (
                        <p className="text-xs opacity-70">
                          {new Date(order.created_at).toLocaleString()}
                        </p>
                      )}

                      {isActive && (
                        <p className="text-xs opacity-70">
                          Última actualización: {new Date(order.updated_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Estado final si fue cancelado o reembolsado */}
              {order.status === "cancelled" && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-red-500 bg-red-500/10">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium">Pedido cancelado</p>
                    <p className="text-xs opacity-70">
                      {new Date(order.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              {order.status === "refunded" && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-orange-500 bg-orange-500/10">
                  <DollarSign className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium">Pedido reembolsado</p>
                    <p className="text-xs opacity-70">
                      {new Date(order.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

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
            {canCancelOrder(order) && (
              <button
                onClick={() => {
                  if (window.confirm('¿Estás seguro de que deseas cancelar este pedido?')) {
                    onCancelOrder(order.id);
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
              >
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

// Componente para favoritos
const WishlistItem = ({ item, onRemove }) => {
  const navigate = useNavigate();
  
  const productImage = item.product?.images?.[0] || '/api/placeholder/400/400';
  const productName = item.product?.name || 'Producto no disponible';
  const productPrice = item.product?.price || 0;
  const categoryName = item.product?.categories?.name || 'Sin categoría';
  
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div 
            className="w-20 h-20 flex-shrink-0 bg-white dark:bg-gray-900 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => navigate(ROUTES.PRODUCT(item.product?.slug))}
          >
            <img
              src={productImage}
              alt={productName}
              className="w-full h-full object-contain p-2"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 
                  className="font-semibold text-[var(--text)] truncate cursor-pointer hover:text-[var(--accent)]"
                  onClick={() => navigate(ROUTES.PRODUCT(item.product?.slug))}
                >
                  {productName}
                </h3>
                <p className="text-sm text-[var(--nav-muted)]">{categoryName}</p>
                <p className="text-lg font-bold text-[var(--accent)] mt-2">
                  S/. {productPrice.toLocaleString('es-PE')}
                </p>
              </div>
              <button
                onClick={() => onRemove(item.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                aria-label="Eliminar de favoritos"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={() => navigate(ROUTES.PRODUCT(item.product?.slug))}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition text-sm"
              >
                Ver producto
              </button>
              <button
                className="px-4 py-2 border border-[var(--accent)] text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/10 transition text-sm"
              >
                Agregar al carrito
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para dirección
const AddressCard = ({ address, onEdit, onDelete, onSetDefault, isDefault }) => {
  return (
    <div className={`border rounded-lg p-4 ${isDefault ? 'border-purple-500 bg-purple-500/5' : 'border-gray-200 dark:border-gray-800'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-[var(--text)]">{address.label || 'Dirección'}</h3>
          {isDefault && (
            <span className="inline-block px-2 py-1 bg-purple-500 text-white text-xs rounded-full mt-1">
              Principal
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(address)}
            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            aria-label="Editar dirección"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {!isDefault && (
            <button
              onClick={() => onDelete(address.id)}
              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              aria-label="Eliminar dirección"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
      <div className="space-y-1 text-sm text-[var(--nav-muted)]">
        <p>{address.full_name}</p>
        <p>{address.phone}</p>
        <p>{address.address}</p>
        <p>{address.district}, {address.city}</p>
        {address.delivery_instructions && (
          <p className="pt-2 border-t border-gray-200 dark:border-gray-800">
            <strong>Instrucciones:</strong> {address.delivery_instructions}
          </p>
        )}
      </div>
      {!isDefault && (
        <button
          onClick={() => onSetDefault(address.id)}
          className="mt-4 text-sm text-purple-500 hover:text-purple-600"
        >
          Establecer como principal
        </button>
      )}
    </div>
  );
};

// Componente para método de pago
const PaymentMethodCard = ({ method, onDelete, onSetDefault, maskCardNumber }) => {
  return (
    <div className={`border rounded-lg p-4 ${method.is_default ? 'border-purple-500 bg-purple-500/5' : 'border-gray-200 dark:border-gray-800'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-[var(--text)]">{method.card_brand || 'Tarjeta'}</h3>
          {method.is_default && (
            <span className="inline-block px-2 py-1 bg-purple-500 text-white text-xs rounded-full mt-1">
              Principal
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!method.is_default && (
            <>
              <button
                onClick={() => onSetDefault(method.id)}
                className="text-sm text-purple-500 hover:text-purple-600"
              >
                Principal
              </button>
              <button
                onClick={() => onDelete(method.id)}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                aria-label="Eliminar método de pago"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      <div className="space-y-1 text-sm text-[var(--nav-muted)]">
        <p>Tarjeta terminada en {maskCardNumber(method.card_number)}</p>
        <p>Vence: {method.exp_month}/{method.exp_year}</p>
        <p>Titular: {method.card_holder}</p>
      </div>
    </div>
  );
};

// Modal para agregar/editar dirección
const AddressModal = ({ isOpen, onClose, address, onSave, loading }) => {
  const [formData, setFormData] = useState({
    label: address?.label || '',
    full_name: address?.full_name || '',
    phone: address?.phone || '',
    address: address?.address || '',
    district: address?.district || '',
    city: address?.city || '',
    region: address?.region || 'Lima',
    country: address?.country || 'Perú',
    postal_code: address?.postal_code || '',
    delivery_instructions: address?.delivery_instructions || '',
    is_default: address?.is_default || false,
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Nombre es requerido';
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono es requerido';
    if (!formData.address.trim()) newErrors.address = 'Dirección es requerida';
    if (!formData.district.trim()) newErrors.district = 'Distrito es requerido';
    if (!formData.city.trim()) newErrors.city = 'Ciudad es requerida';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--menu-bg)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--menu-bg)] border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text)]">
            {address ? 'Editar Dirección' : 'Agregar Dirección'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Etiqueta (ej: Casa, Oficina)
            </label>
            <input
              type="text"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)]"
              placeholder="Casa"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre completo *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg bg-[var(--menu-bg)] text-[var(--text)] ${
                errors.full_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              disabled={loading}
            />
            {errors.full_name && (
              <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Teléfono *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg bg-[var(--menu-bg)] text-[var(--text)] ${
                  errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="+51 999 999 999"
                disabled={loading}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Código postal
              </label>
              <input
                type="text"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)]"
                disabled={loading}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Dirección *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg bg-[var(--menu-bg)] text-[var(--text)] ${
                errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              rows="2"
              placeholder="Calle, número, departamento"
              disabled={loading}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Distrito *
              </label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg bg-[var(--menu-bg)] text-[var(--text)] ${
                  errors.district ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                disabled={loading}
              />
              {errors.district && (
                <p className="text-red-500 text-sm mt-1">{errors.district}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Ciudad *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg bg-[var(--menu-bg)] text-[var(--text)] ${
                  errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                disabled={loading}
              />
              {errors.city && (
                <p className="text-red-500 text-sm mt-1">{errors.city}</p>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Instrucciones de entrega
            </label>
            <textarea
              value={formData.delivery_instructions}
              onChange={(e) => setFormData({ ...formData, delivery_instructions: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)]"
              rows="2"
              placeholder="Ej: Llamar antes de llegar, dejar con el portero, etc."
              disabled={loading}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 text-purple-500 rounded"
              disabled={loading}
            />
            <label htmlFor="is_default" className="text-sm text-[var(--text)]">
              Establecer como dirección principal
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {address ? 'Actualizando...' : 'Guardando...'}
                </div>
              ) : address ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para agregar tarjeta
const AddCardModal = ({ isOpen, onClose, onSave, loading }) => {
  const [formData, setFormData] = useState({
    card_brand: '',
    card_number: '',
    card_holder: '',
    exp_month: '',
    exp_year: '',
    cvv: '',
    is_default: false,
  });
  const [errors, setErrors] = useState({});

  const currentYear = new Date().getFullYear();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.card_number.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.card_number = 'Número de tarjeta inválido (16 dígitos)';
    }
    if (!formData.card_holder.trim()) newErrors.card_holder = 'Nombre del titular es requerido';
    if (!formData.exp_month || formData.exp_month < 1 || formData.exp_month > 12) {
      newErrors.exp_month = 'Mes inválido';
    }
    if (!formData.exp_year || formData.exp_year < currentYear) {
      newErrors.exp_year = 'Año inválido o expirado';
    }
    if (!formData.cvv || !formData.cvv.match(/^\d{3,4}$/)) {
      newErrors.cvv = 'CVV inválido';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(formData);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    }
    return value;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--menu-bg)] rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--menu-bg)] border-b border-gray-200 dark:border-gray-800 p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[var(--text)]">
            Agregar Tarjeta
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            disabled={loading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Número de tarjeta *
            </label>
            <input
              type="text"
              value={formData.card_number}
              onChange={(e) => setFormData({ 
                ...formData, 
                card_number: formatCardNumber(e.target.value) 
              })}
              maxLength={19}
              className={`w-full px-4 py-2 border rounded-lg bg-[var(--menu-bg)] text-[var(--text)] ${
                errors.card_number ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              placeholder="1234 5678 9012 3456"
              disabled={loading}
            />
            {errors.card_number && (
              <p className="text-red-500 text-sm mt-1">{errors.card_number}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Nombre del titular *
            </label>
            <input
              type="text"
              value={formData.card_holder}
              onChange={(e) => setFormData({ ...formData, card_holder: e.target.value.toUpperCase() })}
              className={`w-full px-4 py-2 border rounded-lg bg-[var(--menu-bg)] text-[var(--text)] ${
                errors.card_holder ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
              }`}
              placeholder="JUAN PEREZ"
              disabled={loading}
            />
            {errors.card_holder && (
              <p className="text-red-500 text-sm mt-1">{errors.card_holder}</p>
            )}
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Mes *
              </label>
              <select
                value={formData.exp_month}
                onChange={(e) => setFormData({ ...formData, exp_month: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg bg-[var(--menu-bg)] text-[var(--text)] ${
                  errors.exp_month ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                disabled={loading}
              >
                <option value="">MM</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <option key={month} value={month}>
                    {String(month).padStart(2, '0')}
                  </option>
                ))}
              </select>
              {errors.exp_month && (
                <p className="text-red-500 text-sm mt-1">{errors.exp_month}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Año *
              </label>
              <select
                value={formData.exp_year}
                onChange={(e) => setFormData({ ...formData, exp_year: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg bg-[var(--menu-bg)] text-[var(--text)] ${
                  errors.exp_year ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                disabled={loading}
              >
                <option value="">AA</option>
                {Array.from({ length: 10 }, (_, i) => currentYear + i).map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              {errors.exp_year && (
                <p className="text-red-500 text-sm mt-1">{errors.exp_year}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                CVV *
              </label>
              <input
                type="password"
                value={formData.cvv}
                onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                maxLength={4}
                className={`w-full px-4 py-2 border rounded-lg bg-[var(--menu-bg)] text-[var(--text)] ${
                  errors.cvv ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                }`}
                placeholder="123"
                disabled={loading}
              />
              {errors.cvv && (
                <p className="text-red-500 text-sm mt-1">{errors.cvv}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 text-purple-500 rounded"
              disabled={loading}
            />
            <label htmlFor="is_default" className="text-sm text-[var(--text)]">
              Establecer como método de pago principal
            </label>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Guardando...
                </div>
              ) : 'Agregar Tarjeta'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente principal Account actualizado
const Account = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const { tab = 'profile' } = useParams();
  const { toasts, showToast, dismissToast } = useToast();

  const [activeTab, setActiveTab] = useState(tab);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Estados para pedidos
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Estados para modales
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  // Usar todos los hooks
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

  const {
    favorites,
    loading: favoritesLoading,
    error: favoritesError,
    removeFavorite,
    refetch: refetchFavorites
  } = useFavorites(user?.id);

  const {
    addresses,
    loading: addressesLoading,
    error: addressesError,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: refetchAddresses
  } = useAddresses(user?.id);

  const {
    paymentMethods,
    loading: paymentMethodsLoading,
    error: paymentMethodsError,
    addPaymentMethod,
    deletePaymentMethod,
    setDefaultPaymentMethod,
    maskCardNumber,
    refetch: refetchPaymentMethods
  } = usePaymentMethods(user?.id);

  const {
    notifications,
    settings: notificationSettings,
    loading: notificationsLoading,
    error: notificationsError,
    markAsRead,
    markAllAsRead,
    updateSettings: updateNotificationSettings,
    refetch: refetchNotifications
  } = useNotifications(user?.id);

  const {
    changePassword,
    validatePassword,
    loading: securityLoading
  } = useSecurity();

  // Estados para formularios
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    birth_date: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [localNotificationSettings, setLocalNotificationSettings] = useState({
    email_notifications: true,
    order_updates: true,
    promotions: true,
    newsletter: true,
    push_notifications: false
  });

  // Inicializar datos del perfil cuando cargue
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        birth_date: profile.birth_date || '',
      });
    }
  }, [profile]);

  // Inicializar configuraciones de notificación
  useEffect(() => {
    if (notificationSettings) {
      setLocalNotificationSettings(notificationSettings);
    }
  }, [notificationSettings]);

  // Actualizar activeTab si cambia el parámetro de la URL
  useEffect(() => {
    if (tab) setActiveTab(tab);
  }, [tab]);

  // Redirigir al login si no hay usuario
  useEffect(() => {
    if (!user) navigate(ROUTES.LOGIN);
  }, [user, navigate]);

  // Calcular estadísticas
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
  const averageOrder = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const orderNumber = `ORD-${String(order.id).padStart(6, '0')}`;
    const matchesSearch = searchQuery === '' || 
      orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.shipping_address?.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Funciones del perfil
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validaciones
    if (!file.type.startsWith('image/')) {
      showToast('El archivo debe ser una imagen (JPG, PNG)', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen no debe superar los 5MB', 'error');
      return;
    }

    setLoading(true);
    try {
      // Subir la imagen a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Obtener la URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      // Actualizar el perfil con la nueva URL
      const result = await updateProfile({ avatar_url: publicUrl });
      if (result.success) {
        showToast('Imagen de perfil actualizada correctamente', 'success');
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      showToast('Error al subir la imagen', 'error');
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        showToast('Perfil actualizado correctamente', 'success');
        setEditMode(false);
      } else {
        showToast(result.error || 'Error al actualizar perfil', 'error');
      }
    } catch (err) {
      showToast('Error al actualizar perfil', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }

    const passwordErrors = validatePassword(passwordData.newPassword);
    if (passwordErrors.length > 0) {
      showToast(passwordErrors[0], 'error');
      return;
    }

    const result = await changePassword(passwordData.currentPassword, passwordData.newPassword);
    if (result.success) {
      showToast(result.message || 'Contraseña actualizada correctamente', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      showToast(result.error || 'Error al cambiar la contraseña', 'error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) throw error;
      
      showToast('Pedido cancelado correctamente', 'success');
      refetchOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error cancelling order:', err);
      showToast('Error al cancelar el pedido', 'error');
    }
  };

  const canCancelOrder = (order) => {
    return ['pending', 'processing'].includes(order.status);
  };

  const handleAddAddress = async (addressData) => {
    setLoading(true);
    try {
      const result = await addAddress(addressData);
      if (result.success) {
        showToast('Dirección agregada correctamente', 'success');
        setShowAddressModal(false);
      } else {
        showToast(result.error || 'Error al agregar dirección', 'error');
      }
    } catch (err) {
      showToast('Error al guardar la dirección', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAddress = async (addressData) => {
    setLoading(true);
    try {
      const result = await updateAddress(editingAddress.id, addressData);
      if (result.success) {
        showToast('Dirección actualizada correctamente', 'success');
        setShowAddressModal(false);
        setEditingAddress(null);
      } else {
        showToast(result.error || 'Error al actualizar dirección', 'error');
      }
    } catch (err) {
      showToast('Error al actualizar dirección', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta dirección?')) {
      return;
    }

    try {
      const result = await deleteAddress(addressId);
      if (result.success) {
        showToast('Dirección eliminada correctamente', 'success');
      } else {
        showToast(result.error || 'Error al eliminar dirección', 'error');
      }
    } catch (err) {
      showToast('Error al eliminar dirección', 'error');
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      const result = await setDefaultAddress(addressId);
      if (result.success) {
        showToast('Dirección principal actualizada', 'success');
      } else {
        showToast(result.error || 'Error al actualizar dirección principal', 'error');
      }
    } catch (err) {
      showToast('Error al actualizar dirección principal', 'error');
    }
  };

  const handleAddPaymentMethod = async (cardData) => {
    setLoading(true);
    try {
      // Determinar la marca de la tarjeta
      const firstDigit = cardData.card_number.charAt(0);
      let cardBrand = 'Visa';
      if (firstDigit === '5') cardBrand = 'Mastercard';
      if (firstDigit === '3') cardBrand = 'American Express';
      if (firstDigit === '4') cardBrand = 'Visa';

      const result = await addPaymentMethod({
        ...cardData,
        card_brand: cardBrand,
        type: 'credit_card'
      });

      if (result.success) {
        showToast('Tarjeta agregada correctamente', 'success');
        setShowCardModal(false);
      } else {
        showToast(result.error || 'Error al agregar tarjeta', 'error');
      }
    } catch (err) {
      showToast('Error al agregar tarjeta', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este método de pago?')) {
      return;
    }

    try {
      const result = await deletePaymentMethod(paymentMethodId);
      if (result.success) {
        showToast('Método de pago eliminado', 'success');
      } else {
        showToast(result.error || 'Error al eliminar método de pago', 'error');
      }
    } catch (err) {
      showToast('Error al eliminar método de pago', 'error');
    }
  };

  const handleSetDefaultPaymentMethod = async (paymentMethodId) => {
    try {
      const result = await setDefaultPaymentMethod(paymentMethodId);
      if (result.success) {
        showToast('Método de pago principal actualizado', 'success');
      } else {
        showToast(result.error || 'Error al actualizar método de pago principal', 'error');
      }
    } catch (err) {
      showToast('Error al actualizar método de pago principal', 'error');
    }
  };

  const handleSaveNotificationSettings = async () => {
    try {
      const result = await updateNotificationSettings(localNotificationSettings);
      if (result.success) {
        showToast('Configuraciones guardadas', 'success');
      } else {
        showToast(result.error || 'Error al guardar configuraciones', 'error');
      }
    } catch (err) {
      showToast('Error al guardar configuraciones', 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(ROUTES.HOME);
      showToast('Sesión cerrada correctamente', 'success');
    } catch (err) {
      showToast('Error al cerrar sesión', 'error');
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  if (!user) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--nav-muted)]">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header con breadcrumb */}
          <div className="mb-8">
            <nav className="mb-4 text-sm text-[var(--nav-muted)]">
              <Link to={ROUTES.HOME} className="hover:text-[var(--accent)] transition-colors inline-flex items-center gap-1">
                <Home className="w-3 h-3" />
                Inicio
              </Link>
              <span className="mx-2">/</span>
              <span className="text-[var(--text)]">Mi Cuenta</span>
              {tab !== 'profile' && (
                <>
                  <span className="mx-2">/</span>
                  <span className="text-[var(--text)] capitalize">{tab}</span>
                </>
              )}
            </nav>
            
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-2">
              Mi Cuenta
            </h1>
            <p className="text-[var(--nav-muted)]">
              Administra tu información personal y preferencias
            </p>
          </div>
          
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
                      disabled={loading}
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
                  {tabs.map((tabItem) => {
                    const Icon = tabItem.icon;
                    const isActive = activeTab === tabItem.id;
                    return (
                      <button
                        key={tabItem.id}
                        onClick={() => {
                          setActiveTab(tabItem.id);
                          navigate(ROUTES.ACCOUNT_TAB(tabItem.id));
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                          isActive
                            ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg'
                            : 'hover:bg-white/5 text-[var(--nav-text)]'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{tabItem.name}</span>
                        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
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
                {tabs.map((tabItem) => {
                  const Icon = tabItem.icon;
                  const isActive = activeTab === tabItem.id;
                  return (
                    <button
                      key={tabItem.id}
                      onClick={() => {
                        setActiveTab(tabItem.id);
                        navigate(ROUTES.ACCOUNT_TAB(tabItem.id));
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white'
                          : 'bg-[var(--menu-bg)] text-[var(--nav-text)]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{tabItem.name}</span>
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
                          <p className="text-2xl font-bold">{favorites.length}</p>
                          <p className="text-sm text-[var(--nav-muted)]">Favoritos</p>
                        </div>
                        <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                          <MapPin className="w-6 h-6 text-green-500 mb-2" />
                          <p className="text-2xl font-bold">{addresses.length}</p>
                          <p className="text-sm text-[var(--nav-muted)]">Direcciones</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <CreditCard className="w-6 h-6 text-blue-500 mb-2" />
                          <p className="text-2xl font-bold">{paymentMethods.length}</p>
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
                          <p className="text-sm text-[var(--nav-muted)] mb-1">Miembro desde</p>
                          <p className="text-xl font-bold text-teal-500">
                            {user.created_at ? formatDate(user.created_at).split(' ')[0] : 'N/A'}
                          </p>
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
                              onClick={() => navigate(ROUTES.SHOP)}
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
                
                {/* FAVORITOS */}
                {activeTab === 'wishlist' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">Lista de Deseos</h2>
                        <p className="text-[var(--nav-muted)] mt-1">
                          {favorites.length} {favorites.length === 1 ? 'producto' : 'productos'} guardados
                        </p>
                      </div>
                      <button 
                        onClick={() => navigate(ROUTES.SHOP)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                      >
                        <Heart className="w-4 h-4" />
                        Explorar productos
                      </button>
                    </div>
                    
                    {favoritesLoading ? (
                      <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[var(--nav-muted)]">Cargando favoritos...</p>
                      </div>
                    ) : favoritesError ? (
                      <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-[var(--nav-muted)] mb-4">{favoritesError}</p>
                        <button
                          onClick={refetchFavorites}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : favorites.length === 0 ? (
                      <div className="text-center py-12">
                        <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-[var(--nav-muted)] mb-4">Tu lista de deseos está vacía</p>
                        <button 
                          onClick={() => navigate(ROUTES.SHOP)}
                          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                        >
                          Comenzar a agregar productos
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {favorites.map((item) => (
                          <WishlistItem
                            key={item.id}
                            item={item}
                            onRemove={removeFavorite}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* DIRECCIONES */}
                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">Mis Direcciones</h2>
                        <p className="text-[var(--nav-muted)] mt-1">
                          {addresses.length} {addresses.length === 1 ? 'dirección' : 'direcciones'} guardadas
                        </p>
                      </div>
                      <button 
                        onClick={() => {
                          setEditingAddress(null);
                          setShowAddressModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                      >
                        <MapPin className="w-4 h-4" />
                        Agregar Dirección
                      </button>
                    </div>
                    
                    {addressesLoading ? (
                      <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[var(--nav-muted)]">Cargando direcciones...</p>
                      </div>
                    ) : addressesError ? (
                      <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-[var(--nav-muted)] mb-4">{addressesError}</p>
                        <button
                          onClick={refetchAddresses}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-[var(--nav-muted)] mb-4">No tienes direcciones guardadas</p>
                        <button 
                          onClick={() => setShowAddressModal(true)}
                          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                        >
                          Agregar tu primera dirección
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((address) => (
                          <AddressCard
                            key={address.id}
                            address={address}
                            isDefault={address.is_default}
                            onEdit={() => {
                              setEditingAddress(address);
                              setShowAddressModal(true);
                            }}
                            onDelete={handleDeleteAddress}
                            onSetDefault={handleSetDefaultAddress}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
                
                {/* PAGOS */}
                {activeTab === 'payment' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">Métodos de Pago</h2>
                        <p className="text-[var(--nav-muted)] mt-1">
                          {paymentMethods.length} {paymentMethods.length === 1 ? 'método' : 'métodos'} guardados
                        </p>
                      </div>
                      <button 
                        onClick={() => setShowCardModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                      >
                        <CreditCard className="w-4 h-4" />
                        Agregar Tarjeta
                      </button>
                    </div>
                    
                    {paymentMethodsLoading ? (
                      <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[var(--nav-muted)]">Cargando métodos de pago...</p>
                      </div>
                    ) : paymentMethodsError ? (
                      <div className="text-center py-12">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-[var(--nav-muted)] mb-4">{paymentMethodsError}</p>
                        <button
                          onClick={refetchPaymentMethods}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
                        >
                          Reintentar
                        </button>
                      </div>
                    ) : paymentMethods.length === 0 ? (
                      <div className="text-center py-12">
                        <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg text-[var(--nav-muted)] mb-4">No tienes métodos de pago guardados</p>
                        <button 
                          onClick={() => setShowCardModal(true)}
                          className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                        >
                          Agregar método de pago
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {paymentMethods.map((method) => (
                          <PaymentMethodCard
                            key={method.id}
                            method={method}
                            onDelete={handleDeletePaymentMethod}
                            onSetDefault={handleSetDefaultPaymentMethod}
                            maskCardNumber={maskCardNumber}
                          />
                        ))}
                      </div>
                    )}
                    
                    <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                      <h3 className="text-lg font-semibold mb-4">Añadir otros métodos de pago</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition text-center">
                          <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-blue-500/10 rounded-full">
                            <CreditCardIcon className="w-5 h-5 text-blue-500" />
                          </div>
                          <p className="text-sm font-medium">Yape</p>
                        </button>
                        <button className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition text-center">
                          <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-green-500/10 rounded-full">
                            <Smartphone className="w-5 h-5 text-green-500" />
                          </div>
                          <p className="text-sm font-medium">Plin</p>
                        </button>
                        <button className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition text-center">
                          <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-purple-500/10 rounded-full">
                            <Globe className="w-5 h-5 text-purple-500" />
                          </div>
                          <p className="text-sm font-medium">PayPal</p>
                        </button>
                        <button className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition text-center">
                          <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-red-500/10 rounded-full">
                            <Building className="w-5 h-5 text-red-500" />
                          </div>
                          <p className="text-sm font-medium">Transferencia</p>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* SEGURIDAD */}
                {activeTab === 'security' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Seguridad y Contraseña</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Cambiar Contraseña</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Contraseña Actual
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Ingresa tu contraseña actual"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Nueva Contraseña
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Ingresa tu nueva contraseña"
                              />
                            </div>
                            <p className="text-xs text-[var(--nav-muted)] mt-2">
                              La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula y un número.
                            </p>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Confirmar Nueva Contraseña
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="Confirma tu nueva contraseña"
                              />
                            </div>
                          </div>
                          
                          <button
                            onClick={handleChangePassword}
                            disabled={securityLoading}
                            className="w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition disabled:opacity-50"
                          >
                            {securityLoading ? (
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Cambiando contraseña...
                              </div>
                            ) : 'Cambiar Contraseña'}
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Sesiones Activas</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                            <div>
                              <p className="font-medium text-[var(--text)]">Dispositivo Actual</p>
                              <p className="text-sm text-[var(--nav-muted)]">Navegador: {navigator.userAgent.split(' ')[0]}</p>
                              <p className="text-sm text-[var(--nav-muted)]">IP: 192.168.1.1</p>
                            </div>
                            <span className="px-2 py-1 bg-green-500 text-white text-xs rounded-full">
                              Activa
                            </span>
                          </div>
                        </div>
                        <button className="mt-4 text-sm text-red-500 hover:text-red-600">
                          Cerrar todas las sesiones excepto esta
                        </button>
                      </div>
                      
                      <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                        <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Autenticación de Dos Factores</h3>
                        <p className="text-sm text-[var(--nav-muted)] mb-4">
                          Añade una capa extra de seguridad a tu cuenta.
                        </p>
                        <button className="px-4 py-2 border border-purple-500 text-purple-500 rounded-lg hover:bg-purple-500/10 transition">
                          Configurar 2FA
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* NOTIFICACIONES */}
                {activeTab === 'notifications' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold mb-6">Notificaciones</h2>
                    
                    {notificationsLoading ? (
                      <div className="text-center py-12">
                        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-[var(--nav-muted)]">Cargando notificaciones...</p>
                      </div>
                    ) : (
                      <>
                        {/* Configuración de notificaciones */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-[var(--text)]">Preferencias de notificación</h3>
                          
                          <div className="space-y-3">
                            {[
                              { key: 'email_notifications', label: 'Notificaciones por correo', description: 'Recibir notificaciones importantes por correo electrónico', icon: MailIcon },
                              { key: 'order_updates', label: 'Actualizaciones de pedidos', description: 'Recibir actualizaciones sobre el estado de tus pedidos', icon: Package },
                              { key: 'promotions', label: 'Promociones y ofertas', description: 'Recibir notificaciones sobre descuentos y ofertas especiales', icon: BellIcon },
                              { key: 'newsletter', label: 'Boletín informativo', description: 'Recibir nuestro boletín mensual con novedades', icon: MailIcon },
                            ].map((item) => {
                              const Icon = item.icon;
                              return (
                                <div key={item.key} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 flex items-center justify-center bg-purple-500/10 rounded-full">
                                      <Icon className="w-5 h-5 text-purple-500" />
                                    </div>
                                    <div>
                                      <p className="font-medium text-[var(--text)]">{item.label}</p>
                                      <p className="text-sm text-[var(--nav-muted)]">{item.description}</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => setLocalNotificationSettings(prev => ({
                                      ...prev,
                                      [item.key]: !prev[item.key]
                                    }))}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                                      localNotificationSettings[item.key] ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-700'
                                    }`}
                                  >
                                    <span
                                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                                        localNotificationSettings[item.key] ? 'translate-x-6' : 'translate-x-1'
                                      }`}
                                    />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          
                          <button
                            onClick={handleSaveNotificationSettings}
                            className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
                          >
                            Guardar cambios
                          </button>
                        </div>
                        
                        {/* Historial de notificaciones */}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-800">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-[var(--text)]">Historial de notificaciones</h3>
                            <button
                              onClick={markAllAsRead}
                              className="text-sm text-purple-500 hover:text-purple-600"
                            >
                              Marcar todas como leídas
                            </button>
                          </div>
                          
                          {notifications.length === 0 ? (
                            <div className="text-center py-8">
                              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-[var(--nav-muted)]">No hay notificaciones</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {notifications.slice(0, 10).map((notification) => (
                                <div 
                                  key={notification.id} 
                                  className={`p-4 border rounded-lg ${notification.read ? 'border-gray-200 dark:border-gray-800' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'}`}
                                >
                                  <div className="flex items-start gap-3">
                                    <div className={`w-2 h-2 mt-2 rounded-full ${notification.read ? 'bg-transparent' : 'bg-blue-500'}`} />
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                        <h4 className="font-medium text-[var(--text)]">{notification.title}</h4>
                                        <span className="text-xs text-[var(--nav-muted)]">
                                          {new Date(notification.created_at).toLocaleDateString('es-PE')}
                                        </span>
                                      </div>
                                      <p className="text-sm text-[var(--nav-muted)] mt-1">{notification.message}</p>
                                      {!notification.read && (
                                        <button
                                          onClick={() => markAsRead(notification.id)}
                                          className="text-sm text-blue-500 hover:text-blue-600 mt-2"
                                        >
                                          Marcar como leído
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Container */}
      <ToastContainer toasts={toasts} dismissToast={dismissToast} />
      
      {/* Modal de dirección */}
      <AddressModal
        isOpen={showAddressModal}
        onClose={() => {
          setShowAddressModal(false);
          setEditingAddress(null);
        }}
        address={editingAddress}
        onSave={(data) => {
          if (editingAddress) {
            handleUpdateAddress(data);
          } else {
            handleAddAddress(data);
          }
        }}
        loading={loading}
      />
      
      {/* Modal para agregar tarjeta */}
      <AddCardModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        onSave={handleAddPaymentMethod}
        loading={loading}
      />
      
      {/* Modal de detalles del pedido */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          statusInfo={getOrderStatusInfo(selectedOrder.status)}
          paymentInfo={getPaymentMethodInfo(selectedOrder.payment_method)}
          formatDate={formatDate}
          onCancelOrder={handleCancelOrder}
          canCancelOrder={canCancelOrder}
        />
      )}
    </>
  );
};

export default Account;