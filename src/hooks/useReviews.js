import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

/**
 * Hook para obtener reseñas de un producto
 * @param {number} productId - ID del producto
 */
export function useReviews(productId) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const loadReviews = async () => {
    if (!productId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Traer reseñas sin hacer join directo
      const { data, error: fetchError } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // Mapear datos de usuarios por separado si quieres
      const mappedData = await Promise.all(
        (data || []).map(async (review) => {
          if (review.user_id) {
            const { data: userData, error: userError } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("id", review.user_id)
              .single();

            if (!userError && userData) {
              review.user = userData;
            } else {
              review.user = { full_name: "Usuario" };
            }
          }
          return review;
        })
      );

      setReviews(mappedData);
      setTotalReviews(mappedData.length);

      if (mappedData.length > 0) {
        const sum = mappedData.reduce((acc, r) => acc + r.rating, 0);
        setAverageRating((sum / mappedData.length).toFixed(1));
      } else {
        setAverageRating(0);
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
      setError(err.message || "Error cargando reseñas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const addReview = async ({ rating, comment }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión para dejar una reseña");

      const { data: existingReview } = await supabase
        .from("reviews")
        .select("id")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .single();

      if (existingReview) throw new Error("Ya has dejado una reseña");

      const { data, error: insertError } = await supabase
        .from("reviews")
        .insert([{ user_id: user.id, product_id: productId, rating, comment }])
        .select();

      if (insertError) throw insertError;

      await loadReviews();
      return { success: true, data };
    } catch (err) {
      console.error("Error adding review:", err);
      return { success: false, error: err.message };
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión");

      const { error: deleteError } = await supabase
        .from("reviews")
        .delete()
        .eq("id", reviewId)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      await loadReviews();
      return { success: true };
    } catch (err) {
      console.error("Error deleting review:", err);
      return { success: false, error: err.message };
    }
  };

  return { reviews, loading, error, averageRating, totalReviews, addReview, deleteReview, refetch: loadReviews };
}

export function useCanReview(productId) {
  const [canReview, setCanReview] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkCanReview() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setCanReview(false);
          setLoading(false);
          return;
        }

        const { data: existingReview } = await supabase
          .from("reviews")
          .select("*")
          .eq("user_id", user.id)
          .eq("product_id", productId)
          .single();

        if (existingReview) {
          setCanReview(false);
          setUserReview(existingReview);
        } else {
          setCanReview(true);
          setUserReview(null);
        }
      } catch (err) {
        console.error("Error checking review status:", err);
        setCanReview(false);
      } finally {
        setLoading(false);
      }
    }

    if (productId) checkCanReview();
  }, [productId]);

  return { canReview, userReview, loading };
}
