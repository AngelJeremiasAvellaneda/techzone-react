// src/pages/Checkout.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { useCheckout } from "../hooks/useCheckout";
import {
  CreditCard,
  Truck,
  Package,
  Shield,
  ArrowLeft,
  Lock,
  CheckCircle,
  AlertCircle,
  MapPin,
  User,
  Mail,
  Phone,
  Home,
  Building,
  Smartphone,
  Wallet
} from "lucide-react";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, totalItems, totalPrice, emptyCart } = useCart();
  const { user, profile } = useAuth();
  const { processCheckout, saveAddress, loading: checkoutLoading } = useCheckout();

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
  
  // Calcular costos
  const shippingCost = totalPrice > 100 ? 0 : 10;
  const taxRate = 0.18; // 18% IGV
  const subtotal = totalPrice;
  const taxAmount = subtotal * taxRate;
  const finalTotal = subtotal + shippingCost + taxAmount;

  // Cargar datos del usuario y direcciones
  useEffect(() => {
    if (user) {
      loadSavedAddresses();
      loadUserProfile();
    }
  }, [user]);

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
      
      // Seleccionar dirección por defecto si existe
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
    // Limpiar error del campo
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
      discountAmount: 0,
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
      navigate("/checkout/success", {
        state: {
          orderId: result.orderId,
          orderNumber: `ORD-${String(result.orderId).padStart(6, '0')}`,
          total: finalTotal,
          customerEmail: formData.email,
          customerName: formData.full_name,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        }
      });
      
      // Vaciar carrito después de éxito
      emptyCart();
    } else {
      alert("Hubo un error procesando tu pedido: " + result.error);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <main className="mt-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-12">
          <div className="text-center py-20">
            <AlertCircle className="w-24 h-24 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-[var(--text)] mb-4">
              Carrito vacío
            </h1>
            <p className="text-[var(--nav-muted)] mb-8">
              Agrega productos a tu carrito antes de proceder al pago.
            </p>
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--accent)] text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al carrito
            </Link>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <main className="mt-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-[var(--nav-muted)]">
          <Link to="/" className="hover:text-[var(--accent)] transition-colors">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <Link to="/cart" className="hover:text-[var(--accent)] transition-colors">
            Carrito
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--text)]">Checkout</span>
        </nav>

        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-2">
            Finalizar Compra
          </h1>
          <p className="text-[var(--nav-muted)]">
            Completa tus datos para procesar el pedido
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
          {/* Columna izquierda - Formulario */}
          <div className="lg:col-span-2 space-y-8">
            {/* Direcciones guardadas */}
            {user && savedAddresses.length > 0 && (
              <section className="bg-[var(--menu-bg)] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="w-6 h-6 text-[var(--accent)]" />
                  <h2 className="text-xl font-bold text-[var(--text)]">
                    Direcciones Guardadas
                  </h2>
                </div>

                <div className="space-y-3">
                  {savedAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        selectedAddressId === address.id
                          ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-[var(--accent)]/50'
                      }`}
                      onClick={() => {
                        setSelectedAddressId(address.id);
                        populateFormFromAddress(address);
                      }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-[var(--text)]">
                              {address.full_name}
                            </span>
                            {address.is_default && (
                              <span className="px-2 py-1 bg-[var(--accent)] text-white text-xs rounded">
                                Predeterminada
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[var(--nav-muted)] mb-1">
                            {address.address}, {address.district}, {address.city}
                          </p>
                          <p className="text-sm text-[var(--nav-muted)]">
                            {address.phone} • {address.email}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedAddressId === address.id 
                            ? "border-[var(--accent)] bg-[var(--accent)]" 
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
                    className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors text-center"
                  >
                    <span className="text-[var(--accent)] font-medium">
                      + Usar una dirección nueva
                    </span>
                  </button>
                </div>
              </section>
            )}

            {/* Información de envío */}
            <section className="bg-[var(--menu-bg)] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Truck className="w-6 h-6 text-[var(--accent)]" />
                <h2 className="text-xl font-bold text-[var(--text)]">
                  Dirección de Envío
                </h2>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Nombre Completo *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          errors.full_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                        placeholder="Juan Pérez"
                      />
                    </div>
                    {errors.full_name && (
                      <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                        placeholder="juan@ejemplo.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Teléfono *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                          errors.phone ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                        placeholder="+51 999 999 999"
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Tipo de Dirección
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, address_type: 'home'})}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border ${
                          formData.address_type === 'home' 
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' 
                            : 'border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <Home className="w-4 h-4" />
                        Casa
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({...formData, address_type: 'work'})}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border ${
                          formData.address_type === 'work' 
                            ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' 
                            : 'border-gray-300 dark:border-gray-700'
                        }`}
                      >
                        <Building className="w-4 h-4" />
                        Trabajo
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Dirección Completa *
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg border ${
                        errors.address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      } bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                      placeholder="Av. Ejemplo 123"
                    />
                  </div>
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Distrito *
                    </label>
                    <input
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.district ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      } bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                      placeholder="Miraflores"
                    />
                    {errors.district && (
                      <p className="text-red-500 text-sm mt-1">{errors.district}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        errors.city ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                      } bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                      placeholder="Lima"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      name="zip_code"
                      value={formData.zip_code}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      placeholder="15074"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--text)] mb-2">
                    Instrucciones de entrega
                  </label>
                  <textarea
                    name="delivery_instructions"
                    value={formData.delivery_instructions}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] resize-none"
                    placeholder="Ej: Timbre 3 veces, dejar con el portero, etc."
                  />
                </div>

                {user && !selectedAddressId && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="save_address"
                      checked={saveAddressChecked}
                      onChange={(e) => setSaveAddressChecked(e.target.checked)}
                      className="w-4 h-4 text-[var(--accent)] rounded focus:ring-[var(--accent)]"
                    />
                    <label htmlFor="save_address" className="text-sm text-[var(--text)]">
                      Guardar esta dirección para futuras compras
                    </label>
                  </div>
                )}
              </div>
            </section>

            {/* Dirección de facturación */}
            <section className="bg-[var(--menu-bg)] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <Wallet className="w-6 h-6 text-[var(--accent)]" />
                <h2 className="text-xl font-bold text-[var(--text)]">
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
                    className="w-4 h-4 text-[var(--accent)] rounded focus:ring-[var(--accent)]"
                  />
                  <label htmlFor="same_as_shipping" className="text-sm text-[var(--text)]">
                    Usar la misma dirección de envío para facturación
                  </label>
                </div>

                {!useShippingForBilling && (
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-2">
                          Nombre Completo *
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={billingData.full_name}
                          onChange={handleBillingChange}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.billing_full_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                          } bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                          placeholder="Juan Pérez"
                        />
                        {errors.billing_full_name && (
                          <p className="text-red-500 text-sm mt-1">{errors.billing_full_name}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={billingData.email}
                          onChange={handleBillingChange}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.billing_email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                          } bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                          placeholder="juan@ejemplo.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[var(--text)] mb-2">
                        Dirección Completa *
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={billingData.address}
                        onChange={handleBillingChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          errors.billing_address ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                        } bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                        placeholder="Av. Ejemplo 123"
                      />
                      {errors.billing_address && (
                        <p className="text-red-500 text-sm mt-1">{errors.billing_address}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-2">
                          Ciudad *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={billingData.city}
                          onChange={handleBillingChange}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            errors.billing_city ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                          } bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]`}
                          placeholder="Lima"
                        />
                        {errors.billing_city && (
                          <p className="text-red-500 text-sm mt-1">{errors.billing_city}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[var(--text)] mb-2">
                          Código Postal
                        </label>
                        <input
                          type="text"
                          name="zip_code"
                          value={billingData.zip_code}
                          onChange={handleBillingChange}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                          placeholder="15074"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Método de pago */}
            <section className="bg-[var(--menu-bg)] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-6 h-6 text-[var(--accent)]" />
                <h2 className="text-xl font-bold text-[var(--text)]">
                  Método de Pago
                </h2>
              </div>

              <div className="space-y-4">
                <div 
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "tarjeta" 
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-[var(--accent)]'
                  }`}
                  onClick={() => setPaymentMethod("tarjeta")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "tarjeta" 
                        ? "border-[var(--accent)] bg-[var(--accent)]" 
                        : "border-gray-300"
                    }`}>
                      {paymentMethod === "tarjeta" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold text-[var(--text)]">
                        Tarjeta de Crédito/Débito
                      </h3>
                      <p className="text-sm text-[var(--nav-muted)]">
                        Pago seguro con cifrado SSL
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                    <div className="w-8 h-5 bg-gray-200 rounded"></div>
                  </div>
                </div>

                <div 
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "yape" 
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-[var(--accent)]'
                  }`}
                  onClick={() => setPaymentMethod("yape")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "yape" 
                        ? "border-[var(--accent)] bg-[var(--accent)]" 
                        : "border-gray-300"
                    }`}>
                      {paymentMethod === "yape" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <Smartphone className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold text-[var(--text)]">
                        Yape / Plin
                      </h3>
                      <p className="text-sm text-[var(--nav-muted)]">
                        Pago rápido con QR
                      </p>
                    </div>
                  </div>
                </div>

                <div 
                  className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    paymentMethod === "efectivo" 
                      ? 'border-[var(--accent)] bg-[var(--accent)]/10' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-[var(--accent)]'
                  }`}
                  onClick={() => setPaymentMethod("efectivo")}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      paymentMethod === "efectivo" 
                        ? "border-[var(--accent)] bg-[var(--accent)]" 
                        : "border-gray-300"
                    }`}>
                      {paymentMethod === "efectivo" && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <Wallet className="w-5 h-5" />
                    <div>
                      <h3 className="font-semibold text-[var(--text)]">
                        Pago contra entrega
                      </h3>
                      <p className="text-sm text-[var(--nav-muted)]">
                        Paga al recibir tu pedido
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Columna derecha - Resumen */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 space-y-6">
              {/* Resumen del pedido */}
              <div className="bg-[var(--menu-bg)] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-xl font-bold text-[var(--text)] mb-6">
                  Resumen del Pedido
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-[var(--text)]">
                    <span>Subtotal ({totalItems} productos)</span>
                    <span className="font-semibold">
                      S/. {subtotal.toLocaleString("es-PE")}
                    </span>
                  </div>

                  <div className="flex justify-between text-[var(--text)]">
                    <span>Envío</span>
                    <span className="font-semibold">
                      {shippingCost === 0 ? (
                        <span className="text-green-600">¡Gratis!</span>
                      ) : (
                        `S/. ${shippingCost.toLocaleString("es-PE")}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-[var(--text)]">
                    <span>IGV (18%)</span>
                    <span className="font-semibold">
                      S/. {taxAmount.toLocaleString("es-PE")}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-[var(--text)]">
                        Total
                      </span>
                      <span className="text-2xl font-bold text-[var(--accent)]">
                        S/. {finalTotal.toLocaleString("es-PE")}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--nav-muted)] mt-2">
                      Incluye IGV
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
                      className="w-4 h-4 text-[var(--accent)] rounded focus:ring-[var(--accent)] mt-1"
                    />
                    <label htmlFor="terms" className="text-sm text-[var(--text)]">
                      Acepto los{' '}
                      <Link to="/terms" className="text-[var(--accent)] hover:underline">
                        Términos y Condiciones
                      </Link>{' '}
                      y la{' '}
                      <Link to="/privacy" className="text-[var(--accent)] hover:underline">
                        Política de Privacidad
                      </Link>
                    </label>
                  </div>
                </div>

                {/* Botón de confirmación */}
                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--accent)] hover:opacity-90 disabled:opacity-50 text-white rounded-lg font-bold text-lg transition-all shadow-lg"
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
                    </>
                  )}
                </button>

                <p className="text-xs text-center text-[var(--nav-muted)] mt-4 flex items-center justify-center gap-1">
                  <Shield className="w-3 h-3" />
                  Pago 100% seguro - Tus datos están protegidos
                </p>
              </div>

              {/* Productos en el carrito */}
              <div className="bg-[var(--menu-bg)] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="font-bold text-[var(--text)] mb-4">
                  Tu Pedido ({totalItems})
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[var(--text)] line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-[var(--nav-muted)]">
                          {item.quantity} × S/. {item.price.toLocaleString("es-PE")}
                        </p>
                      </div>
                      <div className="font-semibold text-[var(--accent)]">
                        S/. {(item.price * item.quantity).toLocaleString("es-PE")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Beneficios */}
              <div className="bg-[var(--menu-bg)] rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[var(--text)] mb-1">
                      Envío Garantizado
                    </h3>
                    <p className="text-sm text-[var(--nav-muted)]">
                      Entrega en 2-5 días hábiles
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[var(--text)] mb-1">
                      Garantía extendida
                    </h3>
                    <p className="text-sm text-[var(--nav-muted)]">
                      1 año de garantía en todos los productos
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[var(--text)] mb-1">
                      Devolución fácil
                    </h3>
                    <p className="text-sm text-[var(--nav-muted)]">
                      30 días para cambios o devoluciones
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
    </>
  );
};

export default Checkout;