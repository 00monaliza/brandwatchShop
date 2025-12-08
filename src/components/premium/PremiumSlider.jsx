import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './PremiumSlider.css';

const PremiumSlider = ({ 
  products = [], 
  title = "Рекомендуемые",
  autoPlay = true,
  autoPlayInterval = 5000
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(0);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slidesPerView = typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 3;
  const maxIndex = Math.max(0, products.length - slidesPerView);

  useEffect(() => {
    if (!autoPlay || isPaused || products.length <= slidesPerView) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, isPaused, maxIndex, autoPlayInterval, products.length, slidesPerView]);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  const goNext = () => {
    setDirection(1);
    setCurrentIndex(prev => prev >= maxIndex ? 0 : prev + 1);
  };

  const goPrev = () => {
    setDirection(-1);
    setCurrentIndex(prev => prev <= 0 ? maxIndex : prev - 1);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) goNext();
      else goPrev();
    }
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.65, 0, 0.35, 1]
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.6,
        ease: [0.65, 0, 0.35, 1]
      }
    })
  };

  return (
    <section 
      className="premium-slider"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="premium-slider__header">
        <motion.h2
          className="premium-slider__title"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {title}
        </motion.h2>

        <div className="premium-slider__controls">
          <button 
            className="premium-slider__arrow premium-slider__arrow--prev"
            onClick={goPrev}
            aria-label="Previous"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <button 
            className="premium-slider__arrow premium-slider__arrow--next"
            onClick={goNext}
            aria-label="Next"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>

      <div 
        className="premium-slider__container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <motion.div 
          className="premium-slider__track"
          animate={{ x: `-${currentIndex * (100 / slidesPerView)}%` }}
          transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              className="premium-slider__slide"
              style={{ width: `${100 / slidesPerView}%` }}
            >
              <div className="premium-slider__card">
                <div className="premium-slider__image-wrapper">
                  <img 
                    src={product.image} 
                    alt={product.title}
                    loading="lazy"
                  />
                  <div className="premium-slider__card-overlay">
                    <span className="premium-slider__brand">{product.brand}</span>
                    <h3 className="premium-slider__card-title">{product.title}</h3>
                    <span className="premium-slider__price">
                      {product.price.toLocaleString()} ₸
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Dots */}
      <div className="premium-slider__dots">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            className={`premium-slider__dot ${currentIndex === index ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default PremiumSlider;
