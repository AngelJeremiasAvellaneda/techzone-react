import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoutes = ({ requiredRole = null }) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  console.log("🛡️ ProtectedRoutes:", { 
    loading, 
    user: !!user, 
    role: profile?.role,
    requiredRole,
    path: location.pathname 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    console.log("🔒 No autenticado, redirigiendo a login");
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRole) {
    const userRole = profile?.role || "customer";
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!roles.includes(userRole)) {
      console.log("🚫 Rol insuficiente:", userRole, "necesita:", roles);
      return <Navigate to="/" replace />;
    }
  }

  console.log("✅ Acceso permitido");
  return <Outlet />;
};

export default ProtectedRoutes;