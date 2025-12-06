import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

const root = ReactDOM.createRoot(document.getElementById("root"));

// TEMPORAL: Desactiva StrictMode para depuración
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);