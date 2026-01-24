import React, { useState, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../utils/productImage';
import { useCurrency } from '../hooks/useCurrency';
import './ProductCard.css';

// Helper function to add product to recently viewed
const addToRecentlyViewed = (product) => {
  try {
    const stored = localStorage.getItem('recentlyViewed');
    let recentlyViewed = stored ? JSON.parse(stored) : [];
    
    // Remove if already exists (to move to front)
    recentlyViewed = recentlyViewed.filter(item => item.id !== product.id);
    
    // Add to beginning of array
    recentlyViewed.unshift({
      id: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      image: getProductImage(product),
      viewedAt: Date.now()
    });
    
    // Keep only last 10 items
    recentlyViewed = recentlyViewed.slice(0, 10);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    
    // Dispatch custom event to notify RecentlyViewed component
    window.dispatchEvent(new CustomEvent('recentlyViewedUpdated'));
  } catch (error) {
    console.error('Error saving recently viewed:', error);
  }
};

const ProductCard = memo(({ product }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const { formatPrice } = useCurrency();
  const [isAdding, setIsAdding] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  
  // Предполагаем, что цены в product хранятся в KZT
  // Если они хранятся в другой валюте, нужно будет конвертировать
  const priceInKZT = product.priceInKZT || product.price || 0;
  const oldPriceInKZT = product.oldPriceInKZT || product.oldPrice || product.originalPrice || null;
  
  // Динамически рассчитываем скидку на основе цен
  const discount = oldPriceInKZT && oldPriceInKZT > priceInKZT 
    ? Math.round((1 - priceInKZT / oldPriceInKZT) * 100) 
    : 0;

  const handleAddToCart = useCallback((e) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product);
    
    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  }, [product, addToCart]);

  const handleToggleFavorite = useCallback((e) => {
    e.stopPropagation();
    setIsLiking(true);
    toggleFavorite(product);
    
    setTimeout(() => {
      setIsLiking(false);
    }, 400);
  }, [product, toggleFavorite]);

  const productIsFavorite = isFavorite(product.id);

  const handleCardClick = useCallback(() => {
    addToRecentlyViewed(product);
    navigate(`/product/${product.id}`);
  }, [product, navigate]);

  return (
    <div className="product-card" onClick={handleCardClick}>
      {/* Shine effect */}
      <div className="product-card__shine"></div>
      {/* Glow effect */}
      <div className="product-card__glow"></div>
      
      <div className="product-card__content">
        {/* Badges */}
        <div className="product-card__badges">
          {product.isNew && (
            <div className="product-card__badge">{t('product.new')}</div>
          )}
          {discount > 0 && (
            <div className="product-card__badge product-card__badge--discount">-{discount}%</div>
          )}
        </div>

        {/* Favorite button */}
        <button 
          className={`product-card__favorite ${productIsFavorite ? 'active' : ''} ${isLiking ? 'animating' : ''}`}
          onClick={handleToggleFavorite}
          title={productIsFavorite ? t('product.removeFromFavorites') : t('product.addToFavorites')}
        >
          <svg 
            width="18" 
            height="18" 
            viewBox="0 0 24 24" 
            fill={productIsFavorite ? "currentColor" : "none"} 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {isLiking && <span className="like-burst"></span>}
          {isLiking && productIsFavorite && (
            <span className="flying-heart">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#DA7B93" stroke="#DA7B93" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </span>
          )}
        </button>

        {/* Image */}
        <div className="product-card__image-wrapper">
          <img 
            src={getProductImage(product)} 
            alt={product.title}
            className="product-card__image"
          />
        </div>

        {/* Text content */}
        <div className="product-card__text">
          <p className="product-card__brand">{product.brand}</p>
          <p className="product-card__title">{product.title}</p>
          <div className="product-card__specs">
            <span>Ø {product.diameter}mm</span>
            <span className="spec-separator">•</span>
            <span>{product.movement}</span>
          </div>
        </div>

        {/* Details tags */}
        <div className="product-card__details">
          <span className="product-card__detail-tag">{product.dialColor}</span>
          <span className="product-card__detail-tag">{product.caseMaterial}</span>
        </div>

        {/* Footer */}
        <div className="product-card__footer">
          <div className="product-card__price-wrapper">
            {oldPriceInKZT && oldPriceInKZT > priceInKZT && (
              <span className="product-card__price-old">{formatPrice(oldPriceInKZT)}</span>
            )}
            <div className="product-card__price">{formatPrice(priceInKZT)}</div>
          </div>
          <button 
            className={`product-card__button ${isAdding ? 'adding' : ''}`}
            onClick={handleAddToCart}
          >
            {isAdding ? (
              <svg height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg height="16" width="16" viewBox="0 0 24 24">
                <path
                  strokeWidth="2"
                  stroke="currentColor"
                  d="M4 12H20M12 4V20"
                  fill="none"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
