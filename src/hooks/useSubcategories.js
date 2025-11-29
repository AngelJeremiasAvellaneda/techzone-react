import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Hook para obtener subcategorías
 * @param {number|null} categoryId - ID de la categoría (opcional)
 * @returns {Object} { subcategories, loading, error, refetch }
 */
export function useSubcategories(categoryId = null) {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("subcategories")
        .select("*")
        .order("name", { ascending: true });

      // Si se proporciona categoryId, filtrar por esa categoría
      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setSubcategories(data || []);
    } catch (err) {
      console.error("Error loading subcategories:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubcategories();
  }, [categoryId]);

  return { 
    subcategories, 
    loading, 
    error, 
    refetch: loadSubcategories 
  };
}

/**
 * Hook para obtener subcategorías por nombre de categoría
 * @param {string} categoryName - Nombre de la categoría
 * @returns {Object} { subcategories, loading, error }
 */
export function useSubcategoriesByName(categoryName) {
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!categoryName) {
      setLoading(false);
      return;
    }

    async function loadSubcategories() {
      try {
        setLoading(true);
        setError(null);

        // Primero obtener el ID de la categoría
        const { data: categoryData, error: categoryError } = await supabase
          .from("categories")
          .select("id")
          .eq("name", categoryName)
          .single();

        if (categoryError) throw categoryError;

        // Luego obtener las subcategorías
        const { data, error: fetchError } = await supabase
          .from("subcategories")
          .select("*")
          .eq("category_id", categoryData.id)
          .order("name", { ascending: true });

        if (fetchError) throw fetchError;

        setSubcategories(data || []);
      } catch (err) {
        console.error("Error loading subcategories:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadSubcategories();
  }, [categoryName]);

  return { subcategories, loading, error };
}