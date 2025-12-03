import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import AdminLayout from './AdminLayout';
import { useAuth } from '../../hooks/useAuth';
import {
  Settings as SettingsIcon, Save, Globe, CreditCard,
  Truck, Mail, Bell, Shield, Users, FileText,
  Image, Palette, Database, Key, ShoppingBag,
  RefreshCw, CheckCircle, AlertCircle, ExternalLink,
  Upload, Trash2, Plus, Edit, Eye, EyeOff
} from 'lucide-react';

const AdminSettings = () => {
  const { profile, updateProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  // Configuración general
  const [generalSettings, setGeneralSettings] = useState({
    storeName: 'TechZone',
    storeEmail: 'contacto@techzone.com',
    storePhone: '+51 123 456 789',
    storeAddress: 'Av. Principal 123, Lima, Perú',
    currency: 'PEN',
    timezone: 'America/Lima',
    language: 'es',
    maintenanceMode: false,
    storeDescription: 'Tu tienda de tecnología de confianza'
  });

  // Configuración de pagos
  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: true,
    stripePublicKey: '',
    stripeSecretKey: '',
    stripeWebhookSecret: '',
    paypalEnabled: true,
    paypalClientId: '',
    paypalClientSecret: '',
    cashOnDelivery: true,
    bankTransfer: true,
    defaultPaymentMethod: 'stripe',
    testMode: true
  });

  // Configuración de envíos
  const [shippingSettings, setShippingSettings] = useState({
    freeShippingEnabled: true,
    freeShippingThreshold: 500,
    flatRateShipping: true,
    flatRateAmount: 15,
    localPickup: true,
    shippingZones: [
      { id: 1, name: 'Lima Metropolitana', price: 10, enabled: true },
      { id: 2, name: 'Provincias', price: 25, enabled: true },
      { id: 3, name: 'Internacional', price: 50, enabled: true }
    ],
    defaultShippingZone: 1
  });

  // Configuración de emails
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUsername: '',
    smtpPassword: '',
    smtpEncryption: 'tls',
    senderName: 'TechZone',
    senderEmail: 'no-reply@techzone.com',
    orderConfirmation: true,
    shippingNotification: true,
    newsletterEnabled: true,
    emailTemplate: 'modern'
  });

  // Configuración de notificaciones
  const [notificationSettings, setNotificationSettings] = useState({
    newOrder: true,
    lowStock: true,
    newCustomer: true,
    orderStatusChange: true,
    emailNotifications: true,
    pushNotifications: false,
    notificationSound: true,
    desktopNotifications: true,
    notificationEmail: 'admin@techzone.com'
  });

  // Configuración de seguridad
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAttempts: 5,
    sessionTimeout: 30,
    passwordStrength: 'medium',
    ipWhitelist: [],
    apiRateLimit: 100,
    sslEnabled: true,
    corsEnabled: true
  });

  // Configuración de usuarios
  const [userSettings, setUserSettings] = useState({
    userRegistration: true,
    emailVerification: true,
    socialLogin: true,
    defaultUserRole: 'customer',
    profileCompletion: true,
    allowReviews: true,
    allowWishlist: true,
    privacyPolicyUrl: '/privacy',
    termsUrl: '/terms'
  });

  // Configuración de temas
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: '#8B5CF6',
    secondaryColor: '#10B981',
    backgroundColor: '#FFFFFF',
    textColor: '#1F2937',
    darkMode: false,
    fontFamily: 'Inter',
    borderRadius: '8',
    shadowIntensity: 'medium',
    customCSS: ''
  });

  // Configuración de SEO
  const [seoSettings, setSeoSettings] = useState({
    metaTitle: 'TechZone - Tu Tienda de Tecnología',
    metaDescription: 'Encuentra las mejores laptops, desktops y accesorios tecnológicos al mejor precio',
    metaKeywords: 'tecnología, laptops, computadoras, accesorios, gaming',
    ogImage: '',
    twitterCard: 'summary_large_image',
    robotsTxt: 'index, follow',
    sitemapEnabled: true,
    analyticsCode: '',
    facebookPixel: '',
    googleTagManager: ''
  });

  // Configuración de integraciones
  const [integrationSettings, setIntegrationSettings] = useState({
    googleAnalytics: '',
    facebookPixel: '',
    mailchimpApiKey: '',
    recaptchaSiteKey: '',
    recaptchaSecretKey: '',
    googleMapsApiKey: '',
    cloudflareEnabled: false,
    cdnEnabled: false
  });

  // Configuración de backup
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    backupTime: '02:00',
    backupRetention: 30,
    backupLocation: 'local',
    s3Bucket: '',
    s3AccessKey: '',
    s3SecretKey: '',
    lastBackup: null
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      // En una implementación real, cargarías las configuraciones desde la base de datos
      // Por ahora, simulamos la carga de datos
      
      // Simular carga
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Aquí iría la lógica real para cargar configuraciones
      // Por ejemplo:
      // const { data } = await supabase.from('settings').select('*');
      
      setMessage({ type: 'success', text: 'Configuraciones cargadas correctamente' });
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Error al cargar configuraciones' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      // Validaciones básicas
      if (!generalSettings.storeName || !generalSettings.storeEmail) {
        throw new Error('Nombre de tienda y email son requeridos');
      }

      // En una implementación real, guardarías cada sección en la base de datos
      // Por ahora, simulamos el guardado

      await new Promise(resolve => setTimeout(resolve, 1500));

      setMessage({ type: 'success', text: 'Configuraciones guardadas correctamente' });
      
      // Mostrar mensaje temporal
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);

    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: error.message || 'Error al guardar configuraciones' });
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (event, settingKey) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Por favor, selecciona una imagen válida' });
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'La imagen es demasiado grande. Máximo 2MB' });
      return;
    }

    try {
      // Aquí iría la lógica real para subir a Supabase Storage
      // Por ahora, creamos un objeto URL temporal
      const imageUrl = URL.createObjectURL(file);
      
      // Actualizar configuración correspondiente
      if (settingKey === 'logo') {
        setGeneralSettings(prev => ({ ...prev, storeLogo: imageUrl }));
      } else if (settingKey === 'favicon') {
        setGeneralSettings(prev => ({ ...prev, favicon: imageUrl }));
      } else if (settingKey === 'ogImage') {
        setSeoSettings(prev => ({ ...prev, ogImage: imageUrl }));
      }

      setMessage({ type: 'success', text: 'Imagen subida correctamente' });
    } catch (error) {
      console.error('Error uploading file:', error);
      setMessage({ type: 'error', text: 'Error al subir la imagen' });
    }
  };

  const testEmailSettings = async () => {
    try {
      // Lógica para probar configuración de email
      setMessage({ type: 'info', text: 'Probando configuración de email...' });
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setMessage({ type: 'success', text: 'Configuración de email probada correctamente' });
    } catch (error) {
      console.error('Error testing email settings:', error);
      setMessage({ type: 'error', text: 'Error al probar configuración de email' });
    }
  };

  const backupNow = async () => {
    try {
      setLoading(true);
      setMessage({ type: 'info', text: 'Creando backup...' });
      
      // Lógica real para crear backup
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const now = new Date();
      setBackupSettings(prev => ({
        ...prev,
        lastBackup: now.toISOString()
      }));
      
      setMessage({ type: 'success', text: 'Backup creado correctamente' });
    } catch (error) {
      console.error('Error creating backup:', error);
      setMessage({ type: 'error', text: 'Error al crear backup' });
    } finally {
      setLoading(false);
    }
  };

  const resetSettings = (section) => {
    if (!window.confirm('¿Estás seguro de que quieres restaurar los valores por defecto?')) {
      return;
    }

    switch (section) {
      case 'general':
        setGeneralSettings({
          storeName: 'TechZone',
          storeEmail: 'contacto@techzone.com',
          storePhone: '+51 123 456 789',
          storeAddress: 'Av. Principal 123, Lima, Perú',
          currency: 'PEN',
          timezone: 'America/Lima',
          language: 'es',
          maintenanceMode: false,
          storeDescription: 'Tu tienda de tecnología de confianza'
        });
        break;
      case 'payments':
        setPaymentSettings({
          stripeEnabled: true,
          stripePublicKey: '',
          stripeSecretKey: '',
          stripeWebhookSecret: '',
          paypalEnabled: true,
          paypalClientId: '',
          paypalClientSecret: '',
          cashOnDelivery: true,
          bankTransfer: true,
          defaultPaymentMethod: 'stripe',
          testMode: true
        });
        break;
      // ... otros casos
    }

    setMessage({ type: 'success', text: 'Configuraciones restauradas a valores por defecto' });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'shipping', label: 'Envíos', icon: Truck },
    { id: 'emails', label: 'Emails', icon: Mail },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'theme', label: 'Tema', icon: Palette },
    { id: 'seo', label: 'SEO', icon: FileText },
    { id: 'integrations', label: 'Integraciones', icon: ExternalLink },
    { id: 'backup', label: 'Backup', icon: Database }
  ];

  const renderSettingsContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Información de la Tienda
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre de la Tienda *
                  </label>
                  <input
                    type="text"
                    value={generalSettings.storeName}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, storeName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email de Contacto *
                  </label>
                  <input
                    type="email"
                    value={generalSettings.storeEmail}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, storeEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={generalSettings.storePhone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, storePhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={generalSettings.storeAddress}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, storeAddress: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configuración Regional
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Moneda
                  </label>
                  <select
                    value={generalSettings.currency}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="PEN">S/. - Sol Peruano</option>
                    <option value="USD">$ - Dólar Americano</option>
                    <option value="EUR">€ - Euro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Zona Horaria
                  </label>
                  <select
                    value={generalSettings.timezone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="America/Lima">Lima, Perú (GMT-5)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">New York (GMT-4)</option>
                    <option value="Europe/Madrid">Madrid (GMT+2)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Idioma
                  </label>
                  <select
                    value={generalSettings.language}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Logotipo y Favicon
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Logotipo
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    {generalSettings.storeLogo ? (
                      <div className="relative">
                        <img
                          src={generalSettings.storeLogo}
                          alt="Logo"
                          className="w-32 h-32 object-contain mx-auto"
                        />
                        <button
                          onClick={() => setGeneralSettings({ ...generalSettings, storeLogo: '' })}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          PNG, JPG, SVG (Máximo 2MB)
                        </p>
                        <label className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
                          <Upload className="w-4 h-4 inline mr-2" />
                          Subir Logo
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'logo')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Favicon
                  </label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                    {generalSettings.favicon ? (
                      <div className="relative">
                        <img
                          src={generalSettings.favicon}
                          alt="Favicon"
                          className="w-16 h-16 object-contain mx-auto"
                        />
                        <button
                          onClick={() => setGeneralSettings({ ...generalSettings, favicon: '' })}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Image className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          ICO, PNG (32x32px)
                        </p>
                        <label className="inline-block px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
                          <Upload className="w-4 h-4 inline mr-2" />
                          Subir Favicon
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, 'favicon')}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Modo Mantenimiento
                </h3>
                <button
                  onClick={() => resetSettings('general')}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Restaurar valores por defecto
                </button>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="maintenanceMode"
                  checked={generalSettings.maintenanceMode}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                  className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                />
                <label htmlFor="maintenanceMode" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Activar modo mantenimiento (solo administradores podrán acceder)
                </label>
              </div>
              {generalSettings.maintenanceMode && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-400">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    La tienda estará en mantenimiento. Los visitantes verán una página de mantenimiento.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'payments':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Métodos de Pago
              </h3>
              
              <div className="space-y-4">
                {/* Stripe */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="stripeEnabled"
                        checked={paymentSettings.stripeEnabled}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeEnabled: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="stripeEnabled" className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                        Stripe
                      </label>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-full">
                      Recomendado
                    </span>
                  </div>
                  
                  {paymentSettings.stripeEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Clave Pública
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={paymentSettings.stripePublicKey}
                            onChange={(e) => setPaymentSettings({ ...paymentSettings, stripePublicKey: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                            placeholder="pk_live_..."
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Clave Secreta
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={paymentSettings.stripeSecretKey}
                            onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeSecretKey: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                            placeholder="sk_live_..."
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* PayPal */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="paypalEnabled"
                        checked={paymentSettings.paypalEnabled}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalEnabled: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="paypalEnabled" className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                        PayPal
                      </label>
                    </div>
                  </div>
                  
                  {paymentSettings.paypalEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Client ID
                        </label>
                        <input
                          type="text"
                          value={paymentSettings.paypalClientId}
                          onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalClientId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="AeAAL..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Client Secret
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={paymentSettings.paypalClientSecret}
                            onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalClientSecret: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Métodos tradicionales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="cashOnDelivery"
                        checked={paymentSettings.cashOnDelivery}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, cashOnDelivery: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="cashOnDelivery" className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                        Contrareembolso
                      </label>
                    </div>
                  </div>
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="bankTransfer"
                        checked={paymentSettings.bankTransfer}
                        onChange={(e) => setPaymentSettings({ ...paymentSettings, bankTransfer: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="bankTransfer" className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                        Transferencia Bancaria
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configuración General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Método de Pago por Defecto
                  </label>
                  <select
                    value={paymentSettings.defaultPaymentMethod}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, defaultPaymentMethod: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="stripe">Tarjeta de Crédito (Stripe)</option>
                    <option value="paypal">PayPal</option>
                    <option value="cash">Contrareembolso</option>
                    <option value="transfer">Transferencia Bancaria</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="testMode"
                      checked={paymentSettings.testMode}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, testMode: e.target.checked })}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <label htmlFor="testMode" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                      Modo de prueba (Sandbox)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => resetSettings('payments')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Restaurar valores por defecto
              </button>
              <a
                href="https://dashboard.stripe.com/test/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Obtener claves de Stripe
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        );

      case 'shipping':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configuración de Envíos
              </h3>
              
              <div className="space-y-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="freeShippingEnabled"
                        checked={shippingSettings.freeShippingEnabled}
                        onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingEnabled: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="freeShippingEnabled" className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                        Envío Gratis
                      </label>
                    </div>
                  </div>
                  
                  {shippingSettings.freeShippingEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monto mínimo para envío gratis (S/.)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          S/.
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={shippingSettings.freeShippingThreshold}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                          className="pl-12 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="flatRateShipping"
                        checked={shippingSettings.flatRateShipping}
                        onChange={(e) => setShippingSettings({ ...shippingSettings, flatRateShipping: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="flatRateShipping" className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                        Tarifa Plana
                      </label>
                    </div>
                  </div>
                  
                  {shippingSettings.flatRateShipping && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Monto de tarifa plana (S/.)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          S/.
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={shippingSettings.flatRateAmount}
                          onChange={(e) => setShippingSettings({ ...shippingSettings, flatRateAmount: parseFloat(e.target.value) || 0 })}
                          className="pl-12 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="localPickup"
                        checked={shippingSettings.localPickup}
                        onChange={(e) => setShippingSettings({ ...shippingSettings, localPickup: e.target.checked })}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="localPickup" className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                        Recojo en Tienda
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Zonas de Envío
                </h3>
                <button
                  onClick={() => {
                    const newZone = {
                      id: shippingSettings.shippingZones.length + 1,
                      name: 'Nueva Zona',
                      price: 0,
                      enabled: true
                    };
                    setShippingSettings({
                      ...shippingSettings,
                      shippingZones: [...shippingSettings.shippingZones, newZone]
                    });
                  }}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Zona
                </button>
              </div>
              
              <div className="space-y-3">
                {shippingSettings.shippingZones.map((zone) => (
                  <div key={zone.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="checkbox"
                          checked={zone.enabled}
                          onChange={(e) => {
                            const updatedZones = shippingSettings.shippingZones.map(z =>
                              z.id === zone.id ? { ...z, enabled: e.target.checked } : z
                            );
                            setShippingSettings({ ...shippingSettings, shippingZones: updatedZones });
                          }}
                          className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                        />
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) => {
                            const updatedZones = shippingSettings.shippingZones.map(z =>
                              z.id === zone.id ? { ...z, name: e.target.value } : z
                            );
                            setShippingSettings({ ...shippingSettings, shippingZones: updatedZones });
                          }}
                          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      </div>
                      <button
                        onClick={() => {
                          const updatedZones = shippingSettings.shippingZones.filter(z => z.id !== zone.id);
                          setShippingSettings({ ...shippingSettings, shippingZones: updatedZones });
                        }}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Precio (S/.)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                            S/.
                          </span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={zone.price}
                            onChange={(e) => {
                              const updatedZones = shippingSettings.shippingZones.map(z =>
                                z.id === zone.id ? { ...z, price: parseFloat(e.target.value) || 0 } : z
                              );
                              setShippingSettings({ ...shippingSettings, shippingZones: updatedZones });
                            }}
                            className="pl-12 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            // Lógica para editar países/regiones de la zona
                          }}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          <Edit className="w-4 h-4 inline mr-2" />
                          Editar Regiones
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Zona de Envío por Defecto
                </h3>
                <button
                  onClick={() => resetSettings('shipping')}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Restaurar valores por defecto
                </button>
              </div>
              
              <select
                value={shippingSettings.defaultShippingZone}
                onChange={(e) => setShippingSettings({ ...shippingSettings, defaultShippingZone: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {shippingSettings.shippingZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} - S/. {zone.price.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      // ... otros casos para las demás pestañas

      default:
        return (
          <div className="text-center py-12">
            <SettingsIcon className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Configuración no disponible
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Esta sección de configuración está en desarrollo
            </p>
          </div>
        );
    }
  };

  return (
    <AdminLayout title="Configuración">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
            Configuración del Sistema
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Configura todas las opciones de tu tienda
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={saveSettings}
            disabled={saving || loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {saving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      {/* Mensajes */}
      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400' :
          message.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400' :
          'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-400'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5 mr-3" />
            ) : message.type === 'error' ? (
              <AlertCircle className="w-5 h-5 mr-3" />
            ) : (
              <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Contenido principal */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Pestañas */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 ${
                    activeTab === tab.id
                      ? 'border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido de la pestaña */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Cargando configuración...</p>
            </div>
          ) : (
            renderSettingsContent()
          )}
        </div>
      </div>

      {/* Notas importantes */}
      <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-yellow-800 dark:text-yellow-400 mb-1">
              Importante
            </h4>
            <p className="text-sm text-yellow-700 dark:text-yellow-500">
              Los cambios en la configuración pueden afectar el funcionamiento de tu tienda. 
              Asegúrate de probar los cambios antes de aplicarlos en producción.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;