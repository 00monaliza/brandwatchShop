import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './RecentlyViewed.css';

const RecentlyViewed = () => {
  const { t } = useTranslation();
  const [recentProducts, setRecentProducts] = useState([]);

  // Load recently viewed from localStorage
  const loadRecentlyViewed = () => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecentProducts(parsed.slice(0, 6)); // Show max 6 items
      }
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    }
  };

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
  }, []);

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
                  ${product.price.toLocaleString()}
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
