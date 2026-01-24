import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { useCurrency } from '../hooks/useCurrency';
import { sendTelegramNotification } from '../services/telegram';
import { showToast } from '../utils/toast';
import './CheckoutModal.css';

const CheckoutModal = ({ isOpen, onClose, onAuthRequired }) => {
  const { t } = useTranslation();
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
  const [cardData, setCardData] = useState({
    number: '',
    holder: '',
    expMonth: '',
    expYear: '',
    cvv: ''
  });
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(''); // 'kaspi' or 'card'
  const [errors, setErrors] = useState({});
  const [cardErrors, setCardErrors] = useState({});
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

  // Card input handlers
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : value;
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'number') {
      formattedValue = formatCardNumber(value);
      if (formattedValue.replace(/\s/g, '').length > 16) return;
    }
    if (name === 'cvv') {
      formattedValue = value.replace(/[^0-9]/g, '').slice(0, 4);
    }
    if (name === 'holder') {
      formattedValue = value.toUpperCase();
    }

    setCardData(prev => ({ ...prev, [name]: formattedValue }));
    
    if (cardErrors[name]) {
      setCardErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCvvFocus = () => setIsCardFlipped(true);
  const handleCvvBlur = () => setIsCardFlipped(false);

  const getMaskedCardNumber = () => {
    const num = cardData.number.replace(/\s/g, '');
    if (num.length < 8) return cardData.number || '•••• •••• •••• ••••';
    const first4 = num.slice(0, 4);
    const last4 = num.slice(-4);
    return `${first4} •••• •••• ${last4}`;
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

  const validateCard = () => {
    const newErrors = {};
    const cardNum = cardData.number.replace(/\s/g, '');

    if (!cardNum || cardNum.length < 16) {
      newErrors.number = 'Card number is required';
    }
    if (!cardData.holder.trim()) {
      newErrors.holder = 'Card holder is required';
    }
    if (!cardData.expMonth || !cardData.expYear) {
      newErrors.expiry = 'Expiration date is required';
    }
    if (!cardData.cvv || cardData.cvv.length < 3) {
      newErrors.cvv = 'CVV is required';
    }

    setCardErrors(newErrors);
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

    // Для карты валидируем данные, для Kaspi - нет
    if (paymentMethod === 'card' && !validateCard()) return;

    setIsSubmitting(true);

    try {
      // Формируем данные заказа
      const orderData = {
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
            price: priceInKZT, // Сохраняем цену в KZT
            priceInKZT: priceInKZT, // Явно указываем, что это KZT
            quantity: item.quantity,
            image: item.image
          };
        }),
        total: cartTotal, // Общая сумма в KZT
        totalInKZT: cartTotal, // Явно указываем, что это KZT
        comment: formData.comment,
        orderDate: new Date().toLocaleString('ru-RU'),
        paymentMethod: paymentMethod,
        cardLast4: paymentMethod === 'card' ? cardData.number.replace(/\s/g, '').slice(-4) : null,
        status: 'pending'
      };

      // Добавляем заказ в админ-панель
      addOrder(orderData);

      // Отправляем уведомление в Telegram
      await sendTelegramNotification(orderData);

      // Очищаем корзину (без уведомления, т.к. будет уведомление об оплате)
      clearCart(true);
      
      // Показываем уведомление об успешном заказе
      showToast.orderPaid();
      
      setIsSuccess(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      showToast.error('Произошла ошибка при оформлении заказа');
      clearCart(true);
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
                  <img src={item.image} alt={item.title} />
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
              /* Credit Card Payment */
              <>
                {/* Credit Card Visual */}
                <div className="credit-card-container">
                  <div className={`credit-card ${isCardFlipped ? 'flipped' : ''}`}>
                    <div className="card-front">
                      <div className="card-front-glow"></div>
                      <div className="card-chip">
                        <svg viewBox="0 0 50 40" width="40" height="30">
                          <rect x="0" y="0" width="50" height="40" rx="5" fill="#d4af37"/>
                          <rect x="5" y="5" width="40" height="6" rx="2" fill="#c9a227"/>
                          <rect x="5" y="15" width="40" height="6" rx="2" fill="#c9a227"/>
                          <rect x="5" y="25" width="40" height="6" rx="2" fill="#c9a227"/>
                        </svg>
                      </div>
                      <div className="card-type">
                        {/* Mastercard Logo */}
                        <svg viewBox="0 0 48 30" width="48" height="30">
                          <circle cx="15" cy="15" r="13" fill="#EB001B"/>
                          <circle cx="33" cy="15" r="13" fill="#F79E1B"/>
                          <path d="M24 5.5a13 13 0 0 0 0 19" fill="#FF5F00"/>
                        </svg>
                      </div>
                      <div className="card-label">CreditCard</div>
                      <div className="card-number">{getMaskedCardNumber()}</div>
                      <div className="card-info-row">
                        <div className="card-holder-info">
                          <span className="card-label-small">CARD HOLDER</span>
                          <span className="card-holder-name">{cardData.holder || 'YOUR NAME'}</span>
                        </div>
                        <div className="card-expiry-info">
                          <span className="card-label-small">EXPIRES</span>
                          <span className="card-expiry-value">
                            {cardData.expMonth || 'MM'}/{cardData.expYear?.slice(-2) || 'YY'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="card-back">
                      <div className="card-back-glow"></div>
                      <div className="card-stripe"></div>
                      <div className="card-cvv">
                        <span className="cvv-label">CVV</span>
                        <span className="cvv-value">{cardData.cvv || '•••'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Form */}
                <form onSubmit={handleSubmit} className="checkout-form card-form">
                  <div className="form-group">
                    <label htmlFor="card-number">{t('checkout.cardNumber')}</label>
                    <input
                      type="text"
                      id="card-number"
                      name="number"
                      value={cardData.number}
                      onChange={handleCardChange}
                      placeholder="1234 5678 9012 3456"
                      className={cardErrors.number ? 'error' : ''}
                      maxLength="19"
                    />
                    {cardErrors.number && <span className="error-message">{cardErrors.number}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="card-holder">{t('checkout.cardHolder')}</label>
                    <input
                      type="text"
                      id="card-holder"
                      name="holder"
                      value={cardData.holder}
                      onChange={handleCardChange}
                      placeholder="JOHN DOE"
                      className={cardErrors.holder ? 'error' : ''}
                    />
                    {cardErrors.holder && <span className="error-message">{cardErrors.holder}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group expiry-group">
                      <label>{t('checkout.expirationDate')}</label>
                      <div className="expiry-selects">
                        <select
                          name="expMonth"
                          value={cardData.expMonth}
                          onChange={handleCardChange}
                          className={cardErrors.expiry ? 'error' : ''}
                        >
                          <option value="">{t('checkout.month')}</option>
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = String(i + 1).padStart(2, '0');
                            return <option key={month} value={month}>{month}</option>;
                          })}
                        </select>
                        <select
                          name="expYear"
                          value={cardData.expYear}
                          onChange={handleCardChange}
                          className={cardErrors.expiry ? 'error' : ''}
                        >
                          <option value="">{t('checkout.year')}</option>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = String(new Date().getFullYear() + i);
                            return <option key={year} value={year}>{year}</option>;
                          })}
                        </select>
                      </div>
                      {cardErrors.expiry && <span className="error-message">{cardErrors.expiry}</span>}
                    </div>

                    <div className="form-group cvv-group">
                      <label htmlFor="card-cvv">CVV</label>
                      <input
                        type="text"
                        id="card-cvv"
                        name="cvv"
                        value={cardData.cvv}
                        onChange={handleCardChange}
                        onFocus={handleCvvFocus}
                        onBlur={handleCvvBlur}
                        placeholder="•••"
                        className={cardErrors.cvv ? 'error' : ''}
                        maxLength="4"
                      />
                      {cardErrors.cvv && <span className="error-message">{cardErrors.cvv}</span>}
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
                      type="submit" 
                      className="checkout-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <span className="loading-spinner"></span>
                      ) : (
                        `${t('checkout.pay')} ${formatPrice(cartTotal)}`
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
