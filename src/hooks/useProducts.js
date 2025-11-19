import { useState, useEffect } from "react";
import { getProducts } from "../data/firebaseData";

export const useProducts = (collectionName) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const data = await getProducts(collectionName);
      setProducts(data);
      setLoading(false);
    };

    load();
  }, [collectionName]);

  return { products, loading };
};