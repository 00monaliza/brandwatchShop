import React, { useState, useRef, useEffect } from 'react';

/**
 * LazyImage - компонент для ленивой загрузки изображений
 */
export const LazyImage = ({ 
  src, 
  alt, 
  className = '', 
  style = {},
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMkY0NDU0Ii8+PC9zdmc+',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={imgRef} 
      className={`lazy-image-wrapper ${className}`} 
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {/* Placeholder */}
      <img
        src={placeholder}
        alt=""
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(10px)',
          transition: 'opacity 0.3s ease',
          opacity: isLoaded ? 0 : 1
        }}
        aria-hidden="true"
      />
      
      {/* Main Image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'opacity 0.3s ease',
            opacity: isLoaded ? 1 : 0
          }}
          {...props}
        />
      )}
    </div>
  );
};

/**
 * ResponsiveLogo - адаптивный логотип
 */
export const ResponsiveLogo = ({ 
  src, 
  alt = 'Logo', 
  className = '', 
  width = 'auto',
  height = 'auto',
  ...props 
}) => {
  return (
    <img
      src={src}
      alt={alt}
      className={`responsive-logo ${className}`}
      style={{
        width,
        height,
        objectFit: 'contain',
        maxWidth: '100%'
      }}
      loading="eager"
      {...props}
    />
  );
};

const OptimizedImageComponents = { LazyImage, ResponsiveLogo };
export default OptimizedImageComponents;
