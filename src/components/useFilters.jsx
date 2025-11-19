import { useState, useEffect } from "react";

export function useFilters(productos) {
  const [filtros, setFiltros] = useState({});
  const [productosFiltrados, setProductosFiltrados] = useState(productos);

  useEffect(() => {
    let resultado = [...productos];

    Object.keys(filtros).forEach(key => {
      if (!filtros[key] && filtros[key] !== 0) return;

      if (key === "maxPrecio") {
        resultado = resultado.filter(p => p.precio <= Number(filtros[key]));
      } else {
        resultado = resultado.filter(p => String(p[key]).toLowerCase() === String(filtros[key]).toLowerCase());
      }
    });

    setProductosFiltrados(resultado);
  }, [filtros, productos]);

  const aplicarFiltro = (key, value) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
  };

  const limpiarFiltros = () => {
    setFiltros({});
  };

  const ordenarProductos = (order = 'asc') => {
    const sorted = [...productosFiltrados].sort((a, b) =>
      order === 'asc' ? a.precio - b.precio : b.precio - a.precio
    );
    setProductosFiltrados(sorted);
  };

  return { filtros, productosFiltrados, aplicarFiltro, limpiarFiltros, ordenarProductos };
}
