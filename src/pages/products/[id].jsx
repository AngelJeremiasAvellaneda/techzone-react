import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef, useMemo } from "react";
import BaseLayout from "../../layouts/BaseLayout";
import { useProducts } from "../../hooks/useProducts";
import { useCategories } from "../../hooks/useCategories";
import { SkeletonProductDetail } from "../../components/SkeletonCard";
import ImageZoomModal from "../../components/ImageZoomModal";
import DesktopZoomLens from "../../components/DesktopZoomLens";
import ProductReviews from "../../components/ProductReviews";
import Slider from "react-slick";
import { ShoppingCart, Heart, Share2, Expand, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartContext } from "../../context/CartContext.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Flechas personalizadas del slider
const SliderArrow = ({ direction, onClick }) => (
  <button
    onClick={onClick}
    className={`absolute top-1/2 -translate-y-1/2 z-10 p-2 bg-[var(--menu-bg)] hover:bg-[var(--accent)] rounded-full shadow-lg transition-all ${
      direction === 'prev' ? '-left-8 md:-left-10' : '-right-8 md:-right-10'
    }`}
    aria-label={direction === 'prev' ? 'Anterior' : 'Siguiente'}
  >
    {direction === 'prev' ? 
      <ChevronLeft className="w-5 h-5 text-[var(--text)]" /> : 
      <ChevronRight className="w-5 h-5 text-[var(--text)]" />
    }
  </button>
);

