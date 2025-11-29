import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Hook para obtener todos los productos
 */
export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .order("name", { ascending: true });

      if (fetchError) throw fetchError;

      setProducts(data || []);
    } catch (err) {
      console.error("Error loading products:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return { products, loading, error, refetch: loadProducts };
}

/**
 * Hook para obtener productos por categoría (si no se pasa categoryName, devuelve todos)
 */
export function useProductsByCategory(categoryName = null) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from("products").select("*").order("name", { ascending: true });

      if (categoryName) {
        // Buscar el ID de la categoría
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("name", categoryName)
          .single();

        if (categoryError) throw categoryError;

        query = query.eq("category_id", categoryData.id);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setProducts(data || []);
    } catch (err) {
      console.error(`Error loading products for category ${categoryName}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [categoryName]);

  return { products, loading, error, refetch: loadProducts };
}

/**
 * Hook para obtener productos por subcategoría (si no se pasa subcategory, devuelve todos)
 */
export function useProductsBySubcategory(subcategory = null) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase.from("products").select("*").order("name", { ascending: true });

      if (subcategory) {
        query = query.eq("subcategory", subcategory);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;

      setProducts(data || []);
    } catch (err) {
      console.error(`Error loading products for subcategory ${subcategory}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [subcategory]);

  return { products, loading, error, refetch: loadProducts };
}

/**
 * Hook para obtener un producto por ID
 */
export function useProduct(productId) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProduct = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (fetchError) throw fetchError;

      setProduct(data);
    } catch (err) {
      console.error(`Error loading product ${productId}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [productId]);

  return { product, loading, error, refetch: loadProduct };
}
