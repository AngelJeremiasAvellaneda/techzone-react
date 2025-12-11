// src/App.jsx - CORREGIDO Y MEJORADO
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { CartProvider } from "../context/CartContext";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Layouts
const BaseLayout = lazy(() => import("../layouts/BaseLayout"));
const AdminLayout = lazy(() => import("../layouts/AdminLayout"));

// Components
const ProtectedRoutes = lazy(() => import("../components/ProtectedRoutes"));
const GuestOnlyRoutes = lazy(() => import("../components/GuestOnlyRoutes"));
const NotFoundRedirect = lazy(() => import("../components/NotFoundRedirect"));

// Pages
const Home = lazy(() => import("../pages/index"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const Laptops = lazy(() => import("../pages/Laptops"));
const Desktops = lazy(() => import("../pages/Desktops"));
const Accessories = lazy(() => import("../pages/Accessories"));
const ProductDetail = lazy(() => import("../pages/products/[id]"));
const Cart = lazy(() => import("../pages/Cart"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const Account = lazy(() => import("../pages/Account"));
const Checkout = lazy(() => import("../pages/Checkout"));
const CheckoutSuccess = lazy(() => import("../pages/CheckoutSuccess"));

// Admin Pages
const Dashboard = lazy(() => import("../pages/admin/Dashboard"));
const Orders = lazy(() => import("../pages/admin/Orders"));
const Products = lazy(() => import("../pages/admin/Products"));
const Customers = lazy(() => import("../pages/admin/Customers"));
const Categories = lazy(() => import("../pages/admin/Categories"));
const Inventory = lazy(() => import("../pages/admin/Inventory"));
const Reports = lazy(() => import("../pages/admin/Reports"));
const Settings = lazy(() => import("../pages/admin/Settings"));

const SearchResults = lazy(() => import("../pages/SearchResults"));
import { Toaster } from "react-hot-toast";

// --- LoadingScreen moderno con tus colores ---
const LoadingScreen = () => (
  <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: "var(--page-bg)" }}>
    <div className="relative">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full animate-pulse" style={{ background: "var(--low-tone)" }}></div>
        <div className="absolute inset-4 rounded-full flex items-center justify-center" style={{ background: "var(--page-bg)" }}>
          <div className="w-8 h-8 rounded-lg transform rotate-45" style={{ background: "var(--accent)" }}></div>
        </div>
        <div className="absolute -inset-1 rounded-full blur-lg opacity-30 animate-pulse" style={{ background: "var(--accent)" }}></div>
      </div>

      <div className="relative">
        <div className="w-48 h-1.5 rounded-full overflow-hidden mb-2" style={{ background: "var(--nav-muted)" }}>
          <div className="h-full rounded-full animate-shimmer" style={{ background: "linear-gradient(to right, var(--accent), var(--low-tone), var(--accent))", backgroundSize: "200% 100%" }}></div>
        </div>
        <div className="flex items-center justify-center space-x-2 mt-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full animate-bounce"
              style={{ background: "var(--accent)", animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-2xl font-bold bg-clip-text text-transparent mb-2" style={{ background: "linear-gradient(to right, var(--accent), var(--low-tone))" }}>
          TechZone
        </h2>
        <p className="text-sm font-medium tracking-wider animate-pulse" style={{ color: "var(--nav-muted)" }}>
          Cargando la mejor experiencia tecnológica...
        </p>
      </div>

      <div className="mt-6 flex items-center space-x-2">
        <div className="w-20 h-1 rounded-full overflow-hidden" style={{ background: "var(--nav-muted)" }}>
          <div className="h-full rounded-full animate-loadingBar" style={{ background: "var(--accent)" }}></div>
        </div>
        <span className="text-xs font-mono" style={{ color: "var(--nav-muted)" }}>%</span>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full animate-float"
            style={{
              background: "var(--accent)",
              left: `${20 + i * 15}%`,
              top: `${30 + i * 8}%`,
              animationDelay: `${i * 0.5}s`,
              opacity: 0.3,
            }}
          ></div>
        ))}
      </div>
    </div>
  </div>
);

// --- GlobalStyles usando CSS variables ---
const GlobalStyles = () => {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes shimmer {0%{background-position:-200% 0;}100%{background-position:200% 0;}}
      @keyframes loadingBar {0%{width:0%;}50%{width:60%;}100%{width:100%;}}
      @keyframes float {0%,100%{transform:translateY(0) translateX(0);opacity:0.3;}50%{transform:translateY(-20px) translateX(10px);opacity:0.7;}}
      .animate-shimmer {animation: shimmer 2s infinite linear;}
      .animate-loadingBar {animation: loadingBar 1.5s ease-in-out infinite;}
      .animate-float {animation: float 3s ease-in-out infinite;}
      .animate-bounce {animation: bounce 1s infinite alternate;}
      @keyframes bounce {0%{transform:translateY(0);}100%{transform:translateY(-8px);}}
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

// --- Limpieza de pedidos pendientes ---
const RouteProtectionWrapper = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cleanupPendingOrders = () => {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("pending_order_")) localStorage.removeItem(key);
        });
      };
      cleanupPendingOrders();

      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") cleanupPendingOrders();
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);
      return () =>
        document.removeEventListener("visibilitychange", handleVisibilityChange);
    }
  }, []);
  return null;
};

