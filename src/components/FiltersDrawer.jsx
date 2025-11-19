import React from "react";

const FiltersDrawer = ({
  isOpen,
  setIsOpen,
  filtros,
  aplicarFiltro,
  limpiarFiltros,
  maxPrecioInicial,
  precioMax,
  setPrecioMax
}) => {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={() => setIsOpen(false)}
      ></div>

      {/* Drawer */}
      <div className={`fixed top-0 left-0 w-80 h-full bg-[var(--menu-bg)] shadow-lg transform transition-transform duration-300 z-50 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-500">
          <h2 className="font-bold text-lg">Filtros</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-700 dark:text-gray-200 font-semibold">X</button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Tipo */}
          <div>
            <label>Tipo</label>
            <select
              value={filtros.tipo}
              onChange={e => aplicarFiltro("tipo", e.target.value)}
              className="w-full mb-3 p-2 rounded bg-[var(--menu-bg)]"
            >
              <option value="">Todos</option>
              <option value="Mouse">Mouse</option>
              <option value="Teclado">Teclado</option>
              <option value="Micrófono">Micrófono</option>
              <option value="Auriculares">Auriculares</option>
              <option value="Mousepad">Mousepad</option>
            </select>
          </div>

          {/* Subcategoría */}
          <div>
            <label>Subcategoría</label>
            <select
              value={filtros.subcategoria}
              onChange={e => aplicarFiltro("subcategoria", e.target.value)}
              className="w-full mb-3 p-2 rounded bg-[var(--menu-bg)]"
            >
              <option value="">Todos</option>
              <option value="Gaming">Gaming</option>
              <option value="Mecánico">Mecánico</option>
              <option value="USB">USB</option>
              <option value="RGB">RGB</option>
            </select>
          </div>

          {/* Marca */}
          <div>
            <label>Marca</label>
            <select
              value={filtros.marca}
              onChange={e => aplicarFiltro("marca", e.target.value)}
              className="w-full mb-3 p-2 rounded bg-[var(--menu-bg)]"
            >
              <option value="">Todas</option>
              <option value="Logitech">Logitech</option>
              <option value="Corsair">Corsair</option>
              <option value="Blue">Blue</option>
              <option value="Razer">Razer</option>
              <option value="HyperX">HyperX</option>
            </select>
          </div>

          {/* Precio */}
          <div>
            <label>Precio máximo (S/.)</label>
            <input
              type="range"
              min="0"
              max={maxPrecioInicial}
              value={precioMax}
              onChange={e => {
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
          </div>

          <button
            onClick={limpiarFiltros}
            className="w-full bg-gray-600 hover:brightness-110 text-white py-2 rounded"
          >
            Limpiar filtros
          </button>
        </div>
      </div>
    </>
  );
};

export default FiltersDrawer;
