import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PremiumImageGallery.css';

const PremiumImageGallery = ({ 
  images = [],
  productTitle = ''
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  return (
    <div className="premium-gallery">
      {/* Main Image */}
      <div 
        className={`premium-gallery__main ${isZoomed ? 'zoomed' : ''}`}
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
        onMouseMove={handleMouseMove}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedIndex}
            className="premium-gallery__image-wrapper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <img
              src={images[selectedIndex]}
              alt={`${productTitle} - Image ${selectedIndex + 1}`}
              className="premium-gallery__image"
              style={isZoomed ? {
                transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                transform: 'scale(2)'
              } : {}}
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom indicator */}
        {!isZoomed && (
          <div className="premium-gallery__zoom-hint">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
            <span>Наведите для увеличения</span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      <div className="premium-gallery__thumbnails">
        {images.map((image, index) => (
          <motion.button
            key={index}
            className={`premium-gallery__thumbnail ${selectedIndex === index ? 'active' : ''}`}
            onClick={() => setSelectedIndex(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img
              src={image}
              alt={`${productTitle} thumbnail ${index + 1}`}
              loading="lazy"
            />
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default PremiumImageGallery;
