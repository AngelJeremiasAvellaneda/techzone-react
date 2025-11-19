import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";

export const getProducts = async (collectionName) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return data;
  } catch (error) {
    console.error("Error obteniendo productos:", error);
    return [];
  }
};
