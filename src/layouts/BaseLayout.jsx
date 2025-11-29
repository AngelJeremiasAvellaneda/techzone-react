// src/layouts/BaseLayout.jsx
import React, { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import "../index.css";

const BaseLayout = ({ children, title = "TechZone" }) => {
  useEffect(() => {
    // Establecer título de la página
    document.title = title;

    // Animación de iconos al cargar
    const icons = document.querySelectorAll(".icon-spin");
    icons.forEach(icon => {
      icon.classList.add("animate-on-load");
      const timer = setTimeout(() => {
        icon.classList.remove("animate-on-load");
      }, 1000);
      return () => clearTimeout(timer);
    });

    // Scroll suave al inicio
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [title]);

  return (
    <div className="bg-[var(--page-bg)] text-[var(--text)] transition-colors duration-300 min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main className="flex-grow relative z-10">{children}</main>
      <Footer />
    </div>
  );
};

export default BaseLayout;