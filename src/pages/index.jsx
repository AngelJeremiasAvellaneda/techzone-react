import { useState, useEffect } from "react";
import BaseLayout from "../layouts/BaseLayout";

const slides = [
  "/image/oferta1.png",
  "/image/oferta2.png",
  "/image/oferta3.png",
];

export default function Home() {
  const [current, setCurrent] = useState(0);

  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);

  // Auto fade effect for mobile
  const [mobileSrc, setMobileSrc] = useState(slides[0]);
  useEffect(() => {
    setMobileSrc(slides[current]);
  }, [current]);

  return (
    <BaseLayout title="TechZone">
      {/* Desktop Hero */}
      <section className="hidden md:flex relative w-full h-[calc(100vh-4rem)] mt-16 pt-16">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/90 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/90 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.6),transparent_70%)]"></div>

        {slides.map((slide, index) => (
          <img
            key={index}
            src={slide}
            alt={`Oferta ${index + 1}`}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 z-0 ${
              index === current ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        <div className="relative z-20 flex flex-col justify-center max-w-md text-white drop-shadow-lg px-4 md:px-0 md:ml-20 h-full">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">¡Bienvenido a TechZone!</h1>
          <p className="text-lg md:text-xl mb-6">
            Encuentra los mejores productos tecnológicos al mejor precio.
          </p>
          <a
            href="/About"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
          >
            Nosotros
          </a>
        </div>

        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-black/40 via-transparent to-transparent hover:from-black/60 text-white rounded-full w-12 h-12 flex items-center justify-center z-30 transition"
        >
          &#10094;
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-12 top-1/2 transform -translate-y-1/2 bg-gradient-to-l from-black/40 via-transparent to-transparent hover:from-black/60 text-white rounded-full w-12 h-12 flex items-center justify-center z-30 transition"
        >
          &#10095;
        </button>
      </section>

      {/* Mobile Hero */}
      <section className="md:hidden relative w-full h-[calc(100vh-4rem)] flex flex-col justify-center items-center pt-16 mt-16">
        <div className="text-center px-4 mb-4 z-20 relative">
          <h1 className="text-3xl font-bold mb-2 text-[var(--accent)]">¡Bienvenido a TechZone!</h1>
          <p className="text-lg mb-2 text-[var(--text)]">
            Encuentra los mejores productos tecnológicos al mejor precio.
          </p>
          <a
            href="/About"
            className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
          >
            Nosotros
          </a>
        </div>

        <div className="relative w-full max-w-md z-0">
          <img
            src={mobileSrc}
            alt="Oferta"
            className="w-full h-64 sm:h-80 object-cover rounded-lg transition-opacity duration-500"
          />
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center z-10 transition"
          >
            &#10094;
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-10 h-10 flex items-center justify-center z-10 transition"
          >
            &#10095;
          </button>
        </div>
      </section>
    </BaseLayout>
  );
}
