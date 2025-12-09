// src/components/TestProfessionalUrls.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes';

const TestProfessionalUrls = () => {
  const exampleUrls = [
    {
      title: "Búsqueda avanzada Laptops Gaming",
      description: "Filtros múltiples en query string",
      url: ROUTES.buildSearchUrl({
        category: 'laptops',
        subcategory: 'gaming',
        brand: 'asus',
        minPrice: 1500,
        maxPrice: 3000,
        inStock: true,
        sort: 'price_desc'
      })
    },
    {
      title: "Búsqueda jerárquica (URL amigable)",
      description: "Categoría y subcategoría en la ruta",
      url: ROUTES.buildAdvancedSearchUrl('laptops', 'gaming', {
        brand: 'asus',
        minPrice: 1500,
        maxPrice: 3000
      })
    },
    {
      title: "Categoría con filtros",
      description: "URL de categoría con parámetros",
      url: ROUTES.CATEGORY('laptops', {
        brand: 'apple',
        minPrice: 1000,
        maxPrice: 2000
      })
    },
    {
      title: "Producto con slug para SEO",
      description: "ID y nombre en la URL",
      url: ROUTES.getShareableProductUrl(123, 'Laptop ASUS ROG Strix G15')
    }
  ];

  return (
    <div className="min-h-screen pt-24 p-8">
      <h1 className="text-3xl font-bold mb-8">Prueba URLs Profesionales</h1>
      <div className="grid gap-6">
        {exampleUrls.map((item, index) => (
          <div key={index} className="p-6 border rounded-xl shadow-sm">
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600 mb-3">{item.description}</p>
            <div className="flex items-center gap-4">
              <Link
                to={item.url}
                className="text-blue-600 hover:underline break-all"
              >
                {item.url}
              </Link>
              <button
                onClick={() => navigator.clipboard.writeText(item.url)}
                className="px-3 py-1 bg-gray-100 rounded text-sm hover:bg-gray-200"
              >
                Copiar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestProfessionalUrls;