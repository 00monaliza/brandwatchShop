import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from '../components/AuthModal';
import CheckoutModal from '../components/CheckoutModal';
import './Cart.css';

const Cart = () => {
  const { t } = useTranslation();
  const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setShowCheckoutModal(true);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    setShowCheckoutModal(true);
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          <h2>{t('cart.empty')}</h2>
          <p>{t('cart.emptyText')}</p>
          <Link to="/catalog" className="cart-continue-btn">
            {t('cart.continueShopping')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>{t('cart.title')}</h1>
          <button className="cart-clear-btn" onClick={clearCart}>
            {t('cart.clearAll')}
          </button>
        </div>

        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <img src={item.image} alt={item.title} />
                </div>
                
                <div className="cart-item-info">
                  <span className="cart-item-brand">{item.brand}</span>
                  <h3 className="cart-item-title">{item.title}</h3>
                  <div className="cart-item-specs">
                    <span>Ø {item.diameter}mm</span>
                    <span>•</span>
                    <span>{item.movement}</span>
                  </div>
                </div>

                <div className="cart-item-quantity">
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  >
                    −
                  </button>
                  <span className="quantity-value">{item.quantity}</span>
                  <button 
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    +
                  </button>
                </div>

                <div className="cart-item-price">
                  <span className="item-total">${(item.price * item.quantity).toLocaleString()}</span>
                  {item.quantity > 1 && (
                    <span className="item-unit-price">${item.price.toLocaleString()} / шт</span>
                  )}
                </div>

                <button 
                  className="cart-item-remove"
                  onClick={() => removeFromCart(item.id)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3>{t('cart.summary')}</h3>
            <div className="summary-row">
              <span>{t('cart.subtotal')}</span>
              <span>${cartTotal.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>{t('cart.shipping')}</span>
              <span>{t('cart.free')}</span>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row summary-total">
              <span>{t('cart.total')}</span>
              <span>${cartTotal.toLocaleString()}</span>
            </div>
            <button className="checkout-btn" onClick={handleCheckout}>
              {t('cart.checkout')}
            </button>
          </div>
        </div>
      </div>

      {/* Модальное окно авторизации */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Модальное окно оформления заказа */}
      <CheckoutModal 
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onAuthRequired={() => {
          setShowCheckoutModal(false);
          setShowAuthModal(true);
        }}
      />
    </div>
  );
};

export default Cart;
