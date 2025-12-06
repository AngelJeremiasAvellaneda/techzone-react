import { useState, useMemo } from "react";
import { FaFilter, FaBroom } from "react-icons/fa";
import { useFilters } from "../components/useFilters";
import FiltrosUI from "../components/FiltrosUI";
import { useCartContext } from "../context/CartContext";

export default function ProductsLayout({ title, products, subcategories = [], category }) {
  const stableSubcategories = useMemo(() => subcategories || [], [subcategories?.length]);
  const {
    productosFiltrados,
    filtrosSeleccionados,
    limpiarFiltros,
    totalFiltrados,
    marcas,
    specsUnicos,
    precios
  } = useFilters(products, stableSubcategories, category);

  const { addToCart } = useCartContext();

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [cantidades, setCantidades] = useState({});

  const incrementar = (id) => setCantidades(prev => ({ ...prev, [id]: (prev[id] || 1) + 1 }));
  const decrementar = (id) => setCantidades(prev => ({ ...prev, [id]: Math.max(1, (prev[id] || 1) - 1) }));
  const toggleMobileFilters = () => setMobileFiltersOpen(!mobileFiltersOpen);

  return (
    <>
      {/* Encabezado */}
      <section className="mt-16 px-6 border-b border-gray-500 pb-4">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">{title}</h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto text-[var(--text)]">
            <span className="text-sm">
              {totalFiltrados} {totalFiltrados === 1 ? 'Producto encontrado' : 'Productos encontrados'}
            </span>
            <select
              onChange={(e) => filtrosSeleccionados.setOrden(e.target.value)}
              className="p-2 rounded bg-[var(--menu-bg)] text-sm w-full sm:w-auto border border-gray-600 focus:outline-none focus:border-indigo-500"
            >
              <option value="asc">Precio: Menor a Mayor</option>
              <option value="desc">Precio: Mayor a Menor</option>
            </select>
          </div>
        </div>
      </section>

      {/* Main */}
      <main className="px-6 relative lg:flex lg:gap-8 mt-4">
        {/* Sidebar escritorio */}
        <aside className="lg:w-1/4 p-6 rounded-md bg-[var(--menu-bg)] shadow-lg overflow-auto hidden lg:block sticky top-20 self-start">
          <h2 className="text-xl font-semibold mb-4 text-[var(--text)]">Filtros</h2>
          <button
            onClick={limpiarFiltros}
            className="mb-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
          >
            <FaBroom />
            Limpiar filtros
          </button>

          <FiltrosUI
            {...filtrosSeleccionados}
            precioMax={precios.precioMax}
            setPrecioMax={precios.setPrecioMax}
            precioMaxReal={precios.precioMaxReal} // <- máximo dinámico
            subcategories={stableSubcategories}
            category={category}
            marcas={marcas}
            specsUnicos={specsUnicos}
          />
        </aside>

        <div className="hidden lg:block w-px bg-gray-600"></div>

        {/* Botón mobile */}
        <button
          onClick={toggleMobileFilters}
          className="fixed bottom-4 right-4 z-50 bg-indigo-600 hover:bg-indigo-700 p-4 rounded-full text-white shadow-lg lg:hidden"
          aria-label="Abrir filtros"
        >
          <FaFilter />
        </button>

        {/* Modal mobile */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end lg:hidden">
            <div className="bg-[var(--menu-bg)] w-3/4 max-w-xs p-6 overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[var(--text)]">Filtros</h2>
                <button onClick={toggleMobileFilters} className="text-gray-300 hover:text-white text-2xl">✕</button>
              </div>
              <button
                onClick={() => { limpiarFiltros(); setMobileFiltersOpen(false); }}
                className="mb-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition text-sm font-medium"
              >
                <FaBroom />
                Limpiar filtros
              </button>

              <FiltrosUI
                {...filtrosSeleccionados}
                precioMax={precios.precioMax}
                setPrecioMax={precios.setPrecioMax}
                precioMaxReal={precios.precioMaxReal} // <- máximo dinámico
                subcategories={stableSubcategories}
                category={category}
                marcas={marcas}
                specsUnicos={specsUnicos}
                cerrarMobile={() => setMobileFiltersOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Lista de productos */}
        <section className="w-full lg:w-3/4 flex flex-col gap-4">
          {productosFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[var(--text)] text-lg">No se encontraron productos con los filtros seleccionados.</p>
            </div>
          ) : (
            productosFiltrados.map((p) => {
              const cantidadActual = cantidades[p.id] ?? 1;

              return (
                <div key={p.id} className="producto flex flex-col sm:flex-row items-center border-b border-gray-600 p-4 hover:bg-[var(--menu-bg)] transition rounded-lg">
                  <a href={`/products/${p.id}`} className="w-full sm:w-48 flex-shrink-0">
                    <img src={p.image} alt={p.name} className="w-full h-32 object-cover rounded" />
                  </a>
                  <div className="flex-1 sm:ml-4 flex flex-col justify-between w-full mt-2 sm:mt-0">
                    <div>
                      <h3 className="text-[var(--accent)] font-semibold text-lg">{p.name}</h3>
                      {p.description && <p className="text-[var(--text)] text-sm mt-1 line-clamp-2">{p.description}</p>}
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                      <span className="text-[var(--accent)] font-bold text-xl">S/. {Number(p.price).toLocaleString("es-PE")}</span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <button onClick={() => decrementar(p.id)} className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition">-</button>
                          <span className="px-3 font-medium text-[var(--text)]">{cantidadActual}</span>
                          <button onClick={() => incrementar(p.id)} className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition">+</button>
                        </div>
                        <button
                          onClick={() => addToCart({
                            id: p.id,
                            name: p.name,
                            price: p.price,
                            image: p.image,
                            quantity: cantidadActual,
                          })}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition font-medium"
                        >
                          Agregar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>
    </>
  );
}
