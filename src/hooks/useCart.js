import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext.jsx";

export const useCart = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  const [cartOpen, setCartOpen] = useState(false); // <-- nuevo estado

  // Guardar en localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Sincronizar carrito con DB al login
  useEffect(() => {
    const syncCart = async () => {
      if (!user) return;

      const { data: dbCart = [], error } = await supabase
        .from("cart_items")
        .select(`
          product_id,
          quantity,
          products (
            name,
            price,
            image
          )
        `)
        .eq("user_id", user.id);

      if (error) return console.error(error);

      const mappedDbCart = dbCart.map(item => ({
        id: item.product_id,
        quantity: item.quantity,
        name: item.products.name,
        price: Number(item.products.price),
        image: item.products.image
      }));

      const mergedCart = [...mappedDbCart];
      cart.forEach(localItem => {
        const exists = mergedCart.find(i => i.id === localItem.id);
        if (exists) {
          exists.quantity += localItem.quantity;
        } else {
          mergedCart.push(localItem);
        }
      });

      setCart(mergedCart);

      for (const item of mergedCart) {
        await supabase.from("cart_items").upsert({
          user_id: user.id,
          product_id: item.id,
          quantity: item.quantity
        });
      }
    };

    syncCart();
  }, [user]);

  const addToCart = async (product) => {
    if (!product.quantity || product.quantity < 1) product.quantity = 1;

    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + product.quantity } : i
        );
      }
      return [...prev, product];
    });

    // Abrir automáticamente el drawer
    setCartOpen(true);

    if (user) {
      setTimeout(async () => {
        const { data: existing } = await supabase
          .from("cart_items")
          .select("quantity")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .single();

        const nuevaCantidad = (existing?.quantity || 0) + product.quantity;
        await supabase.from("cart_items").upsert({
          user_id: user.id,
          product_id: product.id,
          quantity: nuevaCantidad
        });
      }, 0);
    }
  };

  const updateQuantity = async (id, delta) => {
    setCart(prev => {
      const updated = prev.map(i =>
        i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i
      );

      if (user) {
        const item = updated.find(p => p.id === id);
        supabase.from("cart_items")
          .update({ quantity: item.quantity })
          .eq("user_id", user.id)
          .eq("product_id", id);
      }

      return updated;
    });
  };

  const removeItem = async (id) => {
    setCart(prev => prev.filter(i => i.id !== id));
    if (user) {
      await supabase.from("cart_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", id);
    }
  };

  const emptyCart = async () => {
    setCart([]);
    if (user) {
      await supabase.from("cart_items")
        .delete()
        .eq("user_id", user.id);
    }
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeItem,
    emptyCart,
    totalItems,
    totalPrice,
    setCart,
    cartOpen, // <-- nuevo
    setCartOpen // <-- nuevo
  };
};
