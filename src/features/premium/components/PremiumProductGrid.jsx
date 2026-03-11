import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import PremiumProductCard from './PremiumProductCard';
import './PremiumProductGrid.css';

const PremiumProductGrid = ({ 
  products = [], 
  columns = 4,
  onProductClick = () => {},
  onAddToCart = () => {}
}) => {
  const gridRef = useRef(null);
  const isInView = useInView(gridRef, { once: true, margin: "-50px" });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  return (
    <motion.div
      ref={gridRef}
      className={`premium-grid premium-grid--cols-${columns}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {products.map((product, index) => (
        <PremiumProductCard
          key={product.id}
          product={product}
          index={index}
          onProductClick={onProductClick}
          onAddToCart={onAddToCart}
        />
      ))}
    </motion.div>
  );
};

export default PremiumProductGrid;
