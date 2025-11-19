import React, { useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import CartDrawer from "../components/CartDrawer";
import "../index.css";

const BaseLayout = ({ children, title = "TechZone" }) => {
  useEffect(() => {
    // Configuración del tema
    if (localStorage.getItem("theme") === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Animación de iconos
    document.querySelectorAll(".icon-spin").forEach(icon => {
      icon.classList.add("animate-on-load");
      setTimeout(() => icon.classList.remove("animate-on-load"), 1000);
    });
  }, []);

  return (
    <div className="bg-[var(--page-bg)] text-[var(--text)] transition-colors duration-300 min-h-screen flex flex-col">
      <Header />
      <CartDrawer cartItems={[]} />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
};

export default BaseLayout;
