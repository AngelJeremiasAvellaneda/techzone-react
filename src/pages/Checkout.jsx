// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../context/AuthContext";
import { useCheckout } from "../hooks/useCheckout";
import { supabase } from "../lib/supabaseClient";
import { ChevronRight } from "lucide-react";
import {
  CreditCard, Truck, Package, Shield, ArrowLeft, Lock,
  CheckCircle, AlertCircle, MapPin, User, Mail, Phone,
  Home, Building, Smartphone, Wallet, Gift, Tag,
  ChevronDown, ChevronUp, Star, RefreshCw, X, QrCode,
  Sparkles, Shield as ShieldIcon, Clock, Zap, Award,
  ShieldCheck, CreditCard as CardIcon, DollarSign,
  ShoppingBag, ArrowRight, Loader, Check
} from "lucide-react";
import { toast } from "react-hot-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalItems, totalPrice, emptyCart } = useCart();
  const { user, profile, loading } = useAuth();
  const { processCheckout, loading: checkoutLoading } = useCheckout();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    country: "Perú",
    zip_code: "",
    delivery_instructions: "",
    address_type: "home"
  });

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("tarjeta");
  const [saveAddressChecked, setSaveAddressChecked] = useState(true);
  const [useShippingForBilling, setUseShippingForBilling] = useState(true);
  const [billingData, setBillingData] = useState({ ...formData });
  const [errors, setErrors] = useState({});
  const [showSavedAddresses, setShowSavedAddresses] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState("");
  
  // Calcular costos
  const shippingCost = totalPrice > 100 ? 0 : 10;
  const taxRate = 0.18; // 18% IGV
  const subtotal = totalPrice - couponDiscount;
  const taxAmount = subtotal * taxRate;
  const finalTotal = subtotal + shippingCost + taxAmount;
  
  // Cargar datos del usuario y direcciones
  useEffect(() => {
    if (!user || loading) return; 
    loadSavedAddresses();
    loadUserProfile();
  }, [user, loading]);

  const loadUserProfile = () => {
    if (profile) {
      setFormData(prev => ({
        ...prev,
        full_name: profile.full_name || "",
        email: user.email || "",
        phone: profile.phone || ""
      }));
      setBillingData(prev => ({
        ...prev,
        full_name: profile.full_name || "",
        email: user.email || "",
        phone: profile.phone || ""
      }));
    }
  };

  const loadSavedAddresses = async () => {
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;

      setSavedAddresses(data || []);
      
      const defaultAddress = data?.find(addr => addr.is_default);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        populateFormFromAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const populateFormFromAddress = (address) => {
    setFormData({
      full_name: address.full_name || "",
      email: address.email || user?.email || "",
      phone: address.phone || "",
      address: address.address || "",
      city: address.city || "",
      district: address.district || "",
      country: address.country || "Perú",
      zip_code: address.zip_code || "",
      delivery_instructions: address.delivery_instructions || "",
      address_type: address.address_type || "home"
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ""
      });
    }
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingData({
      ...billingData,
      [name]: value
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validar dirección de envío
    if (!formData.full_name.trim()) newErrors.full_name = "El nombre completo es requerido";
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es requerido";
    if (!formData.address.trim()) newErrors.address = "La dirección es requerida";
    if (!formData.city.trim()) newErrors.city = "La ciudad es requerida";
    if (!formData.district.trim()) newErrors.district = "El distrito es requerido";

    // Validar dirección de facturación si es diferente
    if (!useShippingForBilling) {
      if (!billingData.full_name.trim()) newErrors.billing_full_name = "El nombre completo es requerido";
      if (!billingData.address.trim()) newErrors.billing_address = "La dirección es requerida";
      if (!billingData.city.trim()) newErrors.billing_city = "La ciudad es requerida";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const applyCoupon = async () => {
    if (!appliedCoupon.trim()) {
      setCouponError("Ingresa un código de cupón");
      return;
    }

    try {
      // Simular validación de cupón
      const validCoupons = {
        "TECH10": 0.1, // 10% de descuento
        "TECH20": 0.2, // 20% de descuento
        "WELCOME": 15, // S/ 15 de descuento
      };

      const coupon = appliedCoupon.toUpperCase();
      const discount = validCoupons[coupon];

      if (discount) {
        let discountAmount;
        if (discount < 1) {
          // Porcentaje
          discountAmount = totalPrice * discount;
        } else {
          // Monto fijo
          discountAmount = Math.min(discount, totalPrice);
        }

        setCouponDiscount(discountAmount);
        setCouponError("");
        toast.success(`¡Cupón aplicado! Descuento: S/. ${discountAmount.toFixed(2)}`);
      } else {
        setCouponError("Cupón no válido o expirado");
        toast.error("Cupón no válido");
      }
    } catch (error) {
      setCouponError("Error al validar el cupón");
      toast.error("Error al aplicar el cupón");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon("");
    setCouponDiscount(0);
    setCouponError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Por favor, completa todos los campos requeridos");
      return;
    }

    // Preparar datos para el checkout
    const checkoutData = {
      userId: user?.id,
      items: cart,
      total: finalTotal,
      subtotal: subtotal,
      shippingCost: shippingCost,
      taxAmount: taxAmount,
      discountAmount: couponDiscount,
      couponCode: appliedCoupon || null,
      shippingAddress: formData,
      billingAddress: useShippingForBilling ? formData : billingData,
      paymentMethod: paymentMethod,
      saveAddress: saveAddressChecked && user,
      addressId: selectedAddressId
    };

    // Procesar el checkout
    const result = await processCheckout(checkoutData);
    
    if (result.success) {
      // Redirigir a confirmación exitosa
      navigate("/checkout/checkout-success", {
        state: {
          orderId: result.orderId,
          orderNumber: `ORD-${String(result.orderId).padStart(6, '0')}`,
          total: finalTotal,
          customerEmail: formData.email,
          customerName: formData.full_name,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          paymentMethod: paymentMethod
        }
      });
      
      // Vaciar carrito después de éxito
      emptyCart();
    } else {
      toast.error(`Hubo un error procesando tu pedido: ${result.error}`);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-full flex items-center justify-center">
            <AlertCircle className="w-12 h-12 text-amber-600 dark:text-amber-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Carrito Vacío
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Agrega productos a tu carrito antes de proceder al pago.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              <Home className="w-5 h-5" />
              Ir al Inicio
            </Link>
            <Link
              to="/productos"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl hover:border-indigo-500 dark:hover:border-indigo-500 transition-all duration-300"
            >
              <ShoppingBag className="w-5 h-5" />
              Ver Productos
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getPaymentMethodInfo = (method) => {
    const methods = {
      tarjeta: {
        name: 'Tarjeta de Crédito/Débito',
        icon: CardIcon,
        color: 'text-blue-600 dark:text-blue-400',
        badge: 'Más seguro',
        features: ['Pago instantáneo', 'Cifrado SSL', 'Verificación 3D Secure']
      },
      yape: {
        name: 'Yape',
        icon: Smartphone,
        color: 'text-purple-600 dark:text-purple-400',
        badge: 'Más rápido',
        features: ['Pago con QR', 'Sin comisiones', 'Confirmación inmediata']
      },
      plin: {
        name: 'Plin',
        icon: Smartphone,
        color: 'text-green-600 dark:text-green-400',
        badge: 'Más rápido',
        features: ['Pago con QR', 'Sin comisiones', 'Confirmación inmediata']
      },
      efectivo: {
        name: 'Pago contra entrega',
        icon: DollarSign,
        color: 'text-emerald-600 dark:text-emerald-400',
        badge: 'Sin tarjeta',
        features: ['Paga al recibir', 'Sin comisiones', 'Efectivo o tarjeta']
      }
    };
    
    return methods[method] || methods.tarjeta;
  };

  const paymentInfo = getPaymentMethodInfo(paymentMethod);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Link to="/" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <Link to="/cart" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Carrito
            </Link>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span className="text-gray-900 dark:text-white font-medium">Checkout</span>
          </div>
        </nav>

        {/* Título */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Finalizar Compra
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Completa tus datos para procesar el pedido de forma segura
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Formulario */}
          <div className="lg:col-span-2 space-y-8">
            {/* Direcciones guardadas */}
            {user && savedAddresses.length > 0 && (
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                      <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Direcciones Guardadas
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSavedAddresses(!showSavedAddresses)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    {showSavedAddresses ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {showSavedAddresses && (
                  <div className="space-y-3 mb-4">
                    {savedAddresses.map((address) => (
                      <div
                        key={address.id}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedAddressId === address.id
                            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                        onClick={() => {
                          setSelectedAddressId(address.id);
                          populateFormFromAddress(address);
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {address.full_name}
                              </span>
                              {address.is_default && (
                                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-full">
                                  Predeterminada
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              {address.address}, {address.district}, {address.city}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                              {address.phone} • {address.email}
                            </p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedAddressId === address.id 
                              ? "border-indigo-500 bg-indigo-500" 
                              : "border-gray-300"
                          }`}>
                            {selectedAddressId === address.id && (
                              <div className="w-2 h-2 rounded-full bg-white"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAddressId(null);
                        setFormData({
                          full_name: profile?.full_name || "",
                          email: user?.email || "",
                          phone: profile?.phone || "",
                          address: "",
                          city: "",
                          district: "",
                          country: "Perú",
                          zip_code: "",
                          delivery_instructions: "",
                          address_type: "home"
                        });
                      }}
                      className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all duration-300 text-center"
                    >
                      <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                        + Usar una dirección nueva
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Información de envío */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Truck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Información de Envío
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Nombre Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${
                          errors.full_name ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                        } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                        placeholder="Juan Pérez"
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-rose-500 text-sm mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${
                          errors.email ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                        } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                        placeholder="juan@ejemplo.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-rose-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Teléfono *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${
                          errors.phone ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                        } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                        placeholder="+51 999 999 999"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-rose-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Tipo de Dirección
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, address_type: 'home'})}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all duration-300 ${
                          formData.address_type === 'home' 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                            : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        <Home className="w-4 h-4" />
                        Casa
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, address_type: 'work'})}
                        className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border transition-all duration-300 ${
                          formData.address_type === 'work' 
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                            : 'border-gray-300 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                        }`}
                      >
                        <Building className="w-4 h-4" />
                        Trabajo
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Dirección Completa *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl border ${
                        errors.address ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                      } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                      placeholder="Av. Ejemplo 123, Dpto 401"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-rose-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Distrito *
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3.5 rounded-xl border ${
                        errors.district ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                      } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                      placeholder="Miraflores"
                    />
                    {errors.district && (
                      <p className="text-rose-500 text-sm mt-1">{errors.district}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3.5 rounded-xl border ${
                        errors.city ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                      } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                      placeholder="Lima"
                    />
                    {errors.city && (
                      <p className="text-rose-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                      placeholder="15074"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Instrucciones de entrega (opcional)
                  </label>
                  <textarea
                    name="delivery_instructions"
                    value={formData.delivery_instructions}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all duration-300"
                    placeholder="Ej: Llamar antes de llegar, entregar al portero, etc."
                  />
                </div>

                {user && !selectedAddressId && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="save_address"
                      checked={saveAddressChecked}
                      onChange={(e) => setSaveAddressChecked(e.target.checked)}
                      className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="save_address" className="text-sm text-gray-900 dark:text-white">
                      Guardar esta dirección para futuras compras
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Dirección de facturación */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Wallet className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Dirección de Facturación
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="same_as_shipping"
                    checked={useShippingForBilling}
                    onChange={(e) => setUseShippingForBilling(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="same_as_shipping" className="text-sm text-gray-900 dark:text-white">
                    Usar la misma dirección de envío para facturación
                  </label>
                </div>

                {!useShippingForBilling && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={billingData.full_name}
                          onChange={handleBillingChange}
                          className={`w-full px-4 py-3.5 rounded-xl border ${
                            errors.billing_full_name ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                          } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                          placeholder="Juan Pérez"
                        />
                        {errors.billing_full_name && (
                          <p className="text-rose-500 text-sm mt-1">{errors.billing_full_name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={billingData.email}
                          onChange={handleBillingChange}
                          className={`w-full px-4 py-3.5 rounded-xl border ${
                            errors.billing_email ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                          } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                          placeholder="juan@ejemplo.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Dirección Completa *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={billingData.address}
                        onChange={handleBillingChange}
                        className={`w-full px-4 py-3.5 rounded-xl border ${
                          errors.billing_address ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                        } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                        placeholder="Av. Ejemplo 123"
                      />
                      {errors.billing_address && (
                        <p className="text-rose-500 text-sm mt-1">{errors.billing_address}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={billingData.city}
                          onChange={handleBillingChange}
                          className={`w-full px-4 py-3.5 rounded-xl border ${
                            errors.billing_city ? 'border-rose-500' : 'border-gray-300 dark:border-gray-700'
                          } bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300`}
                          placeholder="Lima"
                        />
                        {errors.billing_city && (
                          <p className="text-rose-500 text-sm mt-1">{errors.billing_city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Código Postal
                        </label>
                        <input
                          type="text"
                          name="zip_code"
                          value={billingData.zip_code}
                          onChange={handleBillingChange}
                          className="w-full px-4 py-3.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300"
                          placeholder="15074"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Método de pago */}
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                  <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Método de Pago
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div 
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === "tarjeta" 
                      ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                  }`}
                  onClick={() => setPaymentMethod("tarjeta")}
                >
                  {paymentMethod === "tarjeta" && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${paymentMethod === "tarjeta" ? 'bg-indigo-100 dark:bg-indigo-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <CardIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Tarjeta de Crédito/Débito
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pago seguro con cifrado SSL
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded"></div>
                    <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
                    <div className="w-8 h-5 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded"></div>
                  </div>
                </div>

                <div 
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === "yape" 
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-900/20 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
                  }`}
                  onClick={() => setPaymentMethod("yape")}
                >
                  {paymentMethod === "yape" && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${paymentMethod === "yape" ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <Smartphone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Yape
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pago rápido con QR
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <QrCode className="w-4 h-4" />
                    Escanea y paga
                  </div>
                </div>

                <div 
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === "plin" 
                      ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                  }`}
                  onClick={() => setPaymentMethod("plin")}
                >
                  {paymentMethod === "plin" && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${paymentMethod === "plin" ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <Smartphone className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Plin
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Pago rápido con QR
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    <QrCode className="w-4 h-4" />
                    Escanea y paga
                  </div>
                </div>

                <div 
                  className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-300 ${
                    paymentMethod === "efectivo" 
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 shadow-lg scale-[1.02]' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                  onClick={() => setPaymentMethod("efectivo")}
                >
                  {paymentMethod === "efectivo" && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${paymentMethod === "efectivo" ? 'bg-emerald-100 dark:bg-emerald-900/40' : 'bg-gray-100 dark:bg-gray-800'}`}>
                      <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        Pago contra entrega
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Paga al recibir tu pedido
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Efectivo o tarjeta
                  </div>
                </div>
              </div>

              {/* Detalles del método seleccionado */}
              <div className="mt-6 p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${paymentInfo.color.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')}/20`}>
                    <paymentInfo.icon className={`w-5 h-5 ${paymentInfo.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {paymentInfo.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                        {paymentInfo.badge}
                      </span>
                    </div>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  {paymentInfo.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Columna derecha - Resumen */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Resumen del pedido */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Resumen del Pedido
                </h2>

                {/* Productos */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {item.quantity} × S/. {item.price.toLocaleString("es-PE")}
                        </p>
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        S/. {(item.price * item.quantity).toLocaleString("es-PE")}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cupón */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">¿Tienes un cupón?</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={appliedCoupon}
                      onChange={(e) => setAppliedCoupon(e.target.value)}
                      placeholder="Código de cupón"
                      className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {couponDiscount > 0 ? (
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="px-4 py-2.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={applyCoupon}
                        className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Aplicar
                      </button>
                    )}
                  </div>
                  {couponError && (
                    <p className="text-rose-500 text-sm mt-2">{couponError}</p>
                  )}
                  {couponDiscount > 0 && (
                    <p className="text-emerald-600 dark:text-emerald-400 text-sm mt-2">
                      Descuento aplicado: S/. {couponDiscount.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Totales */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({totalItems} productos)</span>
                    <span className="font-semibold">
                      S/. {(totalPrice - couponDiscount).toLocaleString("es-PE")}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Envío</span>
                    <span className="font-semibold">
                      {shippingCost === 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">¡Gratis!</span>
                      ) : (
                        `S/. ${shippingCost.toLocaleString("es-PE")}`
                      )}
                    </span>
                  </div>

                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Descuento cupón</span>
                      <span className="font-semibold">
                        -S/. {couponDiscount.toLocaleString("es-PE")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>IGV (18%)</span>
                    <span className="font-semibold">
                      S/. {taxAmount.toLocaleString("es-PE")}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        S/. {finalTotal.toLocaleString("es-PE")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                      Incluye IGV • {totalItems} producto{totalItems !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Términos y condiciones */}
                <div className="mb-6">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      required
                      className="w-5 h-5 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500 mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-gray-900 dark:text-white">
                      Acepto los{' '}
                      <Link to="/terms" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Términos y Condiciones
                      </Link>{' '}
                      y la{' '}
                      <Link to="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:underline">
                        Política de Privacidad
                      </Link>
                    </label>
                  </div>
                </div>

                {/* Botón de confirmación */}
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl group"
                >
                  {checkoutLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      Confirmar y Pagar
                      <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-gray-600 dark:text-gray-400 mt-4 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Pago 100% seguro • Tus datos están protegidos
                </p>
              </div>

              {/* Garantías */}
              <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                    <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Compra Segura
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Transacciones cifradas con tecnología SSL
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Devolución Fácil
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      30 días para cambios o devoluciones
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex-shrink-0">
                    <Truck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Envío Garantizado
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Entrega en 2-5 días hábiles con seguimiento
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex-shrink-0">
                    <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                      Soporte 24/7
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Asistencia disponible las 24 horas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;