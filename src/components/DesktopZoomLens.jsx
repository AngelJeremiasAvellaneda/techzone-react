import React, { useRef, useEffect, useState } from 'react';

/**
 * Componente de lupa para zoom en escritorio
 * Muestra una lupa cuadrada que sigue el cursor
 */
const DesktopZoomLens = ({ 
  image, 
  alt,
  zoomLevel = 2,
  lensSize = 150
}) => {
  const imageRef = useRef(null);
  const lensRef = useRef(null);
  const [showLens, setShowLens] = useState(false);
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const imageEl = imageRef.current;
    const lensEl = lensRef.current;
    
    if (!imageEl || !lensEl || isMobile) return;

    const handleMouseMove = (e) => {
      const rect = imageEl.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Verificar si está dentro de la imagen
      if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
        setShowLens(false);
        return;
      }

      setShowLens(true);

      // Calcular posición de la lupa
      const lensX = Math.max(0, Math.min(x - lensSize / 2, rect.width - lensSize));
      const lensY = Math.max(0, Math.min(y - lensSize / 2, rect.height - lensSize));

      setLensPosition({ x: lensX, y: lensY });

      // Actualizar posición del background
      const bgX = -((x / rect.width) * imageEl.naturalWidth * zoomLevel - lensSize / 2);
      const bgY = -((y / rect.height) * imageEl.naturalHeight * zoomLevel - lensSize / 2);

      lensEl.style.backgroundPosition = `${bgX}px ${bgY}px`;
    };

    const handleMouseEnter = () => setShowLens(true);
    const handleMouseLeave = () => setShowLens(false);

    imageEl.addEventListener('mousemove', handleMouseMove);
    imageEl.addEventListener('mouseenter', handleMouseEnter);
    imageEl.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      imageEl.removeEventListener('mousemove', handleMouseMove);
      imageEl.removeEventListener('mouseenter', handleMouseEnter);
      imageEl.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [image, zoomLevel, lensSize, isMobile]);

  return (
    <div className="relative w-full">
      <img
        ref={imageRef}
        src={image}
        alt={alt}
        className="w-full h-auto object-contain rounded-lg"
        draggable={false}
      />
      
      {!isMobile && (
        <div
          ref={lensRef}
          className={`absolute pointer-events-none border-2 border-indigo-500 shadow-2xl transition-opacity duration-200 ${
            showLens ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            width: `${lensSize}px`,
            height: `${lensSize}px`,
            left: `${lensPosition.x}px`,
            top: `${lensPosition.y}px`,
            backgroundImage: `url(${image})`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: `${imageRef.current?.naturalWidth * zoomLevel}px ${imageRef.current?.naturalHeight * zoomLevel}px`,
            borderRadius: '8px',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)',
            zIndex: 10
          }}
        />
      )}
      
      {!isMobile && (
        <div className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
          Pasa el mouse sobre la imagen para hacer zoom
        </div>
      )}
    </div>
  );
};

export default DesktopZoomLens;