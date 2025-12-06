import React from "react";
import { Routes, Route } from "react-router-dom";

import { CartProvider } from "../context/CartContext";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Layouts
import BaseLayout from "../layouts/BaseLayout";
import AdminLayout from "../layouts/AdminLayout";

// Components
import ProtectedRoutes from "../components/ProtectedRoutes";
import GuestOnlyRoutes from "../components/GuestOnlyRoutes";

// Pages
import Home from "../pages/index";
import About from "../pages/About";
import Contact from "../pages/Contact";
import News from "../pages/News";
import Laptops from "../pages/Laptops";
import Desktops from "../pages/Desktops";
import Accessories from "../pages/Accessories";
import ProductPage from "../pages/products/[id]";
import Cart from "../pages/Cart";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Account from "../pages/Account";
import Checkout from "../pages/Checkout";
import CheckoutSuccess from "../pages/CheckoutSuccess";

// Admin Pages
import Dashboard from "../pages/admin/Dashboard";
import Orders from "../pages/admin/Orders";
import Products from "../pages/admin/Products";
import Customers from "../pages/admin/Customers";
import Categories from "../pages/admin/Categories";
import Inventory from "../pages/admin/Inventory";
import Reports from "../pages/admin/Reports";
import Settings from "../pages/admin/Settings";

// Simple Loader
const LoadingScreen = () => {
  console.log("🌀 Mostrando loader...");
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Cargando TechStore...</p>
      </div>
    </div>
  );
};

// App Content Component
function AppContent() {
  const { loading, user, profile } = useAuth();
  
  console.log("📱 AppContent - Estado:", { 
    loading, 
    user: user?.email, 
    role: profile?.role 
  });

  if (loading) {
    return <LoadingScreen />;
  }

  console.log("🚀 Renderizando rutas...");

  return (
    <Routes>
      {/* RUTAS PÚBLICAS */}
      <Route path="/" element={<BaseLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="news" element={<News />} />
        <Route path="laptops" element={<Laptops />} />
        <Route path="desktops" element={<Desktops />} />
        <Route path="accessories" element={<Accessories />} />
        <Route path="products/:id" element={<ProductPage />} />
        <Route path="cart" element={<Cart />} />
      </Route>

      {/* RUTAS SOLO PARA INVITADOS */}
      <Route element={<GuestOnlyRoutes />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* RUTAS PARA CLIENTES AUTENTICADOS */}
      <Route element={<ProtectedRoutes requiredRole="customer" />}>
        <Route element={<BaseLayout />}>
          <Route path="checkout" element={<Checkout />} />
          <Route path="checkout-success" element={<CheckoutSuccess />} />
          <Route path="account/*" element={<Account />} />
        </Route>
      </Route>

      {/* RUTAS ADMIN */}
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

      {/* 404 SIMPLE */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
            <p className="text-gray-600">Página no encontrada</p>
            <a href="/" className="mt-4 inline-block text-blue-600 hover:underline">
              Volver al inicio
            </a>
          </div>
        </div>
      } />
    </Routes>
  );
}

// Main App
function App() {
  console.log("🎬 App: Iniciando aplicación");
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;