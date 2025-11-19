import { useState, useEffect } from "react";

export const useCart = () => {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  // Sincronizar con localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item) => {
    if (!item.cantidad || item.cantidad < 1) item.cantidad = 1;

    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.id === item.id ? { ...i, cantidad: i.cantidad + item.cantidad } : i
        );
      }
      return [...prev, item];
    });
  };

  const emptyCart = () => setCart([]);
  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQuantity = (id, delta) => setCart(prev =>
    prev.map(i => i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i)
  );

  const totalItems = cart.reduce((sum, i) => sum + i.cantidad, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

  return {
    cart,
    addToCart,
    emptyCart,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    setCart
  };
};
