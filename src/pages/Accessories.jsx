import ProductsLayout from "../layouts/ProductsLayout";
import { useProductsByCategory } from "../hooks/useProducts";
import { useSubcategoriesByName } from "../hooks/useSubcategories";
import SkeletonCard from "../components/SkeletonCard";

export default function Accesories() {
  // Hooks para obtener datos
  const { products, loading, error } = useProductsByCategory("accessories");
  const { subcategories, loading: loadingSubcats } = useSubcategoriesByName("accessories");

  // Mostrar loader mientras carga
  if (loading || loadingSubcats) {
    return (
      <>
        <div className="mt-16 px-6">
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)] mb-8">
            Accesorios
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <SkeletonCard key={n} />
            ))}
          </div>
        </div>
      </>
    );
  }

  // Mostrar error si hay
  if (error) {
    return (
      <>
        <div className="mt-16 px-6">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">Error al cargar accesorios: {error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <ProductsLayout
      title="Accesorios"
      products={products}
      subcategories={subcategories}
    />
  );
}