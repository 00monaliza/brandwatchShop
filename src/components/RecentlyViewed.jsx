import React, { useState, useEffect, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { getProductImage } from '../utils/productImage';
import { useCurrency } from '../hooks/useCurrency';
import './RecentlyViewed.css';

const RecentlyViewed = memo(() => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [recentProducts, setRecentProducts] = useState([]);

  // Load recently viewed from localStorage
  const loadRecentlyViewed = useCallback(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentProducts(parsed.slice(0, 6)); // Show max 6 items
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  }, []);

  useEffect(() => {
    // Load on mount
    loadRecentlyViewed();

    // Listen for updates from ProductCard
    const handleUpdate = () => {
      loadRecentlyViewed();
    };

    window.addEventListener('recentlyViewedUpdated', handleUpdate);
    
    // Also listen for storage changes (for multi-tab support)
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('recentlyViewedUpdated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadRecentlyViewed]);

  if (recentProducts.length === 0) return null;

  return (
    <div className="recently-viewed">
      <div className="recently-viewed-container">
        <h2 className="recently-viewed-title">{t('footer.recentlyViewed')}</h2>
        <div className="recently-viewed-grid">
          {recentProducts.map(product => (
            <div key={product.id} className="recent-card">
              <div className="recent-card-image">
                <img src={getProductImage(product)} alt={product.title} />
              </div>
              <div className="recent-card-info">
                <h3 className="recent-card-brand">{product.brand} {product.title}</h3>
                <div className="recent-card-price">
                  {formatPrice(product.priceInKZT || product.price || 0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

RecentlyViewed.displayName = 'RecentlyViewed';

export default RecentlyViewed;
