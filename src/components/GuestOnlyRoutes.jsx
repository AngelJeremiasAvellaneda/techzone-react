import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GuestOnlyRoutes = () => {
  const { user, profile, loading } = useAuth();

  console.log("👤 GuestOnlyRoutes:", { 
    loading, 
    user: !!user, 
    role: profile?.role 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  if (user) {
    const userRole = profile?.role || "customer";
    console.log("🔄 Ya autenticado, redirigiendo según rol:", userRole);
    
    if (userRole === "admin" || userRole === "staff") {
      return <Navigate to="/admin" replace />;
    }
    
    return <Navigate to="/" replace />;
  }

  console.log("✅ Invitado permitido");
  return <Outlet />;
};

export default GuestOnlyRoutes;