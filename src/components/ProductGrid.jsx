import React, { memo } from 'react';
import { useTranslation } from 'react-i18next';
import ProductCard from './ProductCard';
import './ProductGrid.css';

const ProductGrid = memo(({ products }) => {
  const { t } = useTranslation();

  if (products.length === 0) {
    return (
      <div className="product-grid-empty">
        <div className="empty-state">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="30" stroke="#B79D9B" strokeWidth="2"/>
            <path d="M28 32H36M32 28V36" stroke="#B79D9B" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <h3>{t('catalog.noProducts')}</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <div 
          key={product.id} 
          className="product-card-wrapper"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
