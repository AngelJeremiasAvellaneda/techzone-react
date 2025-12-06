import { useState, useEffect } from "react";
// REMOVER: import BaseLayout from "../layouts/BaseLayout";
import { FiTruck, FiShield, FiTrendingUp } from "react-icons/fi";
import { Laptop, Monitor, Headphones, Star } from "lucide-react";

const slides = [
  "/image/oferta1.png",
  "/image/oferta2.png",
  "/image/oferta3.png",
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [mobileSrc, setMobileSrc] = useState(slides[0]);

  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);

  useEffect(() => {
    setMobileSrc(slides[current]);
  }, [current]);

  return (
    // REMOVER: <BaseLayout title="TechZone"> y su cierre
    <>
      {/* Hero Section */}
      <section className="relative w-full h-[calc(100vh-4rem)] flex flex-col md:flex-row items-center justify-center md:justify-start mt-16 pt-16 overflow-hidden">
        {slides.map((slide, index) => (
          <img
            key={index}
            src={slide}
            alt={`Oferta ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="text-white relative z-20 flex flex-col items-center md:items-start max-w-md text-[var(--text)] drop-shadow-lg px-4 md:px-0 md:ml-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">¡Bienvenido a TechZone!</h1>
          <p className="text-lg md:text-xl mb-6">
            Encuentra los mejores productos tecnológicos al mejor precio.
          </p>
          <a
            href="/About"
            className="inline-block px-6 py-3 bg-[var(--accent)] hover:brightness-90 rounded-lg font-semibold transition"
          >
            Nosotros
          </a>
        </div>

        {/* Slide Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 bottom-5 transform -translate-y-1/2 bg-[var(--slick-arrow-bg)] hover:bg-[var(--slick-arrow-hover)] text-[var(--text)] rounded-full w-12 h-12 flex items-center justify-center z-30 transition"
        >
          &#10094;
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 bottom-5 transform -translate-y-1/2 bg-[var(--slick-arrow-bg)] hover:bg-[var(--slick-arrow-hover)] text-[var(--text)] rounded-full w-12 h-12 flex items-center justify-center z-30 transition"
        >
          &#10095;
        </button>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-[var(--page-bg)] flex justify-around flex-wrap gap-8">
        <div className="flex flex-col items-center text-center max-w-xs">
          <FiTruck className="text-5xl text-[var(--accent)] mb-3" />
          <h3 className="font-bold text-xl mb-2 text-[var(--text)]">Envío Rápido</h3>
          <p className="text-[var(--text)]">Recibe tus productos en tiempo récord, sin complicaciones.</p>
        </div>
        <div className="flex flex-col items-center text-center max-w-xs">
          <FiShield className="text-5xl text-[var(--accent)] mb-3" />
          <h3 className="font-bold text-xl mb-2 text-[var(--text)]">Garantía</h3>
          <p className="text-[var(--text)]">Todos nuestros productos cuentan con garantía oficial.</p>
        </div>
        <div className="flex flex-col items-center text-center max-w-xs">
          <FiTrendingUp className="text-5xl text-[var(--accent)] mb-3" />
          <h3 className="font-bold text-xl mb-2 text-[var(--text)]">Mejores Ofertas</h3>
          <p className="text-[var(--text)]">Aprovecha promociones y descuentos exclusivos cada semana.</p>
        </div>
      </section>

      {/* Offers & News Section */}
      <section className="py-16 px-4 md:px-16 bg-[var(--page-bg)]">
        <h2 className="text-3xl font-bold mb-8 text-center text-[var(--text)]">Ofertas y Novedades</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[var(--menu-bg)] shadow-md rounded-lg p-6 hover:shadow-xl transition">
            <FiTrendingUp className="text-4xl text-[var(--accent)] mb-4" />
            <h3 className="font-semibold text-xl mb-2 text-[var(--text)]">Super Oferta Laptop Gamer</h3>
            <p className="text-[var(--text)] mb-4">
              Solo esta semana, adquiere tu Laptop Gamer X con un 20% de descuento. ¡No te lo pierdas!
            </p>
            <a className="inline-block px-4 py-2 bg-[var(--accent)] text-[var(--text)] rounded-lg hover:brightness-90 transition" href="/Laptops">
              Ver Oferta
            </a>
          </div>

          <div className="bg-[var(--menu-bg)] shadow-md rounded-lg p-6 hover:shadow-xl transition">
            <Headphones className="text-4xl text-[var(--accent)] mb-4" />
            <h3 className="font-semibold text-xl mb-2 text-[var(--text)]">Auriculares Noise Canceling</h3>
            <p className="text-[var(--text)] mb-4">
              Descubre la mejor experiencia de sonido con nuestros auriculares premium. ¡Calidad garantizada!
            </p>
            <a className="inline-block px-4 py-2 bg-[var(--accent)] text-[var(--text)] rounded-lg hover:brightness-90 transition" href="/Accessories">
              Ver Más
            </a>
          </div>

          <div className="bg-[var(--menu-bg)] shadow-md rounded-lg p-6 hover:shadow-xl transition">
            <Laptop className="text-4xl text-[var(--accent)] mb-4" />
            <h3 className="font-semibold text-xl mb-2 text-[var(--text)]">Guías y Tips Tech</h3>
            <p className="text-[var(--text)] mb-4">
              Aprende a optimizar tu computadora, elegir componentes y mantener tus gadgets al máximo rendimiento.
            </p>
            <a className="inline-block px-4 py-2 bg-[var(--accent)] text-[var(--text)] rounded-lg hover:brightness-90 transition" href="/News">
              Leer Más
            </a>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-[var(--page-bg)] px-4 md:px-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-[var(--text)]">Categorías</h2>
        <div className="flex justify-around flex-wrap gap-8">
          <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transform transition">
            <Laptop className="text-6xl text-[var(--accent)]" />
            <span className="text-[var(--text)] font-medium">Laptops</span>
          </div>
          <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transform transition">
            <Monitor className="text-6xl text-[var(--accent)]" />
            <span className="text-[var(--text)] font-medium">Desktops</span>
          </div>
          <div className="flex flex-col items-center gap-2 cursor-pointer hover:scale-105 transform transition">
            <Headphones className="text-6xl text-[var(--accent)]" />
            <span className="text-[var(--text)] font-medium">Accesorios</span>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 px-4 md:px-16">
        <h2 className="text-3xl font-bold mb-8 text-center text-[var(--text)]">Opiniones de Clientes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[var(--menu-bg)] shadow-md rounded-lg p-6 text-center hover:shadow-xl transition">
              <Star className="text-yellow-400 text-3xl mb-3 mx-auto" />
              <p className="mb-4 text-[var(--text)]">"Excelente servicio y productos de alta calidad, volveré a comprar seguro!"</p>
              <span className="font-semibold text-[var(--text)]">Cliente {i}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}