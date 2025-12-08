import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import './PremiumProductCard.css';

const PremiumProductCard = ({ 
  product, 
  index = 0,
  onProductClick = () => {},
  onAddToCart = () => {}
}) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: "-50px" });

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 60,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8,
        delay: index * 0.15,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <motion.article
      ref={cardRef}
      className="premium-card"
      variants={cardVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      onClick={() => onProductClick(product)}
    >
      {/* Image Container */}
      <div className="premium-card__image-container">
        <motion.img
          src={product.image}
          alt={product.title}
          className="premium-card__image"
          loading="lazy"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 1.5, ease: [0.4, 0, 0.2, 1] }}
        />
        
        {/* Overlay */}
        <div className="premium-card__overlay">
          <div className="premium-card__overlay-content">
            <motion.button
              className="premium-card__quick-view"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onProductClick(product);
              }}
            >
              Подробнее
              <span className="premium-card__underline" />
            </motion.button>
          </div>
        </div>

        {/* Badges */}
        {product.isNew && (
          <span className="premium-card__badge premium-card__badge--new">
            Новинка
          </span>
        )}
        {product.discount > 0 && (
          <span className="premium-card__badge premium-card__badge--sale">
            -{product.discount}%
          </span>
        )}
      </div>

      {/* Content */}
      <div className="premium-card__content">
        <span className="premium-card__brand">{product.brand}</span>
        <h3 className="premium-card__title">{product.title}</h3>
        
        <div className="premium-card__specs">
          {product.mechanism && (
            <span className="premium-card__spec">{product.mechanism}</span>
          )}
          {product.case && (
            <>
              <span className="premium-card__spec-divider">•</span>
              <span className="premium-card__spec">{product.case}</span>
            </>
          )}
        </div>

        <div className="premium-card__footer">
          <div className="premium-card__price">
            {product.oldPrice && (
              <span className="premium-card__price-old">
                {product.oldPrice.toLocaleString()} ₸
              </span>
            )}
            <span className="premium-card__price-current">
              {product.price.toLocaleString()} ₸
            </span>
          </div>

          <motion.button
            className="premium-card__add-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
};

export default PremiumProductCard;
