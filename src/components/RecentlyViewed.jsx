import React from 'react';
import { useTranslation } from 'react-i18next';
import { products } from '../data/products';
import './RecentlyViewed.css';

const RecentlyViewed = () => {
  const { t } = useTranslation();
  // For demo purposes, we'll just show the first 2 products
  // In a real app, this would come from localStorage or context
  const recentProducts = products.slice(0, 2);

  if (recentProducts.length === 0) return null;

  return (
    <div className="recently-viewed">
      <div className="recently-viewed-container">
        <h2 className="recently-viewed-title">{t('footer.recentlyViewed')}</h2>
        <div className="recently-viewed-grid">
          {recentProducts.map(product => (
            <div key={product.id} className="recent-card">
              <div className="recent-card-image">
                <img src={product.image} alt={product.title} />
              </div>
              <div className="recent-card-info">
                <h3 className="recent-card-brand">{product.brand} {product.title}</h3>
                <div className="recent-card-price">
                  {product.price.toLocaleString()} ₸
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecentlyViewed;
