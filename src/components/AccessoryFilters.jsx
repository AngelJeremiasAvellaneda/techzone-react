import React from "react";

const AccessoryFilters = ({ categoria, setCategoria, limpiar }) => {
  const { categories, loading } = useCategoryList();

  return (
    <div className="p-4 rounded-lg bg-[var(--card-bg)] shadow">
      <label className="block mb-2 font-semibold text-sm uppercase tracking-wide">
        Filtrar por categoría
      </label>

      {loading ? (
        <p className="text-sm opacity-60">Cargando categorías...</p>
      ) : (
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full mb-4 p-2 rounded bg-[var(--menu-bg)] border border-gray-700"
        >
          <option value="">Todas</option>

          {categories.map((cat) => (
            <option key={cat.name} value={cat.name.toLowerCase()}>
              {cat.name}
            </option>
          ))}
        </select>
      )}

      <button
        onClick={limpiar}
        className="w-full bg-gray-700 text-white py-2 rounded hover:bg-gray-600 transition"
      >
        Limpiar filtros
      </button>
    </div>
  );
};

export default AccessoryFilters;
