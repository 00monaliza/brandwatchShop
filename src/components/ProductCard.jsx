import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { t } = useTranslation();
  const { addToCart, toggleFavorite, isFavorite } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    setIsAdding(true);
    addToCart(product);
    
    // Анимация сброса через 600ms
    setTimeout(() => {
      setIsAdding(false);
    }, 600);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    setIsLiking(true);
    toggleFavorite(product);
    
    setTimeout(() => {
      setIsLiking(false);
    }, 400);
  };

  const productIsFavorite = isFavorite(product.id);

  return (
    <div className="product-card">
      <div className="product-image-container">
        <img 
          src={product.image} 
          alt={product.title}
          className="product-image"
        />
        
        {/* Кнопка лайка */}
        <button 
          className={`product-favorite-btn ${productIsFavorite ? 'active' : ''} ${isLiking ? 'animating' : ''}`}
          onClick={handleToggleFavorite}
          title={productIsFavorite ? t('product.removeFromFavorites') : t('product.addToFavorites')}
        >
          <svg 
            width="22" 
            height="22" 
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#DA7B93" stroke="#DA7B93" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </span>
          )}
        </button>
        
        <div className="product-badges">
          {product.isNew && (
            <span className="badge badge-new">{t('product.new')}</span>
          )}
          {product.discount > 0 && (
            <span className="badge badge-discount">-{product.discount}%</span>
          )}
        </div>

        <button 
          className={`product-add-to-cart ${isAdding ? 'adding' : ''}`}
          onClick={handleAddToCart}
        >
          {isAdding ? (
            <>
              <svg className="cart-check-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {t('product.added')}
            </>
          ) : (
            <>
              <svg className="cart-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/>
                <circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {t('product.addToCart')}
            </>
          )}
        </button>
      </div>

      <div className="product-info">
        <div className="product-brand">
          {product.brand}
        </div>
        
        <h3 className="product-title">
          {product.title}
        </h3>

        <div className="product-specs">
          <span className="spec">Ø {product.diameter}mm</span>
          <span className="spec-separator">•</span>
          <span className="spec">{product.movement}</span>
        </div>

        <div className="product-price">
          {product.discount > 0 ? (
            <>
              <span className="price-old">${product.oldPrice}</span>
              <span className="price-new">${product.price}</span>
            </>
          ) : (
            <span className="price-new">${product.price}</span>
          )}
        </div>

        <div className="product-details">
          <span className="detail-item">{product.dialColor}</span>
          <span className="detail-item">{product.caseMaterial}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
