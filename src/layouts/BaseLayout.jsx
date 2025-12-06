// src/layouts/BaseLayout.jsx (OPCIONAL - si necesitas espacio para Header fijo)
import React, { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import { Outlet } from "react-router-dom";

const BaseLayout = ({ title = "TechZone" }) => {
  useEffect(() => {
    document.title = title;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [title]);

  return (
    <div className="bg-[var(--page-bg)] text-[var(--text)] min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow pt-16">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default BaseLayout;