export default function ProductDetail() {
  const { id } = useParams();
  const sliderRef = useRef(null);
  const containerRef = useRef(null);
  
  const { products: allProducts, loading: loadingAll } = useProducts();
  const { categories, loading: loadingCategories } = useCategories();
  const { addToCart, setCartOpen } = useCartContext();

  const [product, setProduct] = useState(null);
  const [imagenSeleccionada, setImagenSeleccionada] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [tabActivo, setTabActivo] = useState("descripcion");
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const isLoading = loadingAll || loadingCategories;

  // Detectar cambios en el tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cargar producto
  useEffect(() => {
    if (!isLoading && id && allProducts.length) {
      const found = allProducts.find(p => String(p.id) === String(id));
      if (found) {
        setProduct(found);
        setImagenSeleccionada(found.image);
        setCantidad(1);
        setTabActivo("descripcion");
      } else {
        setProduct(null);
      }
    }
  }, [id, allProducts, isLoading]);

  // Productos relacionados
  const relacionados = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.id !== product.id)
      .filter(p => {
        if (product.subcategory && p.subcategory === product.subcategory) return true;
        if (p.category_id === product.category_id) return true;
        return false;
      })
      .slice(0, 8);
  }, [allProducts, product]);

  const galeria = useMemo(() => {
    if (!product) return [];
    return product.images?.length ? product.images : [product.image];
  }, [product]);

  // Reiniciar slider cuando cambia el producto o el tamaño de ventana
  useEffect(() => {
    if (sliderRef.current && relacionados.length > 0) {
      // Forzar reinicio del slider
      const timer = setTimeout(() => {
        try {
          sliderRef.current.slickGoTo(0, true);
          // Forzar recálculo del slider
          if (sliderRef.current.innerSlider) {
            sliderRef.current.innerSlider.onWindowResized();
          }
        } catch (error) {
          console.log('Error reiniciando slider:', error);
        }
      }, 150);

      return () => clearTimeout(timer);
    }
  }, [relacionados.length, id, windowWidth]);

  const category = categories.find(c => c.id === product?.category_id);

  const handleAddToCart = (item, qty = 1) => {
    addToCart({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image || imagenSeleccionada,
      quantity: qty
    });
    setCartOpen(true);
  };

  const handleShare = async () => {
    if (!navigator.share) return;
    try {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    } catch (err) {
      console.log('Error compartiendo:', err);
    }
  };

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

  // Configuración dinámica del slider basada en el ancho de ventana
  const getSliderSettings = () => {
    let slidesToShow = 4;
    
    if (windowWidth < 640) {
      slidesToShow = 1;
    } else if (windowWidth < 768) {
      slidesToShow = 1;
    } else if (windowWidth < 1024) {
      slidesToShow = 2;
    } else if (windowWidth < 1280) {
      slidesToShow = 3;
    } else {
      slidesToShow = 4;
    }

    return {
      dots: true,
      infinite: relacionados.length > slidesToShow,
      speed: 500,
      slidesToShow: Math.min(slidesToShow, relacionados.length),
      slidesToScroll: 1,
      arrows: true,
      prevArrow: <SliderArrow direction="prev" />,
      nextArrow: <SliderArrow direction="next" />,
      adaptiveHeight: false,
      variableWidth: false,
      centerMode: false,
      responsive: [
        {
          breakpoint: 1536,
          settings: {
            slidesToShow: Math.min(4, relacionados.length),
            slidesToScroll: 1,
            infinite: relacionados.length > 4
          }
        },
        {
          breakpoint: 1280,
          settings: {
            slidesToShow: Math.min(3, relacionados.length),
            slidesToScroll: 1,
            infinite: relacionados.length > 3
          }
        },
        {
          breakpoint: 1024,
          settings: {
            slidesToShow: Math.min(2, relacionados.length),
            slidesToScroll: 1,
            infinite: relacionados.length > 2
          }
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: relacionados.length > 1,
            centerMode: false
          }
        },
        {
          breakpoint: 640,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
            infinite: relacionados.length > 1,
            centerMode: false
          }
        }
      ]
    };
  };

  if (isLoading) {
    return (
      <BaseLayout title="Cargando...">
        <SkeletonProductDetail />
      </BaseLayout>
    );
  }

  if (!product) {
    return (
      <BaseLayout title="Producto no encontrado">
        <div className="mt-16 px-6 text-center py-12">
          <h1 className="text-2xl font-bold mb-4 text-[var(--text)]">
            Producto no encontrado
          </h1>
          <Link 
            to="/" 
            className="inline-block px-6 py-3 bg-[var(--accent)] hover:opacity-90 text-white rounded-lg transition-all font-medium"
          >
            Volver al inicio
          </Link>
        </div>
      </BaseLayout>
    );
  }

  return (
    <BaseLayout title={product.name}>
      <main className="mt-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto" ref={containerRef}>
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-[var(--nav-muted)]">
          <Link to="/" className="hover:text-[var(--accent)] transition-colors">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          {category ? (
            <Link
              to={`/${capitalize(category.name)}`}
              className="hover:text-[var(--accent)] transition-colors"
            >
              {capitalize(category.name)}
            </Link>
          ) : (
            <span>Categoría</span>
          )}
          <span className="mx-2">/</span>
          <span className="text-[var(--text)]">{product.name}</span>
        </nav>

        {/* CONTENIDO PRINCIPAL */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* GALERÍA */}
          <div className="space-y-4">
            {/* Desktop: Zoom Lens */}
            <div className="hidden md:block">
              <DesktopZoomLens
                image={imagenSeleccionada}
                alt={product.name}
                zoomLevel={2}
                lensSize={200}
              />
            </div>

            {/* Mobile: Click para zoom */}
            <div className="md:hidden relative">
              <img
                src={imagenSeleccionada}
                alt={product.name}
                className="w-full h-auto object-contain rounded-lg cursor-pointer bg-white dark:bg-gray-900"
                onClick={() => setShowZoomModal(true)}
              />
              <button
                onClick={() => setShowZoomModal(true)}
                className="absolute bottom-4 right-4 p-3 bg-[var(--accent)]/80 backdrop-blur-sm rounded-full shadow-lg hover:bg-[var(--accent)] transition-all"
                aria-label="Ampliar imagen"
              >
                <Expand className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Miniaturas */}
            {galeria.length > 1 && (
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {galeria.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImagenSeleccionada(img)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      imagenSeleccionada === img
                        ? 'border-[var(--accent)] ring-2 ring-[var(--accent)]/40 shadow-lg'
                        : 'border-gray-300 dark:border-gray-700 hover:border-[var(--accent)]/50'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Vista ${idx + 1}`}
                      className="w-full h-full object-cover bg-white dark:bg-gray-900"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMACIÓN DEL PRODUCTO */}
          <div className="space-y-6">
            {/* Título y favorito */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-[var(--text)] mb-2">
                  {product.name}
                </h1>
                {product.subcategory && (
                  <p className="text-sm text-[var(--nav-muted)]">
                    {product.subcategory}
                  </p>
                )}
              </div>
              <button
                onClick={() => setIsFavorite(!isFavorite)}
                className={`p-3 rounded-full transition-all shadow-md ${
                  isFavorite
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    : 'bg-[var(--menu-bg)] text-gray-500 dark:text-gray-400 hover:bg-[var(--accent)]/10'
                }`}
                aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Precio y stock */}
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 p-4 bg-[var(--menu-bg)] rounded-lg">
              <span className="text-4xl font-bold text-[var(--accent)]">
                S/. {Number(product.price).toLocaleString('es-PE')}
              </span>
              {product.stock > 0 && product.stock < 10 && (
                <span className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                  ¡Solo quedan {product.stock}!
                </span>
              )}
            </div>

            {/* Especificaciones destacadas */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="p-4 bg-[var(--menu-bg)] rounded-lg space-y-2 border border-gray-200 dark:border-gray-800">
                <h3 className="font-semibold text-[var(--text)] mb-3">
                  Características principales
                </h3>
                {Object.entries(product.specs).slice(0, 4).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-[var(--nav-muted)] capitalize">
                      {key}:
                    </span>
                    <span className="font-medium text-[var(--text)]">
                      {Array.isArray(value) ? value.join(', ') : value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Cantidad y botones */}
            <div className="space-y-4">
              {/* Selector de cantidad */}
              <div className="flex items-center gap-4 ">
                <span className="text-sm font-medium text-[var(--text)] bg-[var(--menu-bg)]">Cantidad:</span>
                <div className="flex items-center border-2 border-[var(--accent)]/30 rounded-lg overflow-hidden ">
                  <button
                    onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                    className="px-4 py-2 bg-[var(--menu-bg)] hover:bg-[var(--accent)]/10 text-[var(--text)] transition-colors"
                    aria-label="Disminuir cantidad"
                  >
                    -
                  </button>
                  <span className="px-6 py-2 bg-[var(--menu-bg)] font-semibold text-[var(--text)] min-w-[60px] text-center">
                    {cantidad}
                  </span>
                  <button
                    onClick={() => setCantidad(cantidad + 1)}
                    className="px-4 py-2 bg-[var(--menu-bg)] hover:bg-[var(--accent)]/10 text-[var(--text)] transition-colors"
                    aria-label="Aumentar cantidad"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleAddToCart(product, cantidad)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-[var(--accent)] hover:opacity-90 text-white rounded-lg transition-all font-medium shadow-lg hover:shadow-xl"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Agregar al carrito
                </button>
                <button
                  onClick={handleShare}
                  className="px-6 py-3 border-2 border-[var(--accent)]/30 rounded-lg hover:bg-[var(--accent)]/10 transition-colors flex items-center justify-center gap-2 text-[var(--text)]"
                  aria-label="Compartir producto"
                >
                  <Share2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Compartir</span>
                </button>
              </div>
            </div>

            {/* Stock info */}
            {product.stock !== undefined && (
              <div className="flex items-center gap-2 text-sm p-3 bg-[var(--menu-bg)] rounded-lg">
                {product.stock > 0 ? (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      En stock ({product.stock} disponibles)
                    </span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      Agotado
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* TABS DE INFORMACIÓN */}
        <div className="mt-12 border-t-2 border-gray-200 dark:border-gray-800 pt-8">
          {/* Navegación de tabs */}
          <div className="flex gap-6 border-b-2 border-gray-200 dark:border-gray-800 overflow-x-auto pb-px">
            {['descripcion', 'especificaciones', 'reseñas'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTabActivo(tab)}
                className={`pb-3 px-4 font-medium transition-all whitespace-nowrap relative ${
                  tabActivo === tab
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--nav-muted)] hover:text-[var(--text)]'
                }`}
              >
                {capitalize(tab)}
                {tabActivo === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* Contenido de tabs */}
          <div className="mt-6 text-[var(--text)]">
            {tabActivo === 'descripcion' && (
              <div className="prose dark:prose-invert max-w-none p-6 bg-[var(--menu-bg)] rounded-lg">
                <p className="text-[var(--text)] leading-relaxed">
                  {product.description || 'No hay descripción disponible.'}
                </p>
              </div>
            )}

            {tabActivo === 'especificaciones' && (
              <div className="grid md:grid-cols-2 gap-4">
                {product.specs && Object.entries(product.specs).length > 0 ? (
                  Object.entries(product.specs).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between p-4 bg-[var(--menu-bg)] rounded-lg border border-gray-200 dark:border-gray-800 hover:border-[var(--accent)]/50 transition-colors"
                    >
                      <span className="font-medium capitalize text-[var(--text)]">
                        {key}:
                      </span>
                      <span className="text-[var(--nav-muted)]">
                        {Array.isArray(value) ? value.join(', ') : value}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-[var(--nav-muted)] col-span-2 text-center py-8">
                    No hay especificaciones disponibles.
                  </p>
                )}
              </div>
            )}

            {tabActivo === 'reseñas' && <ProductReviews productId={product.id} />}
          </div>
        </div>

        {/* PRODUCTOS RELACIONADOS */}
        {relacionados.length > 0 && (
          <section className="mt-16 mb-12">
            <h2 className="text-2xl font-bold mb-6 text-[var(--text)]">
              Productos relacionados
            </h2>
            <div className="relative px-8">
              <Slider ref={sliderRef} {...getSliderSettings()}>
                {relacionados.map((p) => (
                  <div key={p.id} className="px-2 md:px-3">
                    <Link to={`/products/${p.id}`} className="block">
                      <div className="group bg-[var(--menu-bg)] rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-800 hover:border-[var(--accent)]/50">
                        <div className="aspect-square overflow-hidden bg-white dark:bg-gray-900 flex items-center justify-center">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-sm line-clamp-2 mb-2 text-[var(--text)] min-h-[40px]">
                            {p.name}
                          </h3>
                          <p className="text-lg font-bold text-[var(--accent)] mb-3">
                            S/. {Number(p.price).toLocaleString('es-PE')}
                          </p>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleAddToCart(p, 1);
                            }}
                            className="w-full py-2 bg-[var(--accent)] hover:opacity-90 text-white rounded-lg transition-all font-medium text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                          >
                            <ShoppingCart className="w-4 h-4" />
                            Agregar
                          </button>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </Slider>
            </div>
          </section>
        )}
      </main>

      {/* Modal de Zoom */}
      <ImageZoomModal
        image={imagenSeleccionada}
        alt={product.name}
        isOpen={showZoomModal}
        onClose={() => setShowZoomModal(false)}
      />
    </BaseLayout>
  );
}