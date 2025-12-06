// src/pages/Cart.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCartContext } from "../context/CartContext";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft,
  Package,
  Truck,
  CreditCard,
  Tag
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const {
    cart,
    updateQuantity,
    removeItem,
    emptyCart,
    totalItems,
    totalPrice
  } = useCartContext();
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const shipping = totalPrice > 100 ? 0 : 10;
  const finalTotal = totalPrice + shipping - discount;

  const handleApplyPromo = () => {
    // Simulación de código promocional
    if (promoCode.toLowerCase() === "techzone10") {
      setDiscount(totalPrice * 0.1);
      alert("¡Código aplicado! 10% de descuento");
    } else if (promoCode) {
      alert("Código inválido");
    }
  };

  return (
    <>
      <main className="mt-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto py-12">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-[var(--nav-muted)]">
          <Link to="/" className="hover:text-[var(--accent)] transition-colors">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[var(--text)]">Carrito</span>
        </nav>

        {/* Título */}
        <div className="flex items-center gap-3 mb-8">
          <ShoppingBag className="w-8 h-8 text-[var(--accent)]" />
          <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)]">
            Carrito de Compras
          </h1>
          {totalItems > 0 && (
            <span className="px-3 py-1 bg-[var(--accent)]/20 text-[var(--accent)] rounded-full text-sm font-semibold">
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {cart.length === 0 ? (
          /* Carrito vacío */
          <div className="flex flex-col items-center justify-center py-20 bg-[var(--menu-bg)] rounded-2xl border border-gray-200 dark:border-gray-800">
            <ShoppingBag className="w-24 h-24 text-gray-300 dark:text-gray-700 mb-6" />
            <h2 className="text-2xl font-bold text-[var(--text)] mb-3">
              Tu carrito está vacío
            </h2>
            <p className="text-[var(--nav-muted)] mb-8 text-center max-w-md">
              Parece que aún no has agregado productos a tu carrito. ¡Explora nuestro catálogo y encuentra lo que necesitas!
            </p>
            <Link
              to="/"
              className="flex items-center gap-2 px-8 py-4 bg-[var(--accent)] hover:opacity-90 text-white rounded-lg transition-all font-semibold shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Ir a comprar
            </Link>
          </div>
        ) : (
          /* Carrito con productos */
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Lista de productos */}
            <div className="lg:col-span-2 space-y-4">
              {/* Header de la lista */}
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[var(--text)]">
                  Productos ({totalItems})
                </h2>
                <button
                  onClick={() => {
                    if (window.confirm('¿Estás seguro de vaciar el carrito?')) {
                      emptyCart();
                    }
                  }}
                  className="text-red-500 hover:text-red-600 font-medium text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Vaciar carrito
                </button>
              </div>

              {/* Items del carrito */}
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row gap-4 p-4 md:p-6 bg-[var(--menu-bg)] rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-lg transition-all"
                >
                  {/* Imagen */}
                  <Link
                    to={`/products/${item.id}`}
                    className="flex-shrink-0 w-full sm:w-32 h-32"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain rounded-lg bg-white dark:bg-gray-900"
                    />
                  </Link>

                  {/* Información */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/products/${item.id}`}
                        className="font-semibold text-lg text-[var(--text)] hover:text-[var(--accent)] transition-colors line-clamp-2 mb-2"
                      >
                        {item.name}
                      </Link>
                      <p className="text-2xl font-bold text-[var(--accent)] mb-4">
                        S/. {Number(item.price).toLocaleString("es-PE")}
                      </p>
                    </div>

                    {/* Controles */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      {/* Cantidad */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-[var(--text)]">
                          Cantidad:
                        </span>
                        <div className="flex items-center border-2 border-[var(--accent)]/30 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="p-2 hover:bg-[var(--accent)]/10 transition-colors"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-4 h-4 text-[var(--text)]" />
                          </button>
                          <span className="px-4 font-semibold text-[var(--text)] min-w-[3rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="p-2 hover:bg-[var(--accent)]/10 transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-4 h-4 text-[var(--text)]" />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal y eliminar */}
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xs text-[var(--nav-muted)]">Subtotal</p>
                          <p className="text-lg font-bold text-[var(--accent)]">
                            S/. {(item.price * item.quantity).toLocaleString("es-PE")}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Botón continuar comprando */}
              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full py-3 border-2 border-[var(--accent)]/30 rounded-lg hover:bg-[var(--accent)]/10 transition-colors text-[var(--text)] font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Continuar comprando
              </Link>
            </div>

            {/* Resumen del pedido */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-6">
                {/* Card principal */}
                <div className="p-6 bg-[var(--menu-bg)] rounded-xl border border-gray-200 dark:border-gray-800 shadow-lg">
                  <h2 className="text-xl font-bold text-[var(--text)] mb-6">
                    Resumen del pedido
                  </h2>

                  {/* Desglose */}
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-[var(--text)]">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-semibold">
                        S/. {totalPrice.toLocaleString("es-PE")}
                      </span>
                    </div>

                    <div className="flex justify-between text-[var(--text)]">
                      <span>Envío</span>
                      <span className="font-semibold">
                        {shipping === 0 ? (
                          <span className="text-green-600 dark:text-green-400">
                            ¡Gratis!
                          </span>
                        ) : (
                          `S/. ${shipping.toLocaleString("es-PE")}`
                        )}
                      </span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 dark:text-green-400">
                        <span>Descuento</span>
                        <span className="font-semibold">
                          -S/. {discount.toLocaleString("es-PE")}
                        </span>
                      </div>
                    )}

                    <div className="border-t-2 border-gray-200 dark:border-gray-800 pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-[var(--text)]">
                          Total
                        </span>
                        <span className="text-2xl font-bold text-[var(--accent)]">
                          S/. {finalTotal.toLocaleString("es-PE")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Código promocional */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[var(--text)] mb-2">
                      ¿Tienes un código promocional?
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Código"
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-[var(--menu-bg)] text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />
                      <button
                        onClick={handleApplyPromo}
                        className="px-4 py-2 bg-[var(--accent)]/20 text-[var(--accent)] hover:bg-[var(--accent)]/30 rounded-lg transition-colors font-medium"
                      >
                        Aplicar
                      </button>
                    </div>
                  </div>

                  {/* Botón finalizar compra */}
                  <Link to="/checkout">
                    <button className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--accent)] hover:opacity-90 text-white rounded-lg font-bold text-lg transition-all shadow-lg">
                      Proceder al Pago
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </Link>

                  {/* Envío gratis banner */}
                  {shipping > 0 && totalPrice < 100 && (
                    <p className="text-sm text-center text-[var(--nav-muted)] mt-4">
                      Agrega S/. {(100 - totalPrice).toLocaleString("es-PE")} más para envío gratis
                    </p>
                  )}
                </div>

                {/* Beneficios */}
                <div className="p-6 bg-[var(--menu-bg)] rounded-xl border border-gray-200 dark:border-gray-800 space-y-4">
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-[var(--text)] mb-1">
                        Envío seguro
                      </h3>
                      <p className="text-sm text-[var(--nav-muted)]">
                        Todos nuestros productos están asegurados
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-[var(--text)] mb-1">
                        Entrega rápida
                      </h3>
                      <p className="text-sm text-[var(--nav-muted)]">
                        Recibe tu pedido en 2-5 días hábiles
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-[var(--accent)] flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-semibold text-[var(--text)] mb-1">
                        Pago seguro
                      </h3>
                      <p className="text-sm text-[var(--nav-muted)]">
                        Transacciones 100% protegidas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default Cart;