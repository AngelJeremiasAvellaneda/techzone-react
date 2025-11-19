import ProductsLayout from "../layouts/ProductsLayout";
import BaseLayout from "../layouts/BaseLayout";
import { useProducts } from "../hooks/useProducts";

export default function Desktops() {
  const { products, loading } = useProducts("desktops");

  if (loading)
    return (
      <BaseLayout title="Desktops">
        <div className="flex justify-center items-center h-64">
          <div
            className="animate-spin rounded-full h-10 w-10 border-4"
            style={{
              borderColor: "var(--line)",
              borderTopColor: "var(--accent)",
            }}
          ></div>
        </div>
      </BaseLayout>
    );

  return <ProductsLayout title="Desktops" products={products} />;
}
