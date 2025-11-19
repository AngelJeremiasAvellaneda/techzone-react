// src/firebase/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAtlq8VfJn1ue0BfavZdRvgJGQpXpQaslg",
  authDomain: "techzone-database.firebaseapp.com",
  projectId: "techzone-database",
  storageBucket: "techzone-database.firebasestorage.app",
  messagingSenderId: "494963081294",
  appId: "1:494963081294:web:9e0ae6bfb1595e4a48031f",
  measurementId: "G-R2SJ6FVYSE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
