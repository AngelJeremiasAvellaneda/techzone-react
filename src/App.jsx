// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Context
import { CartProvider } from "./context/CartContext.jsx";

// Layouts
import BaseLayout from "./layouts/BaseLayout.jsx";
import ProductsLayout from "./layouts/ProductsLayout.jsx";

// Pages
import Home from "./pages/index.jsx";
import About from "./pages/About.jsx";
import Contact from "./pages/Contact.jsx";
import News from "./pages/News.jsx";
import Laptops from "./pages/Laptops.jsx";
import Desktops from "./pages/Desktops.jsx";
import Accessories from "./pages/Accessories.jsx";
import ProductPage from "./pages/products/[id].jsx";

function App() {
  return (
    <CartProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/About" element={<About />} />
          <Route path="/Contact" element={<Contact />} />
          <Route path="/News" element={<News />} />
          <Route path="/Laptops" element={<Laptops />} />
          <Route path="/Desktops" element={<Desktops />} />
          <Route path="/Accessories" element={<Accessories />} />
          <Route path="/products/:id" element={<ProductPageWrapper />} />
        </Routes>
      </Router>
    </CartProvider>
  );
}

// Wrapper para pasar el param a ProductPage
import { useParams } from "react-router-dom";
function ProductPageWrapper() {
  const { id } = useParams();
  return <ProductPage productId={id} />;
}

export default App;
