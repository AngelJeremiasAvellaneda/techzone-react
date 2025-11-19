// src/pages/ProductDetail.jsx
import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import BaseLayout from "../../layouts/BaseLayout";
import Slider from "react-slick";
import { useProducts } from "../../hooks/useProducts";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function ProductDetail() {
  const { id } = useParams();

  // 📌 Cargar productos desde Firebase
  const { products: laptops, loading: loadingLaptops } = useProducts("laptops");
  const { products: desktops, loading: loadingDesktops } = useProducts("desktops");
  const { products: accessories, loading: loadingAccessories } = useProducts("accessories");

  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);

  const [imagenSeleccionada, setImagenSeleccionada] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [tabActivo, setTabActivo] = useState("descripcion");

  const zoomLensRef = useRef(null);
  const mainImgRef = useRef(null);
  const zoomLevel = 1.4;

  // 📌 Unir todas las colecciones cuando estén listas
  useEffect(() => {
    if (!loadingLaptops && !loadingDesktops && !loadingAccessories) {
      const merged = [...laptops, ...desktops, ...accessories];
      setAllProducts(merged);

      const found = merged.find(p => String(p.id) === String(id));
      setProduct(found);

      if (found) {
        const gal = found.galeria || [found.imagen];
        setImagenSeleccionada(gal[0]);
      }
    }
  }, [loadingLaptops, loadingDesktops, loadingAccessories, id, laptops, desktops, accessories]);

  // 🔍 Actualiza imagen al cambiar de producto
  useEffect(() => {
    if (product) {
      const gal = product.galeria || [product.imagen];
      setImagenSeleccionada(gal[0]);
    }
  }, [product?.id]);

  // 🔍 Efecto lupa
  useEffect(() => {
    const mainImg = mainImgRef.current;
    const zoomLens = zoomLensRef.current;

    if (!mainImg || !zoomLens) return;

    if (window.innerWidth < 768) {
      zoomLens.style.display = "none";
      return;
    }

    const updateLens = () => {
      zoomLens.style.backgroundImage = `url(${imagenSeleccionada})`;
      zoomLens.style.backgroundSize = `${mainImg.offsetWidth * zoomLevel}px ${mainImg.offsetHeight * zoomLevel}px`;
    };

    if (mainImg.complete) updateLens();
    else mainImg.onload = updateLens;

    function moveLens(e) {
      const rect = mainImg.getBoundingClientRect();
      const lensSize = zoomLens.offsetWidth / 2;

      let x = e.clientX - rect.left;
      let y = e.clientY - rect.top;

      x = Math.max(lensSize, Math.min(x, rect.width - lensSize));
      y = Math.max(lensSize, Math.min(y, rect.height - lensSize));

      zoomLens.style.left = `${x - lensSize}px`;
      zoomLens.style.top = `${y - lensSize}px`;

      zoomLens.style.backgroundPosition = `-${(x * zoomLevel) - lensSize}px -${(y * zoomLevel) - lensSize}px`;
    }

    const show = () => (zoomLens.style.display = "block");
    const hide = () => (zoomLens.style.display = "none");

    mainImg.addEventListener("mousemove", moveLens);
    mainImg.addEventListener("mouseenter", show);
    mainImg.addEventListener("mouseleave", hide);

    return () => {
      mainImg.removeEventListener("mousemove", moveLens);
      mainImg.removeEventListener("mouseenter", show);
      mainImg.removeEventListener("mouseleave", hide);
    };
  }, [imagenSeleccionada]);

  if (loadingLaptops || loadingDesktops || loadingAccessories || !product) {
    return (
      <BaseLayout title="Cargando...">
        <div className="mt-16 px-6 text-center text-gray-500">Cargando producto...</div>
      </BaseLayout>
    );
  }

  const relacionados = allProducts
    .filter(p => p.id !== product.id && (p.tipo === product.tipo || p.marca === product.marca))
    .slice(0, 6);

  const galeria = product.galeria || [product.imagen];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      { breakpoint: 1024, settings: { slidesToShow: 2 } },
      { breakpoint: 640, settings: { slidesToShow: 1 } },
    ],
  };

  return (
    <BaseLayout title={product.nombre}>
      <main className="mt-16 px-6 lg:flex lg:gap-8">

        {/* 📌 IMAGEN PRINCIPAL + LUPA */}
        <div className="lg:w-1/2 flex flex-col gap-4 relative">

          <div className="relative w-full overflow-hidden rounded shadow-lg">
            <img
              key={imagenSeleccionada}
              ref={mainImgRef}
              src={imagenSeleccionada}
              alt={product.nombre}
              className="w-full h-[500px] object-contain rounded"
            />

            <div
              ref={zoomLensRef}
              className="absolute w-40 h-40 border border-gray-500 rounded-full pointer-events-none hidden"
              style={{
                display: "none",
                position: "absolute",
                boxShadow: "0 0 10px rgba(0,0,0,0.4)",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                zIndex: 30,
                cursor: "zoom-in",
              }}
            ></div>
          </div>
        </div>

        {/* INFORMACIÓN DEL PRODUCTO */}
        <div className="lg:w-1/2 flex flex-col gap-4">

          <h1 className="text-3xl font-bold text-[var(--accent)]">{product.nombre}</h1>
          <p className="text-[var(--text)] text-lg font-semibold">S/. {product.precio}</p>

          <ul className="text-[var(--text)] space-y-1">
            {product.tipo && <li><strong>Tipo:</strong> {product.tipo}</li>}
            {product.marca && <li><strong>Marca:</strong> {product.marca}</li>}
            {product.procesador && <li><strong>Procesador:</strong> {product.procesador}</li>}
            {product.ram && <li><strong>RAM:</strong> {product.ram} GB</li>}
            {product.almacenamiento && <li><strong>Almacenamiento:</strong> {product.almacenamiento} GB</li>}
            {product.pantalla && <li><strong>Pantalla:</strong> {product.pantalla}"</li>}
          </ul>

          {/* Cantidad + Carrito */}
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
              >-</button>

              <span>{cantidad}</span>

              <button
                onClick={() => setCantidad(cantidad + 1)}
                className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
              >+</button>
            </div>

            <button
              onClick={() =>
                window.addToCart({
                  id: product.id,
                  nombre: product.nombre,
                  precio: product.precio,
                  cantidad,
                  imagen: product.imagen,
                })
              }
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded transition"
            >
              Agregar al carrito
            </button>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <div className="flex gap-4 border-b border-gray-300">
              {["descripcion", "especificaciones", "opiniones"].map(tab => (
                <button
                  key={tab}
                  className={`py-2 ${tabActivo === tab ? "border-b-2 border-indigo-600 font-semibold" : ""}`}
                  onClick={() => setTabActivo(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="mt-4 text-[var(--text)]">
              {tabActivo === "descripcion" && <p>{product.descripcion || "No hay descripción disponible."}</p>}

              {tabActivo === "especificaciones" && (
                <ul className="space-y-1">
                  {product.tipo && <li><strong>Tipo:</strong> {product.tipo}</li>}
                  {product.marca && <li><strong>Marca:</strong> {product.marca}</li>}
                  {product.procesador && <li><strong>Procesador:</strong> {product.procesador}</li>}
                  {product.ram && <li><strong>RAM:</strong> {product.ram} GB</li>}
                  {product.almacenamiento && <li><strong>Almacenamiento:</strong> {product.almacenamiento} GB</li>}
                  {product.pantalla && <li><strong>Pantalla:</strong> {product.pantalla}"</li>}
                </ul>
              )}

              {tabActivo === "opiniones" && <p>No hay opiniones todavía.</p>}
            </div>
          </div>
        </div>
      </main>

      {/* ✓ PRODUCTOS RELACIONADOS */}
      {relacionados.length > 0 && (
        <section className="mt-12 px-6">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--accent)]">Productos relacionados</h2>

          <Slider {...sliderSettings}>
            {relacionados.map(p => (
              <div key={p.id} className="p-2">
                <Link to={`/products/${p.id}`}>
                  <div className="border rounded p-2 hover:shadow-lg transition">
                    <img src={p.imagen} alt={p.nombre} className="w-full h-40 object-cover rounded mb-2" />
                    <h3 className="text-sm font-semibold">{p.nombre}</h3>
                    <p className="text-sm font-bold">S/. {p.precio}</p>
                  </div>
                </Link>
              </div>
            ))}
          </Slider>
        </section>
      )}
    </BaseLayout>
  );
}
