import React, { useRef, useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

const ImageZoomModal = ({ 
  image, 
  alt, 
  isOpen, 
  onClose,
  showZoomControls = true 
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, onClose]);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 1));
    if (zoomLevel <= 1.5) setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      const maxX = (imageRef.current?.offsetWidth || 0) * (zoomLevel - 1) / 2;
      const maxY = (imageRef.current?.offsetHeight || 0) * (zoomLevel - 1) / 2;
      setPosition({ x: Math.max(-maxX, Math.min(maxX, newX)), y: Math.max(-maxY, Math.min(maxY, newY)) });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e) => {
    if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - position.x, y: e.touches[0].clientY - position.y });
    }
  };

  const handleTouchMove = (e) => {
    if (isDragging && e.touches.length === 1 && zoomLevel > 1) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      const maxX = (imageRef.current?.offsetWidth || 0) * (zoomLevel - 1) / 2;
      const maxY = (imageRef.current?.offsetHeight || 0) * (zoomLevel - 1) / 2;
      setPosition({ x: Math.max(-maxX, Math.min(maxX, newX)), y: Math.max(-maxY, Math.min(maxY, newY)) });
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/95 animate-fade-in"
      onClick={onClose}
      style={{ touchAction: 'none', width: '100vw', height: '100svh' }}
    >
      {/* Botón cerrar */}
      <button
        onClick={onClose}
        className="absolute top-16 right-4 z-[1010] p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm"
        aria-label="Cerrar"
      >
        <X className="w-6 h-6 text-white" />
      </button>


      {/* Contenedor de imagen */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
        style={{ maxHeight: '100svh', width: '100vw' }}
      >
        <img
          ref={imageRef}
          src={image}
          alt={alt}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
            cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
          draggable={false}
        />
      </div>

      {/* Controles de zoom abajo a la derecha */}
      {showZoomControls && (
        <div className="absolute bottom-6 right-4 z-[1010] flex flex-col items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleZoomIn(); }}
            disabled={zoomLevel >= 4}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Acercar"
          >
            <ZoomIn className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleZoomOut(); }}
            disabled={zoomLevel <= 1}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Alejar"
          >
            <ZoomOut className="w-5 h-5 text-white" />
          </button>
          <div className="mt-1 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm text-center">
            {Math.round(zoomLevel * 100)}%
          </div>
        </div>
      )}

      {/* Indicador de drag */}
      {zoomLevel > 1 && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm">
          {isDragging ? '🤚 Arrastrando...' : '👆 Arrastra para mover'}
        </div>
      )}
    </div>
  );
};

export default ImageZoomModal;
