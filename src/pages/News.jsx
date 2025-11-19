import { useState } from "react";
import BaseLayout from "../layouts/BaseLayout";

const newsData = [
  {
    id: 1,
    titulo: "Nueva línea de laptops gaming 2025",
    descripcion: "Descubre la nueva generación de laptops con procesadores Intel y AMD de última generación, ideales para gamers exigentes.",
    imagen: "/image/news/nov1.png",
  },
  {
    id: 2,
    titulo: "Innovaciones en monitores curvos",
    descripcion: "Los nuevos monitores ofrecen mejor tasa de refresco, tecnología OLED y un diseño ergonómico pensado para largas sesiones de trabajo.",
    imagen: "/image/news/nov2.png",
  },
  {
    id: 3,
    titulo: "Ofertas exclusivas de accesorios",
    descripcion: "Encuentra teclados mecánicos, ratones y auriculares con descuentos por tiempo limitado en nuestra tienda TechZone.",
    imagen: "/image/news/nov3.png",
  },
];

export default function News() {
  const [liked, setLiked] = useState({});

  const toggleLike = (id) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <BaseLayout title="Novedades | TechZone">
      <section className="min-h-screen pt-28 pb-16">
        <div className="max-w-7xl mx-auto text-center mb-16 px-6">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">📰 Últimas Novedades</h1>
          <p className="text-gray-400 text-lg">
            Mantente al día con lo más reciente en tecnología, gaming y hardware.
          </p>
        </div>

        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-12 px-6">
          {newsData.map(({ id, titulo, descripcion, imagen }) => (
            <article
              key={id}
              className="relative group rounded-2xl overflow-hidden shadow-lg hover:shadow-[0_0_25px_#00B2FF50] transition duration-500 flex flex-col"
            >
              <div className="overflow-hidden">
                <img
                  src={imagen}
                  alt={titulo}
                  className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-semibold mb-3 group-hover:text-[var(--accent)] transition">
                    {titulo}
                  </h2>
                  <p className="text-gray-400 text-sm mb-6 leading-relaxed">{descripcion}</p>
                </div>
                <button
                  className="like-btn flex items-center justify-center gap-2 bg-[var(--accent)] hover:bg-[#9445ae] text-white px-5 py-2.5 rounded-full font-medium transition-all duration-300 self-center"
                  onClick={() => toggleLike(id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill={liked[id] ? "#FF3B3B" : "none"}
                    stroke={liked[id] ? "#FF3B3B" : "white"}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5 heart-icon transition-all duration-300"
                  >
                    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                  </svg>
                  Me interesa
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </BaseLayout>
  );
}
