import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Hook para obtener todas las categorías principales
 * @returns {Object} { categories, loading, error, refetch }
 */
export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });

      if (fetchError) throw fetchError;

      setCategories(data || []);
    } catch (err) {
      console.error("Error loading categories:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return { 
    categories, 
    loading, 
    error, 
    refetch: loadCategories 
  };
}

/**
 * Hook para obtener una categoría específica por nombre
 * @param {string} categoryName - Nombre de la categoría
 * @returns {Object} { category, loading, error }
 */
export function useCategory(categoryName) {
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryName) {
      setLoading(false);
      return;
    }

    async function loadCategory() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("categories")
          .select("*")
          .eq("name", categoryName)
          .single();

        if (fetchError) throw fetchError;

        setCategory(data);
      } catch (err) {
        console.error("Error loading category:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadCategory();
  }, [categoryName]);

  return { category, loading, error };
}