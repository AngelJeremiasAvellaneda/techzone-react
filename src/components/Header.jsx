// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import CartDrawer from "./CartDrawer";
import { useCartContext } from "../context/CartContext.jsx";
import useTheme from "../hooks/useTheme.js";
import { Sun, Moon, ShoppingCart, Menu, X } from "lucide-react";

const products = [
  { name: "Laptops", href: "/Laptops" },
  { name: "Desktops", href: "/Desktops" },
  { name: "Accesorios", href: "/Accessories" },
];

const Header = ({ currentPage }) => {
  const {
    cart,
    addToCart,
    totalItems,
    cartOpen,
    setCartOpen
  } = useCartContext();

  const { theme, toggleTheme } = useTheme();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);

  const productBtnRef = useRef(null);
  const submenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Animación badge
  const [prevItems, setPrevItems] = useState(totalItems);
  const [animateBadge, setAnimateBadge] = useState(false);

  useEffect(() => {
    if (totalItems !== prevItems) {
      setAnimateBadge(true);
      const timer = setTimeout(() => setAnimateBadge(false), 300);
      setPrevItems(totalItems);
      return () => clearTimeout(timer);
    }
  }, [totalItems, prevItems]);

  // Click fuera para cerrar submenus
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (productBtnRef.current && !productBtnRef.current.contains(e.target) &&
          submenuRef.current && !submenuRef.current.contains(e.target)) {
        setSubmenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) &&
          !e.target.closest("#hamburger-btn")) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Cerrar menú móvil al navegar
  useEffect(() => {
    setMobileOpen(false);
  }, [currentPage]);

  // Función para agregar item y abrir carrito
  const addItem = (item) => {
    addToCart(item);
    setCartOpen(true);
  };

  useEffect(() => {
    window.addToCart = addItem;
  }, [addItem]);

  return (
    <>
      <header className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-transparent border-b border-white/10 dark:border-white/5 transition-all duration-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 relative z-50">
          {/* Logo */}
          <a 
            href="/" 
            className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent hover:opacity-90 transition-all duration-700"
          >
            TechZone
          </a>

          {/* Botones móviles */}
          <div className="flex items-center space-x-3 md:hidden">
            {/* Carrito móvil */}
            <button 
              onClick={() => setCartOpen(true)} 
              aria-label="Carrito" 
              className="relative p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/20 transition"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-300 ${
                  animateBadge ? "scale-125" : "scale-100"
                }`}>
                  {totalItems}
                </span>
              )}
            </button>

            {/* Hamburger */}
            <button 
              id="hamburger-btn" 
              onClick={() => setMobileOpen(!mobileOpen)} 
              type="button" 
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
              className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/20 transition"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Navegación desktop */}
          <ul className="hidden md:flex space-x-8 font-medium items-center">
            <li>
              <a 
                href="/" 
                className={`nav-link ${currentPage === "/" ? "text-purple-500 font-bold" : ""}`}
              >
                Inicio
              </a>
            </li>
            <li>
              <a 
                href="/About" 
                className={`nav-link ${currentPage === "/about" ? "text-purple-500 font-bold" : ""}`}
              >
                Sobre Nosotros
              </a>
            </li>
            
            {/* Dropdown Productos */}
            <li className="relative">
              <button 
                ref={productBtnRef} 
                onClick={() => setSubmenuOpen(!submenuOpen)} 
                className={`flex items-center gap-1 nav-link ${
                  products.some(p => p.href === currentPage) ? "text-purple-500 font-bold" : ""
                }`}
              >
                Productos
                <svg 
                  className={`w-4 h-4 mt-0.5 transition-transform duration-200 ${
                    submenuOpen ? "rotate-180" : ""
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <ul 
                ref={submenuRef} 
                className={`absolute left-0 mt-3 w-44 rounded-lg shadow-xl transform transition-all duration-300 submenu-bg ${
                  submenuOpen 
                    ? "opacity-100 pointer-events-auto scale-100" 
                    : "opacity-0 pointer-events-none scale-95"
                }`}
              >
                {products.map(item => (
                  <li key={item.href}>
                    <a 
                      href={item.href} 
                      className={`block px-4 py-2 text-sm nav-sub-link rounded-lg ${
                        currentPage === item.href ? "text-purple-500 font-bold bg-purple-50 dark:bg-purple-900/20" : ""
                      }`}
                    >
                      {item.name}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
            
            <li>
              <a 
                href="/News" 
                className={`nav-link ${currentPage === "/news" ? "text-purple-500 font-bold" : ""}`}
              >
                Novedades
              </a>
            </li>
            <li>
              <a 
                href="/Contact" 
                className={`nav-link ${currentPage === "/contact" ? "text-purple-500 font-bold" : ""}`}
              >
                Contacto
              </a>
            </li>
          </ul>

          {/* Botones desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Carrito */}
            <button 
              onClick={() => setCartOpen(true)} 
              className="relative p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/20 transition" 
              aria-label="Carrito"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-300 ${
                  animateBadge ? "scale-125" : "scale-100"
                }`}>
                  {totalItems}
                </span>
              )}
            </button>

            {/* Toggle Tema */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/20 transition"
              aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-indigo-400" />
              )}
            </button>
          </div>
        </nav>

        {/* Menú móvil */}
        <div 
          ref={mobileMenuRef} 
          className={`fixed top-16 right-0 w-full md:w-[300px] h-[calc(100vh-4rem)] bg-[var(--menu-bg)] backdrop-blur-2xl transform transition-all duration-500 ease-in-out z-40 flex flex-col justify-between ${
            mobileOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
          }`}
        >
          <div className="p-6 flex flex-col space-y-4 overflow-y-auto">
            <a 
              href="/" 
              className="nav-link text-lg py-2"
              onClick={() => setMobileOpen(false)}
            >
              Inicio
            </a>
            <a 
              href="/About" 
              className="nav-link text-lg py-2"
              onClick={() => setMobileOpen(false)}
            >
              Sobre Nosotros
            </a>
            
            {/* Dropdown móvil */}
            <div>
              <button 
                onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)} 
                className="flex items-center justify-between w-full nav-link text-lg py-2"
              >
                <span>Productos</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    mobileSubmenuOpen ? "rotate-180" : ""
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div 
                className={`pl-4 space-y-2 mt-2 transition-all duration-300 overflow-hidden ${
                  mobileSubmenuOpen ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                {products.map(item => (
                  <a 
                    key={item.href} 
                    href={item.href} 
                    className="block text-sm nav-link py-2"
                    onClick={() => setMobileOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
            
            <a 
              href="/News" 
              className="nav-link text-lg py-2"
              onClick={() => setMobileOpen(false)}
            >
              Novedades
            </a>
            <a 
              href="/Contact" 
              className="nav-link text-lg py-2"
              onClick={() => setMobileOpen(false)}
            >
              Contacto
            </a>
          </div>

          {/* Footer del menú móvil */}
          <div className="p-6 flex justify-between items-center border-t border-white/10 dark:border-white/5">
            <button 
              onClick={toggleTheme}
              className="flex items-center gap-2 p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/20 transition"
              aria-label={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm">Claro</span>
                </>
              ) : (
                <>
                  <Moon className="w-5 h-5 text-indigo-400" />
                  <span className="text-sm">Oscuro</span>
                </>
              )}
            </button>

            <button 
              onClick={() => {
                setCartOpen(true);
                setMobileOpen(false);
              }} 
              aria-label="Carrito" 
              className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/20 transition relative"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className={`absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center transition-transform duration-300 ${
                  animateBadge ? "scale-125" : "scale-100"
                }`}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer de carrito */}
      <CartDrawer />
    </>
  );
};

export default Header;