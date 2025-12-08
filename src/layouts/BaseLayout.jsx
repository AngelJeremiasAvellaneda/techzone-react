import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import useRouteJail from '../hooks/useRouteJail';

const BaseLayout = ({ title = "TechZone" }) => {
  const { user, isAdminOrStaff, loading } = useAuth();
  const navigate = useNavigate();

  useRouteJail();

  useEffect(() => {
    document.title = title;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [title]);

  // 🔐 ROUTE JAIL PERSISTENTE para admin/staff
  useEffect(() => {
    if (!loading && user && isAdminOrStaff()) {
      console.log("🔒 Admin/Staff detectado en ruta pública, redirigiendo a /admin");
      navigate("/admin", { replace: true });
    }
  }, [user, loading, isAdminOrStaff, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--page-bg)] text-[var(--text)] min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow ">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default BaseLayout;