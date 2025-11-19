import { useState } from "react";
import BaseLayout from "../layouts/BaseLayout";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("message", formData.message);

      await fetch("/api/sendEmail", {
        method: "POST",
        body: data,
      });

      setSuccess(true);
      setFormData({ name: "", email: "", message: "" });

      setTimeout(() => setSuccess(false), 4000);
    } catch (error) {
      console.error("Error al enviar:", error);
    }
  };

  return (
    <BaseLayout title="Contacto | TechZone">
      <section className="min-h-screen flex flex-col md:flex-row items-center justify-center text-[var(--text)] px-6 md:px-16 py-20 relative overflow-hidden">
        {/* Contenedor principal */}
        <div className="w-full md:w-1/2 z-10">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-500 via-purple-400 to-purple-500 bg-clip-text text-transparent animate-pulse">
            Contáctanos
          </h1>
          <p className="mb-10 text-lg leading-relaxed">
            ¿Tienes alguna pregunta, sugerencia o colaboración? Completa el formulario y te responderemos lo antes posible. 🚀
          </p>

          {/* Formulario */}
          <form
            id="contact-form"
            onSubmit={handleSubmit}
            className="space-y-5 p-8 rounded-2xl shadow-xl backdrop-blur-md border border-white/10"
          >
            <div>
              <label htmlFor="name" className="block text-sm font-semibold mb-2">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-300"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2">
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-300 transition-all duration-300"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-semibold mb-2">
                Mensaje
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full p-3 rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all duration-300"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-300 to-purple-400 hover:from-purple-300 hover:to-purple-400 transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-purple-500/30"
            >
              Enviar mensaje ✉️
            </button>

            {/* Mensaje de éxito */}
            {success && (
              <div className="mt-5 text-center text-green-800 bg-green-100 border border-green-400 rounded-lg p-3 font-semibold shadow-md transition-all duration-500">
                💚 ¡Mensaje enviado correctamente!
              </div>
            )}
          </form>
        </div>

        {/* Mapa */}
        <div className="w-full md:w-1/2 mt-16 md:mt-0 md:pl-10 relative z-10">
          <div className="rounded-2xl overflow-hidden shadow-lg border border-white/10 transform hover:scale-[1.02] transition-all duration-500">
            <iframe
              className="w-full h-[400px] md:h-[500px] grayscale hover:grayscale-0 transition-all duration-700"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.802115737494!2d-75.211!3d-12.066!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x910e964e2fbd3c5b%3A0x8e2cfd8a5c345b1e!2sHuancayo!5e0!3m2!1ses!2spe!4v1715989200000!5m2!1ses!2spe"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </section>
    </BaseLayout>
  );
}
