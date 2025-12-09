// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import CartDrawer from "./CartDrawer";
import { useCartContext } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext";
import useTheme from "../hooks/useTheme.js";
import { 
  Sun, Moon, ShoppingCart, Menu, X, 
  User, LogIn, UserPlus, Settings, 
  Heart, Package, MapPin, Shield,
  LogOut, ChevronDown, Home, Info,
  Bell, Gift, ArrowRight, Search
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/routes";

// Navegación principal con URLs profesionales
const mainNav = [
  { 
    path: ROUTES.HOME, 
    label: "Inicio", 
    icon: Home, 
    exact: true 
  },
  { 
    path: ROUTES.SHOP, 
    label: "Tienda", 
    icon: Gift,
    submenu: [
      { 
        path: ROUTES.SHOP, 
        label: "Ver Todo", 
        description: "Todos nuestros productos" 
      },
      { 
        path: ROUTES.CATEGORY_LAPTOPS, 
        label: "Laptops", 
        description: "Portátiles de última generación" 
      },
      { 
        path: ROUTES.CATEGORY_DESKTOPS, 
        label: "Computadoras", 
        description: "PCs de escritorio potentes" 
      },
      { 
        path: ROUTES.CATEGORY_ACCESSORIES, 
        label: "Accesorios", 
        description: "Periféricos y más" 
      },
    ]
  },
  { 
    path: ROUTES.ABOUT, 
    label: "Nosotros", 
    icon: Info 
  },
  { 
    path: ROUTES.NEWS, 
    label: "Noticias", 
    icon: Bell 
  },
  { 
    path: ROUTES.CONTACT, 
    label: "Contacto", 
    icon: null 
  },
];

const Header = () => {
  const { totalItems, cartOpen, setCartOpen } = useCartContext();
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileUserMenuOpen, setMobileUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const productBtnRef = useRef(null);
  const submenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const userMenuRef = useRef(null);
  const userBtnRef = useRef(null);

  const [prevItems, setPrevItems] = useState(totalItems);
  const [animateBadge, setAnimateBadge] = useState(false);

  // Animación del badge del carrito
  useEffect(() => {
    if (totalItems !== prevItems) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      setPrevItems(totalItems);
      return () => clearTimeout(timer);
    }
  }, [totalItems, prevItems]);

  // Cierre de menús al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (productBtnRef.current && !productBtnRef.current.contains(e.target) &&
          submenuRef.current && !submenuRef.current.contains(e.target)) {
        setSubmenuOpen(false);
      }
      if (userBtnRef.current && !userBtnRef.current.contains(e.target) &&
          userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) &&
          !e.target.closest("#hamburger-btn")) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Cerrar menú móvil al cambiar de página
  useEffect(() => {
    setMobileOpen(false);
    setMobileSubmenuOpen(false);
    setMobileUserMenuOpen(false);
    setShowSearch(false);
  }, [location.pathname]);

  // Función helper para iniciales
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  // Verificar si el usuario es admin o staff
  const isAdminOrStaff = () => {
    return profile?.role === 'admin' || profile?.role === 'staff';
  };

  // Verificar si la ruta actual está activa
  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Función para búsqueda profesional
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(ROUTES.buildSearchUrl({ 
        q: searchQuery.trim(),
        sort: 'relevance'
      }));
      setSearchQuery("");
      setShowSearch(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    setMobileUserMenuOpen(false);
    navigate(ROUTES.HOME);
  };

  // Estilos CSS para las variables personalizadas
  const cssVariables = {
    '--low-tone': theme === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    '--menu-bg': theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    '--nav-muted': theme === 'dark' ? '#9CA3AF' : '#6B7280',
    '--accent': '#8B5CF6',
  };

  return (
    <>
      <header 
        className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-[var(--page-bg)] border-b border-gray-200 dark:border-gray-800 transition-all duration-300"
        style={cssVariables}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 relative z-50">

          {/* LOGO */}
          <Link to={ROUTES.HOME} className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent hover:scale-105 transform transition-transform duration-300">
            TechZone
          </Link>

          {/* BÚSQUEDA PARA DESKTOP */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos, marcas, categorías..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  autoComplete="off"
                />
                <button 
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-700"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Mobile - Botones básicos */}
          <div className="flex items-center space-x-3 md:hidden">
            {/* Botón de búsqueda móvil */}
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
            >
              <Search className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            </button>

            {user ? (
              <button 
                onClick={() => setMobileUserMenuOpen(prev => !prev)} 
                className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition group"
                aria-label="Cuenta"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={profile.full_name || 'Usuario'} className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-500/50" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold">
                    {getInitials(profile?.full_name)}
                  </div>
                )}
              </button>
            ) : (
              <Link to={ROUTES.LOGIN} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                <User className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              </Link>
            )}

            <Link to={ROUTES.CART} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <ShoppingCart className="w-6 h-6 text-gray-700 dark:text-gray-300" />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ${animateBadge ? "scale-125" : "scale-100"} transition-transform`}>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            <button id="hamburger-btn" onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {mobileOpen ? <X className="w-6 h-6 text-gray-700 dark:text-gray-300" /> : <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />}
            </button>
          </div>

          {/* Desktop nav - PROFESIONAL */}
          <ul className="hidden md:flex space-x-6 font-medium items-center">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActiveItem = isActive(item.path, item.exact);
              
              return (
                <li key={item.path} className="relative">
                  {item.submenu ? (
                    <div className="relative group">
                      <button 
                        ref={productBtnRef}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActiveItem ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                        onClick={() => setSubmenuOpen(!submenuOpen)}
                      >
                        {Icon && <Icon className="w-4 h-4" />}
                        <span>{item.label}</span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${submenuOpen ? "rotate-180" : ""}`} />
                      </button>
                      <div 
                        ref={submenuRef}
                        className={`absolute left-0 mt-2 w-48 rounded-lg shadow-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transform transition-all duration-300 z-50 ${submenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                      >
                        {item.submenu.map((subItem) => (
                          <Link
                            key={subItem.path}
                            to={subItem.path}
                            className="block px-4 py-3 text-sm hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                            onClick={() => setSubmenuOpen(false)}
                          >
                            <div className="font-medium">{subItem.label}</div>
                            {subItem.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subItem.description}</p>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${isActiveItem ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300" : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>

          {/* Desktop user, cart, theme - PROFESIONAL */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                {/* Menú de usuario */}
                <div className="relative">
                  <button 
                    ref={userBtnRef} 
                    onClick={() => setUserMenuOpen(!userMenuOpen)} 
                    className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-8 h-8 rounded-full object-cover ring-2 ring-purple-500/50" alt={profile.full_name || 'Usuario'} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">
                        {getInitials(profile?.full_name)}
                      </div>
                    )}
                    <span className="text-sm font-medium max-w-[100px] truncate text-gray-700 dark:text-gray-300">
                      {(profile?.full_name || "Usuario").split(" ")[0]}
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? "rotate-180" : ""} text-gray-500`} />
                  </button>

                  {/* Menu Usuario */}
                  <div 
                    ref={userMenuRef} 
                    className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 transform transition-all duration-300 overflow-hidden z-50 ${userMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
                  >
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-fuchsia-50 dark:from-purple-900/20 dark:to-fuchsia-900/20">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile?.full_name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                      {isAdminOrStaff() && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">
                            {profile?.role === 'admin' ? 'Administrador' : 'Staff'}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="py-2">
                      <Link 
                        to={ROUTES.ACCOUNT} 
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Settings className="w-5 h-5 text-purple-500" /> Mi Cuenta
                      </Link>
                      <Link 
                        to="/mi-cuenta/orders" 
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Package className="w-5 h-5 text-blue-500" /> Mis Pedidos
                      </Link>
                      <Link 
                        to="/mi-cuenta/lista-deseos" 
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Heart className="w-5 h-5 text-red-500" /> Lista de Deseos
                      </Link>
                      <Link 
                        to="/mi-cuenta/direcciones" 
                        className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <MapPin className="w-5 h-5 text-green-500" /> Direcciones
                      </Link>
                      {/* Panel de administración SOLO en menú desplegable para admin/staff */}
                      {isAdminOrStaff() && (
                        <Link 
                          to={ROUTES.ADMIN}
                          className="flex items-center gap-3 px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition border-t border-gray-200 dark:border-gray-700 mt-2 pt-2"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Shield className="w-5 h-5 text-fuchsia-500" /> 
                          <span>Panel de Administración</span>
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                      <button 
                        onClick={handleSignOut} 
                        className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition"
                      >
                        <LogOut className="w-5 h-5" /> Cerrar Sesión
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to={ROUTES.LOGIN} className="flex items-center gap-2 px-4 py-2 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  <LogIn className="w-5 h-5" /> Iniciar Sesión
                </Link>
                <Link to={ROUTES.REGISTER} className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white hover:opacity-90 transition">
                  <UserPlus className="w-5 h-5" /> Registrarse
                </Link>
              </div>
            )}

            <Link to={ROUTES.CART} className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ${animateBadge ? "scale-125" : "scale-100"} transition-transform`}>
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>

            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {theme === "dark" ? <Sun className="w-5 h-5 text-yellow-400" /> : <Moon className="w-5 h-5 text-indigo-400" />}
            </button>
          </div>
        </nav>

        {/* BÚSQUEDA MÓVIL */}
        {showSearch && (
          <div className="md:hidden p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos, marcas, categorías..."
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-700"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>
        )}

        {/* MOBILE MENU - PROFESIONAL */}
        <div 
          ref={mobileMenuRef} 
          className={`fixed top-16 right-0 w-full h-[calc(100vh-4rem)] bg-white dark:bg-gray-900 backdrop-blur-lg z-40 transition-transform duration-300 md:hidden ${mobileOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}
        >
          <div className="p-6 flex flex-col space-y-4 overflow-y-auto h-full">

            {/* Usuario móvil */}
            {user && (
              <div className="mb-4">
                <button 
                  className="flex items-center justify-between w-full p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  onClick={() => setMobileUserMenuOpen(prev => !prev)}
                >
                  <div className="flex items-center gap-3">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/50" alt={profile.full_name || 'Usuario'} />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white font-bold flex items-center justify-center">
                        {getInitials(profile?.full_name)}
                      </div>
                    )}
                    <div className="text-left">
                      <span className="block font-medium text-gray-900 dark:text-white">
                        {profile?.full_name || "Usuario"}
                      </span>
                      {isAdminOrStaff() && (
                        <span className="text-xs px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full">
                          {profile?.role === 'admin' ? 'Admin' : 'Staff'}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${mobileUserMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {mobileUserMenuOpen && (
                  <div className="ml-4 mt-2 flex flex-col space-y-2">
                    <Link 
                      to={ROUTES.ACCOUNT} 
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Settings className="w-5 h-5 text-purple-500" /> Mi Cuenta
                    </Link>
                    <Link 
                      to="/mi-cuenta/pedidos" 
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Package className="w-5 h-5 text-blue-500" /> Mis Pedidos
                    </Link>
                    <Link 
                      to="/mi-cuenta/lista-deseos" 
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                      onClick={() => setMobileOpen(false)}
                    >
                      <Heart className="w-5 h-5 text-red-500" /> Lista de Deseos
                    </Link>
                    <Link 
                      to="/mi-cuenta/direcciones" 
                      className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                      onClick={() => setMobileOpen(false)}
                    >
                      <MapPin className="w-5 h-5 text-green-500" /> Direcciones
                    </Link>
                    
                    {/* Panel de administración para móvil */}
                    {isAdminOrStaff() && (
                      <Link 
                        to={ROUTES.ADMIN}
                        className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                        onClick={() => setMobileOpen(false)}
                      >
                        <Shield className="w-5 h-5 text-fuchsia-500" /> 
                        <span>Panel de Administración</span>
                      </Link>
                    )}
                    
                    <button 
                      onClick={handleSignOut} 
                      className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <LogOut className="w-5 h-5" /> Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Enlaces principales - PROFESIONALES */}
            {mainNav.map((item) => {
              const Icon = item.icon;
              
              return (
                <div key={item.path}>
                  {item.submenu ? (
                    <div className="flex flex-col">
                      <button 
                        className="flex items-center justify-between w-full px-4 py-3 text-lg font-medium text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                        onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)}
                      >
                        <span className="flex items-center">
                          {Icon && <Icon className="w-5 h-5 mr-2" />}
                          <span>{item.label}</span>
                        </span>
                        <ChevronDown className={`w-5 h-5 transition-transform ${mobileSubmenuOpen ? "rotate-180" : ""}`} />
                      </button>

                      {mobileSubmenuOpen && (
                        <div className="ml-6 mt-2 flex flex-col space-y-2">
                          {item.submenu.map((subItem) => (
                            <Link 
                              key={subItem.path} 
                              to={subItem.path} 
                              className="px-4 py-2 text-gray-700 dark:text-gray-300 rounded hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                              onClick={() => {
                                setMobileOpen(false);
                                setMobileSubmenuOpen(false);
                              }}
                            >
                              <div className="font-medium">{subItem.label}</div>
                              {subItem.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subItem.description}</p>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link 
                      to={item.path}
                      className="flex items-center px-4 py-3 text-lg font-medium text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      onClick={() => setMobileOpen(false)}
                    >
                      {Icon && <Icon className="w-5 h-5 mr-2" />}
                      <span>{item.label}</span>
                    </Link>
                  )}
                </div>
              );
            })}

            {/* Si no está logueado, mostrar opciones de login */}
            {!user && (
              <>
                <Link 
                  to={ROUTES.LOGIN} 
                  className="px-4 py-3 text-lg font-medium text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition flex items-center"
                  onClick={() => setMobileOpen(false)}
                >
                  <LogIn className="w-5 h-5 mr-2" /> 
                  <span>Iniciar Sesión</span>
                </Link>
                <Link 
                  to={ROUTES.REGISTER} 
                  className="px-4 py-3 text-lg font-medium text-white rounded-lg bg-gradient-to-r from-purple-500 to-fuchsia-500 hover:opacity-90 transition flex items-center justify-center"
                  onClick={() => setMobileOpen(false)}
                >
                  <UserPlus className="w-5 h-5 mr-2" /> 
                  <span>Registrarse</span>
                </Link>
              </>
            )}

            {/* Tema */}
            <div className="flex justify-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <button 
                onClick={toggleTheme} 
                className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              >
                {theme === "dark" ? (
                  <Sun className="w-6 h-6 text-yellow-400" />
                ) : (
                  <Moon className="w-6 h-6 text-indigo-400" />
                )}
              </button>
            </div>

          </div>
        </div>
      </header>

      <CartDrawer open={cartOpen} setOpen={setCartOpen} />
    </>
  );
};

export default Header;