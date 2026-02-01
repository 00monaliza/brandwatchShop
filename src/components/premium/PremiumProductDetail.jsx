import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCurrency } from '../../hooks/useCurrency';
import PremiumImageGallery from './PremiumImageGallery';
import PremiumButton from './PremiumButton';
import PremiumSection from './PremiumSection';
import PremiumSlider from './PremiumSlider';
import './PremiumProductDetail.css';

const PremiumProductDetail = ({
  product = null,
  relatedProducts = [],
  onAddToCart,
  onAddToFavorites,
  isFavorite = false
}) => {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Simulated product data for demo
  const demoProduct = product || {
    id: 1,
    name: 'Seamaster Aqua Terra',
    brand: 'OMEGA',
    price: 5500000,
    oldPrice: 6200000,
    images: [
      '/images/watch-1.jpg',
      '/images/watch-1-2.jpg',
      '/images/watch-1-3.jpg',
      '/images/watch-1-4.jpg'
    ],
    description: 'Элегантные часы Seamaster Aqua Terra воплощают морское наследие OMEGA. Модель оснащена мастер-хронометром калибра 8900, который обеспечивает превосходную точность и устойчивость к магнитным полям.',
    specifications: {
      'Механизм': 'Автоматический, Калибр 8900',
      'Корпус': 'Нержавеющая сталь 316L',
      'Диаметр': '41 мм',
      'Водозащита': '150 метров',
      'Стекло': 'Сапфировое с антибликовым покрытием',
      'Браслет': 'Нержавеющая сталь',
      'Запас хода': '60 часов'
    },
    variants: [
      { id: 1, name: 'Синий циферблат', color: '#1a3a5c' },
      { id: 2, name: 'Черный циферблат', color: '#1a1a1a' },
      { id: 3, name: 'Серебристый циферблат', color: '#c0c0c0' }
    ],
    inStock: true,
    isNew: true
  };

  useEffect(() => {
    if (demoProduct.variants?.length > 0 && !selectedVariant) {
      setSelectedVariant(demoProduct.variants[0]);
    }
  }, [demoProduct.variants, selectedVariant]);

  const { formatPrice } = useCurrency();

  const tabs = [
    { id: 'description', label: 'Описание' },
    { id: 'specs', label: 'Характеристики' },
    { id: 'delivery', label: 'Доставка' }
  ];

  return (
    <div className="premium-product-detail">
      <div className="premium-product-detail__container">
        {/* Gallery */}
        <motion.div 
          className="premium-product-detail__gallery"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <PremiumImageGallery 
            images={demoProduct.images}
            productTitle={demoProduct.name}
          />
        </motion.div>

        {/* Info */}
        <motion.div 
          className="premium-product-detail__info"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Badges */}
          <div className="premium-product-detail__badges">
            {demoProduct.isNew && <span className="badge badge--new">Новинка</span>}
            {demoProduct.oldPrice && <span className="badge badge--sale">Скидка</span>}
          </div>

          {/* Brand & Title */}
          <p className="premium-product-detail__brand">{demoProduct.brand}</p>
          <h1 className="premium-product-detail__title">{demoProduct.name}</h1>

          {/* Price */}
          <div className="premium-product-detail__price">
            <span className="premium-product-detail__current-price">
              {formatPrice(demoProduct.price)}
            </span>
            {demoProduct.oldPrice && (
              <span className="premium-product-detail__old-price">
                {formatPrice(demoProduct.oldPrice)}
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="premium-product-detail__short-desc">
            {demoProduct.description}
          </p>

          {/* Variants */}
          {demoProduct.variants?.length > 0 && (
            <div className="premium-product-detail__variants">
              <p className="premium-product-detail__variant-label">
                Вариант: <strong>{selectedVariant?.name}</strong>
              </p>
              <div className="premium-product-detail__variant-options">
                {demoProduct.variants.map((variant) => (
                  <button
                    key={variant.id}
                    className={`premium-product-detail__variant ${selectedVariant?.id === variant.id ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(variant)}
                    style={{ '--variant-color': variant.color }}
                  >
                    <span 
                      className="premium-product-detail__variant-swatch"
                      style={{ background: variant.color }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="premium-product-detail__quantity">
            <span className="premium-product-detail__quantity-label">Количество:</span>
            <div className="premium-product-detail__quantity-controls">
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                −
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
          </div>

          {/* Actions */}
          <div className="premium-product-detail__actions">
            <PremiumButton
              variant="primary"
              size="large"
              fullWidth
              onClick={() => onAddToCart?.(demoProduct, quantity, selectedVariant)}
              disabled={!demoProduct.inStock}
            >
              {demoProduct.inStock ? 'Добавить в корзину' : 'Нет в наличии'}
            </PremiumButton>

            <motion.button
              className={`premium-product-detail__favorite ${isFavorite ? 'active' : ''}`}
              onClick={() => onAddToFavorites?.(demoProduct)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="24" height="22" viewBox="0 0 24 22" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                <path d="M12 21L2.5 11.5C0.5 9.5 0.5 6 2.5 4C4.5 2 8 2 10 4L12 6L14 4C16 2 19.5 2 21.5 4C23.5 6 23.5 9.5 21.5 11.5L12 21Z"/>
              </svg>
            </motion.button>
          </div>

          {/* Stock Status */}
          <div className="premium-product-detail__stock">
            <span className={`stock-indicator ${demoProduct.inStock ? 'in-stock' : 'out-of-stock'}`}>
              {demoProduct.inStock ? '✓ В наличии' : '✕ Нет в наличии'}
            </span>
          </div>

          {/* Features */}
          <div className="premium-product-detail__features">
            <div className="feature">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M2 10h20"/>
              </svg>
              <span>Безопасная оплата</span>
            </div>
            <div className="feature">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M5 12l5 5L20 7"/>
              </svg>
              <span>Гарантия 2 года</span>
            </div>
            <div className="feature">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
              <span>Доставка</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="premium-product-detail__tabs-section">
        <div className="premium-product-detail__tabs-container">
          <div className="premium-product-detail__tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`premium-product-detail__tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <motion.div 
            className="premium-product-detail__tab-content"
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'description' && (
              <div className="tab-description">
                <p>{demoProduct.description}</p>
                <p>
                  Модель представляет собой идеальное сочетание элегантности и функциональности,
                  подходящее как для официальных мероприятий, так и для повседневной носки.
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="tab-specs">
                <table>
                  <tbody>
                    {Object.entries(demoProduct.specifications || {}).map(([key, value]) => (
                      <tr key={key}>
                        <td>{key}</td>
                        <td>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="tab-delivery">
                <h4>Доставка по Казахстану</h4>
                <p>Доставка по всем городам Казахстана. Срок доставки 2-5 рабочих дней.</p>
                <h4>Международная доставка</h4>
                <p>Доставка в страны СНГ осуществляется в течение 5-10 рабочих дней.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <PremiumSection
          title="Вам также может понравиться"
          variant="dark"
        >
          <PremiumSlider items={relatedProducts} />
        </PremiumSection>
      )}
    </div>
  );
};

export default PremiumProductDetail;
