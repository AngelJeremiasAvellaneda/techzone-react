// src/components/CartDrawer.jsx
import React, { useRef, useEffect } from "react";
import { useCartContext } from "../context/CartContext.jsx";

const CartDrawer = () => {
  const {
    cart,
    updateQuantity,
    removeItem,
    emptyCart,
    totalItems,
    totalPrice,
    cartOpen,
    setCartOpen
  } = useCartContext();

  const drawerRef = useRef(null);

  // Manejar inert y focus cuando el drawer se abre/cierra
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return;

    if (cartOpen) {
      drawer.removeAttribute("inert"); // permitir foco e interacción
      // opcional: llevar foco al primer botón dentro del drawer
      const firstFocusable = drawer.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])");
      firstFocusable?.focus();
    } else {
      drawer.setAttribute("inert", "true"); // bloquea foco e interacción
      // quitar foco si estaba dentro del drawer
      const active = document.activeElement;
      if (active && drawer.contains(active)) active.blur();
    }
  }, [cartOpen]);

  return (
    <div
      ref={drawerRef}
      className={`
        fixed top-0 right-0 h-full bg-white dark:bg-gray-900 shadow-xl z-50
        transform transition-transform duration-300
        ${cartOpen ? "translate-x-0" : "translate-x-full"}
        w-full sm:w-96
        flex flex-col
      `}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h2 className="font-bold text-white text-lg">Carrito ({totalItems})</h2>
        <button
          onClick={() => setCartOpen(false)}
          className="text-gray-700 dark:text-gray-200 font-semibold hover:text-red-500 transition"
        >
          ✕
        </button>
      </div>

      {/* LISTA (SCROLLABLE) */}
      <ul className="p-4 space-y-4 overflow-y-auto flex-1">
        {cart.length === 0 ? (
          <li className="text-center text-gray-400">El carrito está vacío</li>
        ) : (
          cart.map(item => (
            <li
              key={item.id}
              className="flex items-center gap-3 border-b pb-3 dark:border-gray-700"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded shadow-md"
              />

              <div className="flex-1 flex flex-col">
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {item.name}
                </span>

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  S/. {Number(item.price).toLocaleString("es-PE")}
                </span>

                {/* CONTROLES */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                  >
                    -
                  </button>

                  <span className="px-3 font-semibold">{item.quantity}</span>

                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-auto text-red-500 hover:text-red-700 font-semibold transition"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* FOOTER FIJO */}
      <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
        <p className="font-semibold text-white text-lg">
          Total:{" "}
          <span className="text-purple-600 dark:text-purple-400">
            S/. {Number(totalPrice).toLocaleString("es-PE")}
          </span>
        </p>

        <button
          onClick={emptyCart}
          className="mt-3 w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
        >
          Vaciar carrito
        </button>
      </div>
    </div>
  );
};

export default CartDrawer;
