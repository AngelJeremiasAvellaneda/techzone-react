// src/components/ProtectedRoutes.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Layouts
import BaseLayout from "../layouts/BaseLayout";
import AdminLayout from "../layouts/AdminLayout";

// Páginas
import Account from '../pages/Account.jsx';
import Checkout from "../pages/Checkout.jsx";
import CheckoutSuccess from "../pages/CheckoutSuccess.jsx";

// Páginas de administración
import AdminDashboard from '../pages/admin/Dashboard.jsx';
import AdminOrders from '../pages/admin/Orders.jsx';
import AdminProducts from '../pages/admin/Products.jsx';
import AdminCustomers from '../pages/admin/Customers.jsx';
import AdminCategories from '../pages/admin/Categories.jsx';
import AdminInventory from '../pages/admin/Inventory.jsx';
import AdminReports from '../pages/admin/Reports.jsx';
import AdminSettings from '../pages/admin/Settings.jsx';

// Componente de protección de rutas para administración
const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  const isAdminOrStaff = profile?.role === 'admin' || profile?.role === 'staff';
  if (!isAdminOrStaff) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Componente de protección de rutas para usuarios autenticados
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  
  return children;
};

// Componente de protección para rutas públicas cuando ya está autenticado
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  // Si ya está autenticado, redirigir de login/register
  if (user && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const ProtectedRoutes = () => {
  const location = useLocation();
  
  // Verificar si estamos en rutas de login/register y aplicar PublicRoute
  if (location.pathname === '/login' || location.pathname === '/register') {
    return (
      <Routes>
        <Route path="/login" element={
          <PublicRoute>
            <BaseLayout title="Iniciar Sesión - TechZone">
              <Login />
            </BaseLayout>
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <BaseLayout title="Crear Cuenta - TechZone">
              <Register />
            </BaseLayout>
          </PublicRoute>
        } />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Rutas protegidas (usuarios autenticados) */}
      <Route path="/checkout" element={
        <ProtectedRoute>
          <BaseLayout title="Finalizar Compra - TechZone">
            <Checkout />
          </BaseLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/checkout/success" element={
        <ProtectedRoute>
          <BaseLayout title="¡Pedido Confirmado! - TechZone">
            <CheckoutSuccess />
          </BaseLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/account" element={
        <ProtectedRoute>
          <BaseLayout title="Mi Cuenta - TechZone">
            <Account />
          </BaseLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/account/:tab" element={
        <ProtectedRoute>
          <BaseLayout title="Mi Cuenta - TechZone">
            <Account />
          </BaseLayout>
        </ProtectedRoute>
      } />
      
      {/* Rutas de administración - Usan AdminLayout */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminLayout title="Dashboard">
            <AdminDashboard />
          </AdminLayout>
        </AdminRoute>
      } />
      
      <Route path="/admin/orders" element={
        <AdminRoute>
          <AdminLayout title="Pedidos">
            <AdminOrders />
          </AdminLayout>
        </AdminRoute>
      } />
      
      <Route path="/admin/products" element={
        <AdminRoute>
          <AdminLayout title="Productos">
            <AdminProducts />
          </AdminLayout>
        </AdminRoute>
      } />
      
      <Route path="/admin/customers" element={
        <AdminRoute>
          <AdminLayout title="Clientes">
            <AdminCustomers />
          </AdminLayout>
        </AdminRoute>
      } />
      
      <Route path="/admin/categories" element={
        <AdminRoute>
          <AdminLayout title="Categorías">
            <AdminCategories />
          </AdminLayout>
        </AdminRoute>
      } />
      
      <Route path="/admin/inventory" element={
        <AdminRoute>
          <AdminLayout title="Inventario">
            <AdminInventory />
          </AdminLayout>
        </AdminRoute>
      } />
      
      <Route path="/admin/reports" element={
        <AdminRoute>
          <AdminLayout title="Reportes">
            <AdminReports />
          </AdminLayout>
        </AdminRoute>
      } />
      
      <Route path="/admin/settings" element={
        <AdminRoute>
          <AdminLayout title="Configuración">
            <AdminSettings />
          </AdminLayout>
        </AdminRoute>
      } />
    </Routes>
  );
};

export default ProtectedRoutes;