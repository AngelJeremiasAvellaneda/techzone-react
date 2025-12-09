// src/App.js - CORREGIDO
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "../context/CartContext";
import { AuthProvider, useAuth } from "../context/AuthContext";

// Layouts
import BaseLayout from "../layouts/BaseLayout";
import AdminLayout from "../layouts/AdminLayout";

// Components
import ProtectedRoutes from "../components/ProtectedRoutes";
import GuestOnlyRoutes from "../components/GuestOnlyRoutes";
import AdminRedirector from "../components/AdminRedirector";
import NotFoundRedirect from "../components/NotFoundRedirect";

// Pages
import Home from "../pages/index";
import About from "../pages/About";
import Contact from "../pages/Contact";
import Laptops from "../pages/Laptops";
import Desktops from "../pages/Desktops";
import Accessories from "../pages/Accessories";
import ProductDetail from "../pages/products/[id]"; // Cambia el nombre si es necesario
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

// Página de búsqueda y tienda
import SearchResults from "../pages/SearchResults";
import { Toaster } from 'react-hot-toast';

// Simple Loader
const LoadingScreen = () => {
  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando TechZone...</p>
        </div>
      </div>
    </>
  );
};

function AppContent() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <>
      <Toaster position="top-right" />
      <AdminRedirector />
      <Routes>
        {/* RUTAS PÚBLICAS CON BaseLayout */}
        <Route element={<BaseLayout />}>
          {/* Rutas principales */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/carrito" element={<Cart />} />
          
          {/* Rutas de Tienda */}
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

        {/* USUARIO AUTENTICADO */}
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
    </> 
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;