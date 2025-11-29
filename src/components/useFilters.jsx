import { useState, useMemo } from "react";

export function useFilters(products, subcategories = [], category = "general") {
  const defaultState = "all";

  // ------------------------
  // CALCULAR PRECIO MÁXIMO REAL
  // ------------------------
  const precioMaxReal = useMemo(() => {
    if (!products || products.length === 0) return 15000;
    return Math.max(...products.map(p => p.price || 0));
  }, [products]);

  const [precioMax, setPrecioMax] = useState(precioMaxReal);
  const [subcategoriaSeleccionada, setSubcategoriaSeleccionada] = useState(defaultState);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState(defaultState);
  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("asc");

  // ------------------------
  // FILTROS DINÁMICOS (Specs)
  // ------------------------
  const specsKeys = useMemo(() => {
    const keys = new Set();
    products.forEach(p => {
      Object.keys(p.specs || {}).forEach(k => keys.add(k));
    });
    return Array.from(keys);
  }, [products]);

  const [specsFilters, setSpecsFilters] = useState(
    specsKeys.reduce((acc, key) => ({ ...acc, [key]: defaultState }), {})
  );

  // ------------------------
  // OPCIONES DINÁMICAS
  // ------------------------
  const marcas = useMemo(
    () => [...new Set(products.map(p => p.specs?.marca).filter(Boolean))].sort(),
    [products]
  );

  const specsUnicos = useMemo(() => {
    const mapear = (key) =>
      [...new Set(products.map(p => p.specs?.[key]).filter(Boolean))].sort();
    const obj = {};
    specsKeys.forEach(k => obj[k] = mapear(k));
    return obj;
  }, [products, specsKeys]);

  // ------------------------
  // FILTRADO DE PRODUCTOS
  // ------------------------
  const productosFiltrados = useMemo(() => {
    return products
      .filter(p => {
        const specs = p.specs || {};
        const checks = [
          p.price <= precioMax,
          marcaSeleccionada === defaultState || specs.marca === marcaSeleccionada,
          busqueda === "" || p.name.toLowerCase().includes(busqueda.toLowerCase()) || p.description?.toLowerCase().includes(busqueda.toLowerCase()),
          subcategoriaSeleccionada === defaultState || p.subcategory_id === subcategoriaSeleccionada,
        ];

        // Validamos todos los specs dinámicamente
        Object.entries(specsFilters).forEach(([key, value]) => {
          if (value !== defaultState) checks.push(specs[key] == value);
        });

        return checks.every(Boolean);
      })
      .sort((a, b) => (orden === "asc" ? a.price - b.price : b.price - a.price));
  }, [products, precioMax, marcaSeleccionada, busqueda, subcategoriaSeleccionada, orden, specsFilters]);

  // ------------------------
  // LIMPIAR FILTROS
  // ------------------------
  const limpiarFiltros = () => {
    setPrecioMax(precioMaxReal);
    setSubcategoriaSeleccionada(defaultState);
    setMarcaSeleccionada(defaultState);
    setBusqueda("");
    setOrden("asc");
    setSpecsFilters(specsKeys.reduce((acc, key) => ({ ...acc, [key]: defaultState }), {}));
  };

  return {
    productosFiltrados,
    precios: { precioMax, setPrecioMax, precioMaxReal },
    filtrosSeleccionados: {
      subcategoriaSeleccionada, setSubcategoriaSeleccionada,
      marcaSeleccionada, setMarcaSeleccionada,
      busqueda, setBusqueda,
      orden, setOrden,
      specsFilters, setSpecsFilters
    },
    totalFiltrados: productosFiltrados.length,
    limpiarFiltros,
    marcas,
    specsUnicos,
  };
}
