// src/pages/Laptops.jsx
import ProductsLayout from "../layouts/ProductsLayout";
import { useProductsByCategory } from "../hooks/useProducts";
import { useSubcategoriesByName } from "../hooks/useSubcategories";
import { SkeletonProductList, SkeletonFilters } from "../components/SkeletonCard";

export default function Laptops() {
  const { products, loading, error } = useProductsByCategory("laptops");
  const { subcategories, loading: loadingSubcats } = useSubcategoriesByName("laptops");

  if (loading || loadingSubcats) {
    return (
      <>
        <section className="mt-16 px-6 border-b border-gray-500 pb-4">
          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
            <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">
              Laptops
            </h1>
            <div className="h-10 w-48 bg-gray-700/50 rounded animate-pulse"></div>
          </div>
        </section>

        <main className="px-6 relative lg:flex lg:gap-8 mt-4">
          <aside className="lg:w-1/4 p-6 rounded-md bg-[var(--menu-bg)] shadow-lg hidden lg:block">
            <SkeletonFilters />
          </aside>

          <div className="hidden lg:block w-px bg-gray-600"></div>

          <section className="w-full lg:w-3/4">
            <SkeletonProductList count={6} />
          </section>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="mt-16 px-6">
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <ProductsLayout
      title="Laptops"
      products={products}
      subcategories={subcategories.map(s => s.name)}
      category="laptops"
    />
  );

}
