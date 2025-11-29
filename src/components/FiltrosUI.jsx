export default function FiltrosUI({
  busqueda, setBusqueda,
  precioMax, setPrecioMax,
  precioMaxReal, // precio máximo real de todos los productos
  subcategoriaSeleccionada, setSubcategoriaSeleccionada,
  marcaSeleccionada, setMarcaSeleccionada,
  specsFilters, setSpecsFilters,
  marcas,
  specsUnicos,
  subcategories = [],
  category = "general",
  cerrarMobile
}) {
  const handleSpecChange = (key, value) => {
    setSpecsFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Buscador */}
      <div>
        <label className="block text-sm mb-1">Buscar</label>
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-2 rounded bg-[var(--bg)]"
          placeholder="Buscar productos..."
        />
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm mb-1">Precio máximo: S/ {precioMax}</label>
        <input
          type="range"
          min={0}
          max={precioMaxReal}
          value={precioMax}
          onChange={(e) => setPrecioMax(Number(e.target.value))}
          className="w-full"
        />
      </div>

      {/* Marca */}
      <div>
        <label className="block text-sm mb-1">Marca</label>
        <select
          value={marcaSeleccionada}
          onChange={(e) => setMarcaSeleccionada(e.target.value)}
          className="w-full p-2 rounded bg-[var(--bg)]"
        >
          <option value="all">Todas</option>
          {marcas.map((m, idx) => (
            <option key={`marca-${idx}`} value={m}>{m}</option>
          ))}
        </select>
      </div>

      {/* Subcategoría */}
      {subcategories.length > 0 && (
        <div>
          <label className="block text-sm mb-1">Subcategoría</label>
          <select
            value={subcategoriaSeleccionada}
            onChange={(e) => setSubcategoriaSeleccionada(Number(e.target.value))}
            className="w-full p-2 rounded bg-[var(--menu-bg)]"
          >
            <option value="all">Todas</option>
            {subcategories.map((s, idx) => (
              <option key={`sub-${s.id || idx}`} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Specs dinámicas */}
      {Object.entries(specsUnicos).map(([key, opciones]) => {
        if (opciones.length === 0) return null;
        return (
          <div key={key}>
            <label className="block text-sm mb-1">
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <select
              value={specsFilters[key] || "all"}
              onChange={(e) => handleSpecChange(key, e.target.value)}
              className="w-full p-2 rounded bg-[var(--menu-bg)]"
            >
              <option value="all">Todas</option>
              {opciones.map((opt, idx) => (
                <option key={`${key}-${opt}-${idx}`} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );
      })}

      {cerrarMobile && (
        <button
          onClick={cerrarMobile}
          className="mt-4 w-full px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition"
        >
          Cerrar filtros
        </button>
      )}
    </div>
  );
}
