// src/components/CartDrawer.jsx
import React from "react";

const CartDrawer = ({
  isOpen,
  setIsOpen,
  cart = [],
  updateQuantity = () => {},
  removeItem = () => {},
  emptyCart = () => {},
  totalItems = 0,
  totalPrice = 0
}) => {
  return (
    <div
      className={`
        fixed top-0 right-0 h-full bg-white dark:bg-gray-900 shadow-xl z-50
        transform transition-transform duration-300
        ${isOpen ? "translate-x-0" : "translate-x-full"}
        w-full sm:w-96
      `}
    >

      {/* HEADER */}
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h2 className="font-bold text-lg">Carrito ({totalItems})</h2>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-700 dark:text-gray-200 font-semibold hover:text-red-500"
        >
          ✕
        </button>
      </div>

      {/* LISTA (SCROLLABLE) */}
      <ul className="p-4 space-y-4 overflow-y-auto flex-1 h-[65%]">
        {cart.length === 0 ? (
          <li className="text-center text-gray-400">El carrito está vacío</li>
        ) : (
          cart.map(item => (
            <li
              key={item.id}
              className="flex items-center gap-3 border-b pb-3 dark:border-gray-700"
            >
              <img
                src={item.imagen}
                alt={item.nombre}
                className="w-16 h-16 object-cover rounded shadow-md"
              />

              <div className="flex-1 flex flex-col">
                <span className="font-semibold text-purple-600 dark:text-purple-400">
                  {item.nombre}
                </span>

                <span className="text-sm text-gray-700 dark:text-gray-300">
                  S/. {item.precio}
                </span>

                {/* CONTROLES */}
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="bg-gray-600 text-white px-2 rounded hover:bg-gray-700"
                  >
                    -
                  </button>

                  <span className="px-2 font-semibold">{item.cantidad}</span>

                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="bg-gray-600 text-white px-2 rounded hover:bg-gray-700"
                  >
                    +
                  </button>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="ml-2 text-red-500 hover:text-red-700 font-semibold"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* FOOTER */}
      {cart.length > 0 && (
        <div className="p-4 border-t dark:border-gray-700 bg-white dark:bg-gray-900">
          <p className="font-semibold text-lg">
            Total: <span className="text-purple-600 dark:text-purple-400">S/. {totalPrice}</span>
          </p>

          <button
            onClick={emptyCart}
            className="mt-3 w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Vaciar carrito
          </button>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;
