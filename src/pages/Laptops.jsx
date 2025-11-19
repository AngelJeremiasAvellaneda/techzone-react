import ProductsLayout from "../layouts/ProductsLayout";
import BaseLayout from "../layouts/BaseLayout";
import { useProducts } from "../hooks/useProducts";

export default function Laptops() {
  const { products, loading } = useProducts("laptops");

  if (loading)
    return (
      <BaseLayout title="Laptops">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-[var(--accent)]"></div>
        </div>
      </BaseLayout>
    );

  return <ProductsLayout title="Laptops" products={products} />;
}
