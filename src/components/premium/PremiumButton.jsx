import React from 'react';
import { motion } from 'framer-motion';
import './PremiumButton.css';

const PremiumButton = ({
  children,
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'medium', // small, medium, large
  icon = null,
  iconPosition = 'right',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick = () => {},
  className = '',
  ...props
}) => {

  const handleClick = (e) => {
    if (disabled || loading) return;
    
    // Ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const ripple = document.createElement('span');
    ripple.className = 'premium-btn__ripple';
    ripple.style.left = `${e.clientX - rect.left}px`;
    ripple.style.top = `${e.clientY - rect.top}px`;
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
    
    onClick(e);
  };

  return (
    <motion.button
      className={`
        premium-btn 
        premium-btn--${variant} 
        premium-btn--${size}
        ${fullWidth ? 'premium-btn--full' : ''}
        ${disabled ? 'premium-btn--disabled' : ''}
        ${loading ? 'premium-btn--loading' : ''}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading ? (
        <span className="premium-btn__spinner" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="premium-btn__icon premium-btn__icon--left">{icon}</span>
          )}
          <span className="premium-btn__text">{children}</span>
          {icon && iconPosition === 'right' && (
            <span className="premium-btn__icon premium-btn__icon--right">{icon}</span>
          )}
        </>
      )}
    </motion.button>
  );
};

export default PremiumButton;
