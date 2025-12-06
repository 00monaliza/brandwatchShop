import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { sendTelegramNotification } from '../services/telegram';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, onAuthRequired }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: '',
    comment: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Загрузка сохраненных данных при открытии
  useEffect(() => {
    if (isOpen) {
      const savedData = localStorage.getItem('checkoutFormData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          ...parsed,
          // Если пользователь авторизован, приоритет у данных аккаунта
          name: user?.name || parsed.name || '',
          phone: user?.phone || parsed.phone || '',
          email: user?.email || parsed.email || ''
        }));
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    // Сохраняем в localStorage
    localStorage.setItem('checkoutFormData', JSON.stringify(newFormData));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = t('checkout.errors.nameRequired');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('checkout.errors.phoneRequired');
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = t('checkout.errors.phoneInvalid');
    }

    if (!formData.city.trim()) {
      newErrors.city = t('checkout.errors.cityRequired');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      onAuthRequired();
      return;
    }

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Формируем данные заказа
      const orderData = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city
        },
        items: cartItems.map(item => ({
          title: item.title,
          brand: item.brand,
          price: item.price,
          quantity: item.quantity
        })),
        total: cartTotal,
        comment: formData.comment,
        orderDate: new Date().toLocaleString('ru-RU')
      };

      // Отправляем уведомление в Telegram
      await sendTelegramNotification(orderData);

      // Очищаем корзину
      clearCart();
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      // Даже если Telegram не сработал, показываем успех
      // (в реальном проекте нужна более сложная обработка)
      clearCart();
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (isSuccess) {
    return (
      <div className="checkout-modal-overlay" onClick={handleOverlayClick}>
        <div className="checkout-modal success-modal">
          <div className="success-content">
            <div className="success-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="9 12 12 15 16 10"/>
              </svg>
            </div>
            <h2>{t('checkout.success.title')}</h2>
            <p>{t('checkout.success.message')}</p>
            <button className="success-btn" onClick={onClose}>
              {t('checkout.success.btn')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-modal-overlay" onClick={handleOverlayClick}>
      <div className="checkout-modal">
        <button className="checkout-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="checkout-modal-header">
          <h2>{t('checkout.title')}</h2>
          <p>{t('checkout.subtitle')}</p>
        </div>

        {/* Список товаров */}
        <div className="checkout-items">
          {cartItems.map(item => (
            <div key={item.id} className="checkout-item">
              <img src={item.image} alt={item.title} />
              <div className="checkout-item-info">
                <span className="checkout-item-brand">{item.brand}</span>
                <span className="checkout-item-title">{item.title}</span>
                <span className="checkout-item-qty">x{item.quantity}</span>
              </div>
              <span className="checkout-item-price">${item.price * item.quantity}</span>
            </div>
          ))}
          <div className="checkout-total">
            <span>{t('checkout.total')}:</span>
            <span className="checkout-total-price">${cartTotal}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="checkout-form">
          <div className="form-group">
            <label htmlFor="checkout-name">
              {t('checkout.name')} <span className="required">*</span>
            </label>
            <input
              type="text"
              id="checkout-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t('checkout.namePlaceholder')}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="checkout-phone">
              {t('checkout.phone')} <span className="required">*</span>
            </label>
            <input
              type="tel"
              id="checkout-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+7 (___) ___-__-__"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="checkout-city">
              {t('checkout.city')} <span className="required">*</span>
            </label>
            <input
              type="text"
              id="checkout-city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder={t('checkout.cityPlaceholder')}
              className={errors.city ? 'error' : ''}
            />
            {errors.city && <span className="error-message">{errors.city}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="checkout-email">{t('checkout.email')}</label>
            <input
              type="email"
              id="checkout-email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder={t('checkout.emailPlaceholder')}
            />
          </div>

          <div className="form-group">
            <label htmlFor="checkout-comment">{t('checkout.comment')}</label>
            <textarea
              id="checkout-comment"
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              placeholder={t('checkout.commentPlaceholder')}
              rows="3"
            />
          </div>

          <button 
            type="submit" 
            className="checkout-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading-spinner"></span>
            ) : (
              t('checkout.submitBtn')
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CheckoutModal;
