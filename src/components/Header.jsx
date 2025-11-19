// src/components/Header.jsx
import React, { useState, useEffect, useRef } from "react";
import CartDrawer from "./CartDrawer";
import { useCart } from "../hooks/useCart";

const products = [
  { name: "Laptops", href: "/Laptops" },
  { name: "Desktops", href: "/Desktops" },
  { name: "Accesorios", href: "/Accesories" },
];

const Header = ({ currentPage }) => {
  const { cart = [], addToCart, totalItems = 0, totalPrice = 0, updateQuantity, removeItem, emptyCart } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(false);
  const [darkTheme, setDarkTheme] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  const productBtnRef = useRef(null);
  const submenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Cargar tema desde localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkTheme(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Cerrar submenus al hacer click fuera
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

  // Agregar item desde cualquier parte
  const addItem = (newItem) => {
    addToCart(newItem);
    setCartOpen(true);
  };

  // Exponer globalmente
  useEffect(() => {
    window.addToCart = addItem;
  }, []);

  const hamburgerLines = `block w-6 h-0.5 bg-current transition-all duration-300`;

  return (
    <>
      <header className="fixed top-0 w-full z-50 backdrop-blur-2xl bg-transparent border-b border-white/10 dark:border-white/5 transition-all duration-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16 relative z-50">
          {/* Logo */}
          <a href="/" className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent hover:opacity-90 transition-all duration-700">TechZone</a>

          {/* Botones móviles */}
          <div className="flex items-center space-x-3 md:hidden">
            {/* Carrito móvil */}
            <button onClick={() => setCartOpen(true)} aria-label="Carrito" className="relative p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/20 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 5H18m-11 0a1 1 0 102 0m8 0a1 1 0 102 0" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{totalItems}</span>
              )}
            </button>

            {/* Hamburger */}
            <button id="hamburger-btn" onClick={() => setMobileOpen(!mobileOpen)} type="button" aria-label="Abrir menú" className="flex flex-col justify-center items-center gap-1 w-10 h-10 rounded-lg">
              <span className={`${hamburgerLines} ${mobileOpen ? "rotate-45 translate-y-2" : ""}`}></span>
              <span className={`${hamburgerLines} ${mobileOpen ? "opacity-0" : ""}`}></span>
              <span className={`${hamburgerLines} ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`}></span>
            </button>
          </div>

          {/* Navegación desktop */}
          <ul className="hidden md:flex space-x-8 font-medium items-center">
            <li><a href="/" className={`nav-link ${currentPage === "/" ? "text-purple-500 font-bold" : ""}`}>Inicio</a></li>
            <li><a href="/About" className={`nav-link ${currentPage === "/about" ? "text-purple-500 font-bold" : ""}`}>Sobre Nosotros</a></li>
            <li className="relative">
              <button ref={productBtnRef} onClick={() => setSubmenuOpen(!submenuOpen)} className={`flex items-center gap-1 nav-link ${products.some(p => p.href === currentPage) ? "text-purple-500 font-bold" : ""}`}>
                Productos
                <svg className={`w-4 h-4 mt-0.5 transition-transform duration-200 ${submenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul ref={submenuRef} className={`absolute left-0 mt-3 w-44 rounded-lg shadow-xl transform scale-95 transition-all duration-300 submenu-bg ${submenuOpen ? "opacity-100 pointer-events-auto scale-100" : "opacity-0 pointer-events-none"}`}>
                {products.map(item => (
                  <li key={item.href}><a href={item.href} className={`block px-4 py-2 text-sm nav-sub-link ${currentPage === item.href ? "text-purple-500 font-bold" : ""}`}>{item.name}</a></li>
                ))}
              </ul>
            </li>
            <li><a href="/News" className={`nav-link ${currentPage === "/news" ? "text-purple-500 font-bold" : ""}`}>Novedades</a></li>
            <li><a href="/Contact" className={`nav-link ${currentPage === "/contact" ? "text-purple-500 font-bold" : ""}`}>Contacto</a></li>
          </ul>

          {/* Botones desktop */}
          <div className="hidden md:flex items-center space-x-3">
            <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 nav-link p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/20 transition transform-gpu" aria-label="Carrito">
              <svg className="w-5 h-5 icon-spin transition-transform duration-700 ease-in-out" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 5H18m-11 0a1 1 0 102 0m8 0a1 1 0 102 0"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{totalItems}</span>
              )}
            </button>

            <button onClick={() => {
              const newTheme = !darkTheme;
              setDarkTheme(newTheme);
              document.documentElement.classList.toggle("dark", newTheme);
              localStorage.setItem("theme", newTheme ? "dark" : "light");
            }} className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/20 transition transform-gpu">
              {darkTheme ? (
                <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m8.66-9H21M3 12H2m15.36-6.36l.7.7M6.34 17.66l-.7.7m12.02 0l-.7-.7M6.34 6.34l-.7-.7M12 5a7 7 0 110 14 7 7 0 010-14z"/>
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Menú móvil */}
        <div ref={mobileMenuRef} className={`fixed top-16 right-0 w-full md:w-[300px] h-[calc(100vh-4rem)] bg-[var(--menu-bg)] backdrop-blur-2xl transform transition-all duration-500 ease-in-out z-40 flex flex-col justify-between ${mobileOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
          <div className="p-6 flex flex-col space-y-4">
            <a href="/" className="nav-link text-lg">Inicio</a>
            <a href="/About" className="nav-link text-lg">Sobre Nosotros</a>
            <button onClick={() => setMobileSubmenuOpen(!mobileSubmenuOpen)} className="flex items-center gap-1 nav-link text-lg">
              Productos
              <svg className={`w-4 h-4 mt-0.5 transition-transform duration-200 ${mobileSubmenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`pl-4 space-y-2 ${mobileSubmenuOpen ? "block" : "hidden"}`}>
              {products.map(item => (
                <a key={item.href} href={item.href} className="block text-sm nav-link">{item.name}</a>
              ))}
            </div>
            <a href="/News" className="nav-link text-lg">Novedades</a>
            <a href="/Contact" className="nav-link text-lg">Contacto</a>
          </div>

          <div className="p-6 flex justify-between items-center border-t border-white/10 dark:border-white/5">
            <button className="flex items-center gap-2 p-2 rounded-full nav-link hover:bg-white/10 dark:hover:bg-white/20 transition transform-gpu">
              <svg className="w-6 h-6 icon-spin transition-transform duration-700 ease-in-out" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A9 9 0 1118.88 17.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
              <span className="text-nav-text dark:text-nav-text">Cuenta</span>
            </button>

            <button onClick={() => setCartOpen(true)} aria-label="Carrito" className="p-2 rounded-full hover:bg-white/10 dark:hover:bg-white/20 transition relative">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.3 5H18m-11 0a1 1 0 102 0m8 0a1 1 0 102 0"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{totalItems}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Drawer de carrito */}
      <CartDrawer
        cart={cart}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        emptyCart={emptyCart}
        totalItems={totalItems}
        totalPrice={totalPrice}
        isOpen={cartOpen}
        setIsOpen={setCartOpen}
      />
    </>
  );
};

export default Header;
