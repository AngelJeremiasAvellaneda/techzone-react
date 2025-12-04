// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Context Providers
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

// Layouts
import BaseLayout from "./layouts/BaseLayout";
import AdminLayout from "./layouts/AdminLayout";

// Páginas públicas
import Home from "./pages/index.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import News from "./pages/News.jsx";
import Laptops from "./pages/Laptops.jsx";
import Desktops from "./pages/Desktops.jsx";
import Accessories from "./pages/Accessories.jsx";
import ProductPage from "./pages/products/[id].jsx";
import Cart from "./pages/Cart.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Account from './pages/Account.jsx';
import Checkout from "./pages/Checkout.jsx";
import CheckoutSuccess from "./pages/CheckoutSuccess.jsx";

// Páginas de administración
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminOrders from './pages/admin/Orders.jsx';
import AdminProducts from './pages/admin/Products.jsx';
import AdminCustomers from './pages/admin/Customers.jsx';
import AdminCategories from './pages/admin/Categories.jsx';
import AdminInventory from './pages/admin/Inventory.jsx';
import AdminReports from './pages/admin/Reports.jsx';
import AdminSettings from './pages/admin/Settings.jsx';

// Importamos los componentes de rutas protegidas desde un archivo separado
import ProtectedRoutes from "./components/ProtectedRoutes";

// Componente principal App
function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Rutas públicas - Usan BaseLayout */}
            <Route path="/" element={
              <BaseLayout title="TechZone - Tu Tienda de Tecnología">
                <Home />
              </BaseLayout>
            } />
            
            <Route path="/about" element={
              <BaseLayout title="Sobre Nosotros - TechZone">
                <About />
              </BaseLayout>
            } />
            
            <Route path="/contact" element={
              <BaseLayout title="Contacto - TechZone">
                <Contact />
              </BaseLayout>
            } />
            
            <Route path="/news" element={
              <BaseLayout title="Novedades - TechZone">
                <News />
              </BaseLayout>
            } />
            
            <Route path="/laptops" element={
              <BaseLayout title="Laptops - TechZone">
                <Laptops />
              </BaseLayout>
            } />
            
            <Route path="/desktops" element={
              <BaseLayout title="Desktops - TechZone">
                <Desktops />
              </BaseLayout>
            } />
            
            <Route path="/accessories" element={
              <BaseLayout title="Accesorios - TechZone">
                <Accessories />
              </BaseLayout>
            } />
            
            <Route path="/products/:id" element={
              <BaseLayout title="Producto - TechZone">
                <ProductPage />
              </BaseLayout>
            } />
            
            <Route path="/cart" element={
              <BaseLayout title="Carrito de Compras - TechZone">
                <Cart />
              </BaseLayout>
            } />
            
            {/* Rutas de autenticación */}
            <Route path="/login" element={
              <BaseLayout title="Iniciar Sesión - TechZone">
                <Login />
              </BaseLayout>
            } />
            
            <Route path="/register" element={
              <BaseLayout title="Crear Cuenta - TechZone">
                <Register />
              </BaseLayout>
            } />
            
            {/* Todas las rutas protegidas están en ProtectedRoutes */}
            <Route path="/*" element={<ProtectedRoutes />} />
            
            {/* Ruta 404 - Not Found */}
            <Route path="*" element={
              <BaseLayout title="Página no encontrada - TechZone">
                <div className="min-h-screen flex items-center justify-center pt-24">
                  <div className="text-center px-4">
                    <h1 className="text-6xl md:text-9xl font-bold text-purple-600 dark:text-purple-400 mb-6">404</h1>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                      Página no encontrada
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                      La página que estás buscando no existe o ha sido movida.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <a 
                        href="/" 
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                      >
                        Volver al inicio
                      </a>
                      <a 
                        href="/contact" 
                        className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
                      >
                        Contactar soporte
                      </a>
                    </div>
                  </div>
                </div>
              </BaseLayout>
            } />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;