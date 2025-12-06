  import React, { useState, useEffect } from 'react';
  import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
  import { useAuth } from '../context/AuthContext';
  import {
    Home, Package, Users, BarChart3, Settings, 
    LogOut, Menu, X, Bell, Search, Shield,
    ShoppingCart, Tag, Activity, Calendar, 
    FileText, Truck, CreditCard, Star,
    ChevronDown, User, Settings as SettingsIcon
  } from 'lucide-react';

  const AdminLayout = ({ children, title = "Panel de Administración" }) => {
    const { user, profile, signOut } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);

    useEffect(() => {
      document.title = `${title} - TechZone Admin`;
    }, [title]);

    // 🔴 ROUTE JAIL: Si no es admin, sacarlo de aquí
    useEffect(() => {
      if (user && profile && !(profile.role === 'admin' || profile.role === 'staff')) {
        navigate('/');
      }
    }, [user, profile, navigate]);
    // 🔴 VERIFICACIÓN PERSISTENTE DE RUTA
  useEffect(() => {
    if (user && profile && (profile.role === 'admin' || profile.role === 'staff')) {
      // Si está en admin pero no es ruta admin -> redirigir a /admin
      if (!location.pathname.startsWith('/admin')) {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, profile, location.pathname, navigate]);
    const navigation = [
      { 
        name: 'Dashboard', 
        href: '/admin', 
        icon: Home,
        current: location.pathname === '/admin'
      },
      { 
        name: 'Pedidos', 
        href: '/admin/orders', 
        icon: Package,
        current: location.pathname === '/admin/orders'
      },
      { 
        name: 'Productos', 
        href: '/admin/products', 
        icon: ShoppingCart,
        current: location.pathname === '/admin/products'
      },
      { 
        name: 'Clientes', 
        href: '/admin/customers', 
        icon: Users,
        current: location.pathname === '/admin/customers'
      },
      { 
        name: 'Categorías', 
        href: '/admin/categories', 
        icon: Tag,
        current: location.pathname === '/admin/categories'
      },
      { 
        name: 'Inventario', 
        href: '/admin/inventory', 
        icon: Activity,
        current: location.pathname === '/admin/inventory'
      },
      { 
        name: 'Reportes', 
        href: '/admin/reports', 
        icon: BarChart3,
        current: location.pathname === '/admin/reports'
      },
      { 
        name: 'Configuración', 
        href: '/admin/settings', 
        icon: SettingsIcon,
        current: location.pathname === '/admin/settings'
      },
    ];

    const getInitials = (name) => {
      if (!name) return 'A';
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const handleSignOut = async () => {
      await signOut();
      navigate('/'); // Después de logout, va al mundo público
    };

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
        {/* Sidebar Mobile */}
        <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex max-w-xs w-full">
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">TechZone Admin</span>
                  </div>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          item.current
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <Icon className="mr-4 flex-shrink-0 w-6 h-6" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center w-full">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.full_name || 'Administrador'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                        {profile?.role === 'admin' ? 'Administrador' : 'Staff'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="ml-2 p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Layout Principal */}
        <div className="flex h-screen">
          {/* Sidebar Desktop */}
          <div className="hidden lg:flex lg:flex-col lg:w-64">
            <div className="flex flex-col flex-1 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
              <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                <div className="flex items-center flex-shrink-0 px-4">
                  <div className="flex items-center gap-2">
                    <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    <span className="text-xl font-bold text-gray-900 dark:text-white">TechZone Admin</span>
                  </div>
                </div>
                <nav className="mt-8 flex-1 px-4 space-y-2">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                          item.current
                            ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <Icon className="mr-3 flex-shrink-0 w-5 h-5" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center w-full">
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{profile?.full_name || 'Administrador'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                        {profile?.role === 'admin' ? 'Administrador' : 'Staff'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="ml-2 p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenido Principal */}
          <div className="flex flex-col flex-1 w-0">
            {/* Header */}
            <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <button
                type="button"
                className="px-4 border-r border-gray-200 dark:border-gray-700 text-gray-500 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Abrir sidebar</span>
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex-1 flex justify-between p-2 lg:px-8">
                <div className="flex-1 flex">
                  <div className="w-full max-w-lg lg:max-w-xs">
                    <label htmlFor="search" className="sr-only">
                      Buscar
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="search"
                        name="search"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Buscar..."
                        type="search"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button className="p-2 text-gray-400 hover:text-gray-500 relative">
                    <Bell className="w-6 h-6" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">
                        {getInitials(profile?.full_name)}
                      </div>
                      <div className="hidden lg:block text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profile?.full_name?.split(' ')[0] || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {profile?.role === 'admin' ? 'Administrador' : 'Staff'}
                        </p>
                      </div>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                        <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {user?.email}
                        </div>
                        <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                        <button
                          onClick={handleSignOut}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Cerrar Sesión
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Contenido de la página */}
            <main className="flex-1 relative overflow-y-auto focus:outline-none">
              <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {children || <Outlet />}
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  };

  export default AdminLayout;