import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useFavorites = (userId) => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadFavorites = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          created_at,
          product:products (
            id,
            name,
            description,
            price,
            stock,
            image,
            specs,
            category_id,
            subcategory_id
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('No se pudieron cargar los favoritos');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const removeFavorite = async (favoriteId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('id', favoriteId);

      if (error) throw error;

      setFavorites(prev => prev.filter(fav => fav.id !== favoriteId));
      return { success: true };
    } catch (err) {
      console.error('Error removing favorite:', err);
      return { success: false, error: err.message };
    }
  };

  const addFavorite = async (productId) => {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          product_id: productId
        });

      if (error) throw error;

      await loadFavorites();
      return { success: true };
    } catch (err) {
      console.error('Error adding favorite:', err);
      return { success: false, error: err.message };
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav.product?.id === productId);
  };

  useEffect(() => {
    if (userId) loadFavorites();
  }, [userId, loadFavorites]);

  return {
    favorites,
    loading,
    error,
    refetch: loadFavorites,
    removeFavorite,
    addFavorite,
    isFavorite,
  };
};