// --- Contenido principal de la app ---
function AppContent() {
  const { loading } = useAuth();
  if (loading) return <LoadingScreen />;

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { background: "#1f2937", color: "#f3f4f6", border: "1px solid #374151" },
          success: { iconTheme: { primary: "#3b82f6", secondary: "#ffffff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#ffffff" } },
        }}
      />
      <GlobalStyles />
      <RouteProtectionWrapper />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* PÚBLICAS */}
          <Route element={<BaseLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/tienda" element={<Home />} />
            <Route path="/tienda/laptops" element={<Laptops />} />
            <Route path="/tienda/desktops" element={<Desktops />} />
            <Route path="/tienda/accessories" element={<Accessories />} />
            <Route path="/tienda/producto/:id" element={<ProductDetail />} />
            <Route path="/tienda/producto/:id-:slug" element={<ProductDetail />} />
            <Route path="/tienda/buscar" element={<SearchResults />} />
            <Route path="/tienda/buscar/:mainCategory" element={<SearchResults />} />
            <Route path="/tienda/buscar/:mainCategory/:subCategory" element={<SearchResults />} />
            <Route path="/tienda/categoria/:category" element={<SearchResults />} />
            <Route path="/tienda/categoria/:category/:subcategory" element={<SearchResults />} />
          </Route>

          {/* AUTENTICACIÓN */}
          <Route element={<GuestOnlyRoutes />}>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
          </Route>

          {/* USUARIO */}
          <Route element={<ProtectedRoutes requiredRole="customer" />}>
            <Route element={<BaseLayout />}>
              <Route path="/mi-cuenta" element={<Account />} />
              <Route path="/mi-cuenta/:tab" element={<Account />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/checkout-success" element={<CheckoutSuccess />} />
            </Route>
          </Route>

          {/* ADMIN */}
          <Route element={<ProtectedRoutes requiredRole={["admin", "staff"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products" element={<Products />} />
              <Route path="customers" element={<Customers />} />
              <Route path="categories" element={<Categories />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="reports" element={<Reports />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Route>

          {/* REDIRECCIONES LEGACY */}
          <Route path="/cart" element={<Navigate to="/carrito" replace />} />
          <Route path="/laptops" element={<Navigate to="/tienda/laptops" replace />} />
          <Route path="/desktops" element={<Navigate to="/tienda/desktops" replace />} />
          <Route path="/accessories" element={<Navigate to="/tienda/accessories" replace />} />
          <Route path="/products/:id" element={<Navigate to="/tienda/producto/:id" replace />} />
          <Route path="/login" element={<Navigate to="/auth/login" replace />} />
          <Route path="/register" element={<Navigate to="/auth/register" replace />} />
          <Route path="/account/*" element={<Navigate to="/mi-cuenta" replace />} />
          <Route path="/checkout-success" element={<Navigate to="/checkout/checkout-success" replace />} />

          {/* 404 */}
          <Route path="*" element={<NotFoundRedirect />} />
        </Routes>
      </Suspense>
    </>
  );
}

// --- Componente App principal ---
function App() {
  if (typeof window === "undefined") return <LoadingScreen />;

  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
