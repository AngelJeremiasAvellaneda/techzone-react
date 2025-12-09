// src/pages/SearchResults.jsx - CORREGIDO
import React, { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link, useNavigate } from 'react-router-dom'; // AÑADE useNavigate
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { ROUTES } from '../constants/routes';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const { mainCategory, subCategory } = useParams();
  const navigate = useNavigate(); // AÑADE esto
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [filtersOpen, setFiltersOpen] = useState(false); // AÑADE este estado
  
  // Ahora sí tienes el estado
  const searchTerm = searchQuery || mainCategory;
  
  // Función para búsqueda profesional
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // ¡USA ROUTES.buildSearchUrl!
      navigate(ROUTES.buildSearchUrl({ 
        q: searchQuery.trim(),
        category: mainCategory,
        subcategory: subCategory
      }));
    }
  };
  
  // Función para aplicar filtros de precio
  const applyPriceFilter = (minPrice, maxPrice) => {
    const params = {
      q: searchQuery,
      category: mainCategory,
      subcategory: subCategory,
      minPrice,
      maxPrice
    };
    
    // Filtra parámetros vacíos
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, value]) => value !== '' && value !== null)
    );
    
    navigate(ROUTES.buildSearchUrl(cleanParams));
  };

  return (
    <div className="pt-24 pb-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header de búsqueda */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-2">
            {mainCategory ? `Categoría: ${decodeURIComponent(mainCategory)}` : 
             subCategory ? `Subcategoría: ${decodeURIComponent(subCategory)}` : 
             'Resultados de búsqueda'}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-[var(--nav-muted)]">
              {searchTerm ? `Buscando: "${searchTerm}"` : 'Explora nuestros productos'}
            </p>
            
            <div className="flex items-center gap-4">
              {/* FORMULARIO con onSubmit */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </form>
              
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <Filter className="w-5 h-5" />
                Filtros
                <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {filtersOpen && (
          <div className="mb-8 p-6 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[var(--text)]">Filtrar resultados</h3>
              <button
                onClick={() => setFiltersOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium mb-2">Precio</label>
                <div className="space-y-2">
                  <button
                    onClick={() => applyPriceFilter(0, 1000)}
                    className="flex items-center w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <input type="radio" name="price" className="mr-2" />
                    <span className="text-sm">Menos de S/. 1000</span>
                  </button>
                  <button
                    onClick={() => applyPriceFilter(1000, 3000)}
                    className="flex items-center w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                  >
                    <input type="radio" name="price" className="mr-2" />
                    <span className="text-sm">S/. 1000 - S/. 3000</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        <div className="text-center py-16">
          <div className="inline-block p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-6">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-[var(--text)] mb-4">
            Página de búsqueda en desarrollo
          </h3>
          <p className="text-[var(--nav-muted)] mb-8 max-w-md mx-auto">
            Esta funcionalidad está siendo implementada. Pronto podrás buscar y filtrar productos de manera avanzada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ROUTES.SHOP}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition font-medium"
            >
              Ver todos los productos
            </Link>
            {/* EJEMPLO: Crea enlaces con URLs profesionales */}
            <Link
              to={ROUTES.buildSearchUrl({
                category: 'laptops',
                brand: 'apple',
                minPrice: 1000,
                maxPrice: 2000
              })}
              className="px-6 py-3 border border-purple-500 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition font-medium"
            >
              Laptops Apple (S/. 1000-2000)
            </Link>
            {/* Otro ejemplo con ruta jerárquica */}
            <Link
              to={ROUTES.buildAdvancedSearchUrl('laptops', 'gaming', {
                brand: 'asus',
                minPrice: 1500,
                maxPrice: 3000
              })}
              className="px-6 py-3 border border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition font-medium"
            >
              Laptops Gaming ASUS (S/. 1500-3000)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;