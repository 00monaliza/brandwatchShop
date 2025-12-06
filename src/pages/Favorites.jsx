import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import './Favorites.css';

const Favorites = () => {
  const { t } = useTranslation();
  const { favorites } = useCart();

  if (favorites.length === 0) {
    return (
      <div className="favorites-page">
        <div className="favorites-empty">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <h2>{t('favorites.empty')}</h2>
          <p>{t('favorites.emptyText')}</p>
          <Link to="/catalog" className="favorites-continue-btn">
            {t('favorites.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <div className="favorites-container">
        <div className="favorites-header">
          <h1>{t('favorites.title')}</h1>
          <span className="favorites-count">
            {favorites.length} {favorites.length === 1 ? t('favorites.item') : t('favorites.items')}
          </span>
        </div>

        <div className="favorites-grid">
          {favorites.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
