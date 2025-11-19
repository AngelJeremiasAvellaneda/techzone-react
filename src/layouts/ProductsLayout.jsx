import React, { useState } from "react";
import BaseLayout from "./BaseLayout";
import { useFilters } from "../components/useFilters";
import { FaFilter } from "react-icons/fa";

const ProductsLayout = ({ title, products }) => {
  const { filtros, productosFiltrados, aplicarFiltro, limpiarFiltros, ordenarProductos } = useFilters(products);

  const [precioMax, setPrecioMax] = useState(15000);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Estado para cantidades de productos
  const [cantidades, setCantidades] = useState({}); // { idProducto: cantidad }

  const incrementar = (id) => {
    setCantidades((prev) => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  };

  const decrementar = (id) => {
    setCantidades((prev) => ({ ...prev, [id]: Math.max(1, prev[id] || 1) }));
  };

  const toggleMobileFilters = () => setMobileFiltersOpen(!mobileFiltersOpen);

  // Componente para filtros (para reusar en escritorio y móvil)
  const Filtros = () => (
    <>
      <label>Procesador</label>
      <select
        onChange={(e) => aplicarFiltro("procesador", e.target.value)}
        className="w-full mb-3 p-2 rounded bg-[var(--menu-bg)]"
      >
        <option value="">Todos</option>
        <option value="Intel">Intel</option>
        <option value="Ryzen">Ryzen</option>
      </select>

      <label>RAM</label>
      <select
        onChange={(e) => aplicarFiltro("ram", e.target.value)}
        className="w-full mb-3 p-2 rounded bg-[var(--menu-bg)]"
      >
        <option value="">Cualquier RAM</option>
        <option value="8">8 GB</option>
        <option value="16">16 GB</option>
        <option value="32">32 GB</option>
      </select>

      <label>Almacenamiento</label>
      <select
        onChange={(e) => aplicarFiltro("almacenamiento", e.target.value)}
        className="w-full mb-3 p-2 rounded bg-[var(--menu-bg)]"
      >
        <option value="">Cualquier almacenamiento</option>
        <option value="256">256 GB</option>
        <option value="512">512 GB</option>
        <option value="1000">1 TB</option>
      </select>

      <label>Pantalla</label>
      <select
        onChange={(e) => aplicarFiltro("pantalla", e.target.value)}
        className="w-full mb-3 p-2 rounded bg-[var(--menu-bg)]"
      >
        <option value="">Cualquier tamaño</option>
        <option value="15.6">15.6"</option>
        <option value="17">17"</option>
      </select>

      <label>Precio máximo (S/.)</label>
      <input
        type="range"
        min="0"
        max="15000"
        value={precioMax}
        onChange={(e) => {
          const val = Number(e.target.value);
          setPrecioMax(val);
          aplicarFiltro("maxPrecio", val);
        }}
        className="w-full mb-2"
      />
      <div className="flex justify-between text-sm mb-4">
        <span>0</span>
        <span>{precioMax}</span>
      </div>

      <button
        onClick={() => {
          limpiarFiltros();
          setPrecioMax(15000);
          setMobileFiltersOpen(false); // también cierra filtros móviles
        }}
        className="w-full bg-gray-600 hover:brightness-110 text-white py-2 rounded"
      >
        Limpiar filtros
      </button>
    </>
  );

  return (
    <BaseLayout title={title}>
      {/* Encabezado */}
      <section className="mt-16 px-6 border-b border-gray-500 pb-4">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">{title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto text-[var(--text)]">
            <span className="text-sm">{productosFiltrados.length} Productos encontrados</span>
            <select
              onChange={(e) => ordenarProductos(e.target.value)}
              className="p-2 rounded bg-[var(--menu-bg)] text-sm w-full sm:w-auto"
            >
              <option value="asc">Precio: Menor a Mayor</option>
              <option value="desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>
      </section>

      <main className="px-6 relative lg:flex lg:gap-8 mt-4">
        {/* Sidebar escritorio */}
        <aside className="lg:w-1/4 p-6 rounded-md bg-[var(--menu-bg)] shadow-lg overflow-auto hidden lg:block">
          <h2 className="text-xl font-semibold mb-4">Filtros</h2>
          <Filtros />
        </aside>

        {/* Separador escritorio */}
        <div className="hidden lg:block w-px bg-gray-600"></div>

        {/* Botón flotante filtros móviles */}
        <button
          onClick={toggleMobileFilters}
          className="fixed bottom-4 right-4 z-50 bg-indigo-600 hover:bg-indigo-700 p-4 rounded-full text-white shadow-lg lg:hidden"
        >
          <FaFilter />
        </button>

        {/* Modal filtros móviles */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end lg:hidden">
            <div className="bg-[var(--menu-bg)] w-3/4 max-w-xs p-6 overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Filtros</h2>
                <button onClick={toggleMobileFilters} className="text-gray-300 hover:text-white">
                  ✕
                </button>
              </div>
              <Filtros />
            </div>
          </div>
        )}

        {/* Lista de productos */}
        <section className="w-full lg:w-3/4 flex flex-col gap-4">
          {productosFiltrados.map((p) => (
            <div
              key={p.id}
              className="producto flex flex-col sm:flex-row items-center border-b border-gray-600 p-4 hover:bg-[var(--menu-bg)] transition"
            >
              <a href={`/products/${p.id}`} className="w-full sm:w-48 flex-shrink-0">
                <img src={p.imagen} alt={p.nombre} className="w-full h-32 object-cover rounded" />
              </a>
              <div className="flex-1 sm:ml-4 flex flex-col justify-between w-full mt-2 sm:mt-0">
                <div>
                  <h3 className="text-[var(--accent)] font-semibold text-lg">{p.nombre}</h3>
                  <ul className="text-[var(--text)] text-sm mt-2 space-y-1">
                    {p.procesador && <li><strong>Procesador:</strong> {p.procesador}</li>}
                    {p.ram && <li><strong>RAM:</strong> {p.ram} GB</li>}
                    {p.almacenamiento && <li><strong>Almacenamiento:</strong> {p.almacenamiento} GB</li>}
                    {p.pantalla && <li><strong>Pantalla:</strong> {p.pantalla}"</li>}
                  </ul>
                </div>

                <div className="mt-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                  <span className="text-[var(--accent)] font-bold text-lg">S/. {p.precio}</span>

                  <div className="flex items-center gap-2">
                    <button onClick={() => decrementar(p.id)} className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">-</button>
                    <span className="px-2">{cantidades[p.id] || 1}</span>
                    <button onClick={() => incrementar(p.id)} className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">+</button>
                  </div>

                  <button
                    onClick={() => window.addToCart({
                      id: p.id,
                      nombre: p.nombre,
                      precio: p.precio,
                      cantidad: cantidades[p.id] || 1,
                      imagen: p.imagen
                    })}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
                  >
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </BaseLayout>
  );
};

export default ProductsLayout;
