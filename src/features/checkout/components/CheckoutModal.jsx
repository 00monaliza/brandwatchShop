import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { useCart } from '../../cart/context/CartContext';
import { useAdmin } from '../../admin/context/AdminContext';
import { useCurrency } from '../../../shared/hooks/useCurrency';
import { sendTelegramNotification } from '../../../services/telegram';
import { showToast } from '../../../shared/utils/toast';
import { getProductImage } from '../../../shared/utils/productImage';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, onAuthRequired }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { addOrder } = useAdmin();
  const { formatPrice } = useCurrency();
  const [step, setStep] = useState(1); // 1 - info, 2 - payment
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    city: '',
    comment: ''
  });
  const [paymentMethod, setPaymentMethod] = useState(''); // 'kaspi' or 'card'
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState(null);
  const idempotencyKeyRef = useRef(null);

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

  const handleNextStep = (e) => {
    e.preventDefault();

    if (!user) {
      onAuthRequired();
      return;
    }

    if (!validate()) return;
    setStep(2);
  };

  const handleBackStep = () => {
    setStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      onAuthRequired();
      return;
    }

    // Генерируем idempotency key для защиты от двойной отправки
    const key = `${user.id}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    if (idempotencyKeyRef.current === key) return;
    idempotencyKeyRef.current = key;

    setIsSubmitting(true);

    try {
      // Формируем данные заказа
      const orderData = {
        userId: user?.id ?? null,
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          address: formData.city
        },
        items: cartItems.map(item => {
          const priceInKZT = item.priceInKZT || item.price || 0;
          return {
            id: item.id,
            title: item.title,
            brand: item.brand,
            price: priceInKZT,
            priceInKZT: priceInKZT,
            quantity: item.quantity,
            image: getProductImage(item)
          };
        }),
        total: cartTotal,
        totalInKZT: cartTotal,
        comment: formData.comment,
        orderDate: new Date().toLocaleString('ru-RU'),
        paymentMethod: paymentMethod,
        cardLast4: null,
        status: 'pending'
      };

      // Сохраняем заказ в Supabase и уменьшаем сток
      const createdOrder = await addOrder(orderData);

      // Сохраняем id созданного заказа
      if (createdOrder?.id) {
        setCreatedOrderId(createdOrder.id);
      }

      // Отправляем уведомление в Telegram с символом валюты
      await sendTelegramNotification(orderData, '₸');

      clearCart(true);
      showToast.orderPaid();
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      showToast.error('Произошла ошибка при оформлении заказа');
      setIsSuccess(false);
      // Сбрасываем ключ чтобы можно было попробовать снова
      idempotencyKeyRef.current = null;
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
            <p className="success-order-info">
              Следите за статусом заказа в личном кабинете
            </p>
            <div className="success-buttons">
              {createdOrderId && (
                <button
                  className="track-order-btn"
                  onClick={() => {
                    onClose();
                    navigate(`/orders/${createdOrderId}`);
                  }}
                >
                  Отследить заказ
                </button>
              )}
              <button className="success-btn" onClick={onClose}>
                {t('checkout.success.btn')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={t('checkout.title')}>
      <div className="checkout-modal">
        <button className="checkout-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        {/* Step Indicator */}
        <div className="checkout-steps">
          <div className={`checkout-step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">{t('checkout.stepInfo')}</span>
          </div>
          <div className="step-line"></div>
          <div className={`checkout-step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">{t('checkout.stepPayment')}</span>
          </div>
        </div>

        <div className="checkout-modal-header">
          <h2>{step === 1 ? t('checkout.title') : t('checkout.paymentTitle')}</h2>
          <p>{step === 1 ? t('checkout.subtitle') : t('checkout.paymentSubtitle')}</p>
        </div>

        {step === 1 ? (
          <>
            {/* Список товаров */}
            <div className="checkout-items">
              {cartItems.map(item => (
                <div key={item.id} className="checkout-item">
                  <img src={getProductImage(item)} alt={item.title} />
                  <div className="checkout-item-info">
                    <span className="checkout-item-brand">{item.brand}</span>
                    <span className="checkout-item-title">{item.title}</span>
                    <span className="checkout-item-qty">x{item.quantity}</span>
                  </div>
                  <span className="checkout-item-price">
                    {(() => {
                      const priceInKZT = item.priceInKZT || item.price || 0;
                      return formatPrice(priceInKZT * item.quantity);
                    })()}
                  </span>
                </div>
              ))}
              <div className="checkout-total">
                <span>{t('checkout.total')}:</span>
                <span className="checkout-total-price">{formatPrice(cartTotal)}</span>
              </div>
            </div>

            <form onSubmit={handleNextStep} className="checkout-form">
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
              >
                {t('checkout.nextStep')}
              </button>
            </form>
          </>
        ) : (
          <>
            {/* Payment Method Selection */}
            {!paymentMethod ? (
              <div className="payment-method-selection">
                <p className="payment-method-label">{t('checkout.selectPaymentMethod')}</p>
                <div className="payment-methods">
                  <button 
                    type="button"
                    className="payment-method-btn kaspi-btn"
                    onClick={() => setPaymentMethod('kaspi')}
                  >
                    <div className="payment-method-icon kaspi-icon">
                      <img src="/images/qr.jpg" alt="Kaspi QR" />
                    </div>
                    <div className="payment-method-info">
                      <span className="payment-method-name">Kaspi QR</span>
                      <span className="payment-method-desc">{t('checkout.kaspiDesc')}</span>
                    </div>
                  </button>

                  <button 
                    type="button"
                    className="payment-method-btn card-btn"
                    onClick={() => setPaymentMethod('card')}
                  >
                    <div className="payment-method-icon card-icon">
                      <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="5" width="20" height="14" rx="2"/>
                        <line x1="2" y1="10" x2="22" y2="10"/>
                        <line x1="6" y1="15" x2="10" y2="15"/>
                      </svg>
                    </div>
                    <div className="payment-method-info">
                      <span className="payment-method-name">{t('checkout.cardPayment')}</span>
                      <span className="payment-method-desc">{t('checkout.cardDesc')}</span>
                    </div>
                  </button>
                </div>

                <button 
                  type="button" 
                  className="checkout-back-btn full-width"
                  onClick={handleBackStep}
                >
                  {t('checkout.back')}
                </button>
              </div>
            ) : paymentMethod === 'kaspi' ? (
              /* Kaspi QR Payment */
              <div className="kaspi-payment">
                <div className="kaspi-qr-container">
                  <img src="/images/qr.jpg" alt="Kaspi QR" className="kaspi-qr-image" />
                </div>
                <div className="kaspi-instructions">
                  <h3>{t('checkout.kaspiInstructions')}</h3>
                  <ol>
                    <li>{t('checkout.kaspiStep1')}</li>
                    <li>{t('checkout.kaspiStep2')}</li>
                    <li>{t('checkout.kaspiStep3')}</li>
                  </ol>
                  <div className="kaspi-amount">
                    <span>{t('checkout.amountToPay')}:</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>
                </div>

                <div className="card-form-buttons">
                  <button 
                    type="button" 
                    className="checkout-back-btn"
                    onClick={() => setPaymentMethod('')}
                  >
                    {t('checkout.back')}
                  </button>
                  <button 
                    type="button" 
                    className="checkout-submit-btn"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      t('checkout.confirmPayment')
                    )}
                  </button>
                </div>
              </div>
            ) : (
              /* Card payment — no card data collected on client (PCI DSS) */
              <div className="kaspi-payment">
                <div className="kaspi-instructions">
                  <h3>{t('checkout.cardPaymentInfo') || 'Оплата картой'}</h3>
                  <p>{t('checkout.cardPaymentDesc') || 'Наш менеджер свяжется с вами для безопасной оплаты через платёжный терминал.'}</p>
                  <div className="kaspi-amount">
                    <span>{t('checkout.amountToPay')}:</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>
                </div>

                <div className="card-form-buttons">
                  <button
                    type="button"
                    className="checkout-back-btn"
                    onClick={() => setPaymentMethod('')}
                  >
                    {t('checkout.back')}
                  </button>
                  <button
                    type="button"
                    className="checkout-submit-btn"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                  >
                    {isSubmitting ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      `${t('checkout.pay')} ${formatPrice(cartTotal)}`
                    )}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
