// src/components/ProductReviews.jsx
import React, { useState } from "react";
import { Star, Trash2, User } from "lucide-react";
import { useReviews, useCanReview } from "../hooks/useReviews";
import { Link } from "react-router-dom";

const ProductReviews = ({ productId }) => {
  const { 
    reviews, 
    loading, 
    error, 
    averageRating, 
    totalReviews,
    addReview,
    deleteReview 
  } = useReviews(productId);

  const { canReview, userReview, loading: loadingCanReview } = useCanReview(productId);

  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    if (!comment.trim()) {
      setSubmitError("Por favor escribe un comentario");
      setSubmitting(false);
      return;
    }

    const result = await addReview({ rating, comment: comment.trim() });

    if (result.success) {
      setSubmitSuccess(true);
      setComment("");
      setRating(5);
      setShowForm(false);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } else {
      setSubmitError(result.error);
    }

    setSubmitting(false);
  };

  const handleDelete = async (reviewId) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar tu reseña?")) {
      const result = await deleteReview(reviewId);
      if (!result.success) {
        alert(`Error: ${result.error}`);
      }
    }
  };

  const renderStars = (rating, size = "w-5 h-5", interactive = false, onRate = null) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate && onRate(star)}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
          disabled={!interactive}
        >
          <Star
            className={`${size} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
          />
        </button>
      ))}
    </div>
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading || loadingCanReview) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 dark:text-red-400">
        Error al cargar reseñas: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de reseñas */}
      <div className="flex items-center gap-6 p-4 bg-[var(--menu-bg)] rounded-lg justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold text-[var(--accent)]">
            {averageRating || "0.0"}
          </div>
          <div className="mt-1">
            {renderStars(Math.round(averageRating))}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {totalReviews} {totalReviews === 1 ? 'reseña' : 'reseñas'}
          </div>
        </div>

        {canReview && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
          >
            Escribir reseña
          </button>
        )}
      </div>

      {/* Mensaje si no puede dejar reseña */}
      {!canReview && !userReview && (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          Debes <Link to="/login" className="text-indigo-600 hover:text-indigo-700">iniciar sesión</Link> para dejar una reseña.
        </div>
      )}

      {/* Formulario de nueva reseña */}
      {showForm && canReview && (
        <form onSubmit={handleSubmit} className="p-4 border border-gray-300 dark:border-gray-700 rounded-lg space-y-4">
          <h3 className="font-semibold text-lg">Escribe tu reseña</h3>
          <div>
            <label className="block text-sm font-medium mb-2">Calificación</label>
            {renderStars(rating, "w-8 h-8", true, setRating)}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Comentario</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cuéntanos tu experiencia con este producto..."
              className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-[var(--text)] min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          {submitError && <div className="text-red-500 dark:text-red-400 text-sm">{submitError}</div>}
          {submitSuccess && <div className="text-green-600 dark:text-green-400 text-sm">¡Reseña publicada con éxito!</div>}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
            >
              {submitting ? "Publicando..." : "Publicar reseña"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setComment("");
                setRating(5);
                setSubmitError("");
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Reseña del usuario actual */}
      {userReview && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="font-semibold">Tu reseña</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {formatDate(userReview.created_at)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {renderStars(userReview.rating, "w-4 h-4")}
              <button
                onClick={() => handleDelete(userReview.id)}
                className="ml-2 p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                title="Eliminar reseña"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
          <p className="text-[var(--text)]">{userReview.comment}</p>
        </div>
      )}

      {/* Lista de reseñas */}
      {reviews.length === 0 && !canReview && !userReview ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No hay reseñas todavía. ¡Sé el primero en opinar!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews
            .filter(review => !userReview || review.id !== userReview.id)
            .map((review) => (
              <div
                key={review.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </div>
                    <div>
                      <div className="font-semibold">{review.profiles?.full_name || "Usuario"}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(review.created_at)}</div>
                    </div>
                  </div>
                  {renderStars(review.rating, "w-4 h-4")}
                </div>
                <p className="text-[var(--text)] mt-2">{review.comment}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;
