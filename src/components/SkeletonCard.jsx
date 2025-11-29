import React from "react";

const SkeletonCard = ({ variant = "list" }) => {
  if (variant === "list") {
    // Skeleton para vista de lista (usado en ProductsLayout)
    return (
      <div className="producto flex flex-col sm:flex-row items-center border-b border-gray-600 p-4 animate-pulse">
        {/* Imagen */}
        <div className="w-full sm:w-48 h-32 bg-gray-700/50 rounded flex-shrink-0"></div>

        {/* Contenido */}
        <div className="flex-1 sm:ml-4 flex flex-col justify-between w-full mt-2 sm:mt-0 space-y-3">
          {/* Título */}
          <div className="space-y-2">
            <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
            <div className="h-4 bg-gray-700/50 rounded w-full"></div>
          </div>

          {/* Especificaciones */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-700/50 rounded w-2/3"></div>
            <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700/50 rounded w-3/5"></div>
          </div>

          {/* Precio y botones */}
          <div className="mt-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div className="h-8 bg-gray-700/50 rounded w-32"></div>
            
            <div className="flex items-center gap-3">
              {/* Contador */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-700/50 rounded"></div>
                <div className="h-8 w-12 bg-gray-700/50 rounded"></div>
                <div className="h-8 w-8 bg-gray-700/50 rounded"></div>
              </div>
              {/* Botón agregar */}
              <div className="h-10 w-28 bg-gray-700/50 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Skeleton para vista de tarjeta (grid)
  return (
    <div className="bg-[var(--menu-bg)] rounded-lg overflow-hidden shadow-lg animate-pulse">
      {/* Imagen */}
      <div className="w-full h-48 bg-gray-700/50"></div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Título */}
        <div className="h-6 bg-gray-700/50 rounded w-3/4"></div>
        
        {/* Descripción */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-700/50 rounded w-full"></div>
          <div className="h-4 bg-gray-700/50 rounded w-5/6"></div>
        </div>

        {/* Especificaciones */}
        <div className="space-y-2 pt-2">
          <div className="h-3 bg-gray-700/50 rounded w-2/3"></div>
          <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
        </div>

        {/* Precio */}
        <div className="pt-3 border-t border-gray-700">
          <div className="h-8 bg-gray-700/50 rounded w-1/3"></div>
        </div>

        {/* Botón */}
        <div className="h-10 bg-gray-700/50 rounded w-full"></div>
      </div>
    </div>
  );
};

/**
 * SkeletonProductGrid - Muestra una grilla de skeletons
 */
export const SkeletonProductGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant="card" />
      ))}
    </div>
  );
};

/**
 * SkeletonProductList - Muestra una lista de skeletons
 */
export const SkeletonProductList = ({ count = 4 }) => {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant="list" />
      ))}
    </div>
  );
};

/**
 * SkeletonFilters - Skeleton para sidebar de filtros
 */
export const SkeletonFilters = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Título */}
      <div className="h-7 bg-gray-700/50 rounded w-1/2"></div>

      {/* Búsqueda */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
        <div className="h-10 bg-gray-700/50 rounded w-full"></div>
      </div>

      {/* Precio */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-700/50 rounded w-2/3"></div>
        <div className="h-2 bg-gray-700/50 rounded w-full"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-700/50 rounded w-12"></div>
          <div className="h-3 bg-gray-700/50 rounded w-12"></div>
        </div>
      </div>

      {/* Subcategorías */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-700/50 rounded w-1/4"></div>
        <div className="h-10 bg-gray-700/50 rounded w-full"></div>
      </div>

      {/* Marcas */}
      <div className="space-y-2">
        <div className="h-4 bg-gray-700/50 rounded w-1/3"></div>
        <div className="h-10 bg-gray-700/50 rounded w-full"></div>
      </div>

      {/* Botones */}
      <div className="space-y-2">
        <div className="h-10 bg-gray-700/50 rounded w-full"></div>
      </div>
    </div>
  );
};

/**
 * SkeletonProductDetail - Skeleton para página de detalle de producto
 */
export const SkeletonProductDetail = () => {
  return (
    <div className="mt-16 px-6 animate-pulse">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Galería de imágenes */}
          <div className="space-y-4">
            <div className="w-full h-96 bg-gray-700/50 rounded-lg"></div>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 bg-gray-700/50 rounded"></div>
              ))}
            </div>
          </div>

          {/* Información */}
          <div className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <div className="h-8 bg-gray-700/50 rounded w-3/4"></div>
              <div className="h-6 bg-gray-700/50 rounded w-1/2"></div>
            </div>

            {/* Precio */}
            <div className="h-10 bg-gray-700/50 rounded w-1/3"></div>

            {/* Descripción */}
            <div className="space-y-2">
              <div className="h-4 bg-gray-700/50 rounded w-full"></div>
              <div className="h-4 bg-gray-700/50 rounded w-full"></div>
              <div className="h-4 bg-gray-700/50 rounded w-3/4"></div>
            </div>

            {/* Especificaciones */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-5 bg-gray-700/50 rounded w-2/3"></div>
              ))}
            </div>

            {/* Botones */}
            <div className="flex gap-3">
              <div className="h-12 bg-gray-700/50 rounded flex-1"></div>
              <div className="h-12 w-12 bg-gray-700/50 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;