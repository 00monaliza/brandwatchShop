import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const countries = [
  { code: 'KZ', name: 'Kazakhstan', dial_code: '+7', flag: '🇰🇿', format: '+7 (___) ___-__-__' },
  { code: 'RU', name: 'Russia', dial_code: '+7', flag: '🇷🇺', format: '+7 (___) ___-__-__' },
  { code: 'US', name: 'USA', dial_code: '+1', flag: '🇺🇸', format: '+1 (___) ___-____' },
  { code: 'UZ', name: 'Uzbekistan', dial_code: '+998', flag: '🇺🇿', format: '+998 (__) ___-__-__' },
  { code: 'KG', name: 'Kyrgyzstan', dial_code: '+996', flag: '🇰🇬', format: '+996 (__) ___-__-__' },
  { code: 'TR', name: 'Turkey', dial_code: '+90', flag: '🇹🇷', format: '+90 (___) ___-__-__' },
  { code: 'CN', name: 'China', dial_code: '+86', flag: '🇨🇳', format: '+86 (___) ____-____' },
  { code: 'DE', name: 'Germany', dial_code: '+49', flag: '🇩🇪', format: '+49 (___) ___-____' },
  { code: 'GB', name: 'UK', dial_code: '+44', flag: '🇬🇧', format: '+44 (____) ______' },
];

const AuthModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { login, register } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Закрытие дропдауна при клике вне
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Сброс формы при переключении режимов
  useEffect(() => {
    setFormData({ name: '', email: '', phone: selectedCountry.dial_code, password: '' });
    setErrors({});
    setServerError('');
  }, [isLoginMode, selectedCountry.dial_code]);

  if (!isOpen) return null;

  const validatePhone = (phone) => {
    const phoneRegex = /^[+]?[0-9]{10,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setFormData(prev => ({ ...prev, phone: country.dial_code }));
    setShowCountryDropdown(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone') {
      // Автоматическое определение страны по коду
      const cleanValue = value.replace(/[\s\-()]/g, '');
      
      // Пытаемся найти страну по введенному коду
      // Сортируем по длине кода (от длинных к коротким), чтобы +998 не путался с +9
      const matchedCountry = countries
        .sort((a, b) => b.dial_code.length - a.dial_code.length)
        .find(c => cleanValue.startsWith(c.dial_code));

      if (matchedCountry && matchedCountry.code !== selectedCountry.code) {
        // Особая логика для +7 (KZ vs RU)
        if (matchedCountry.dial_code === '+7') {
           // Если второй символ 7, то это KZ, иначе RU (по умолчанию KZ, если просто +7)
           if (cleanValue.length > 2 && cleanValue[2] !== '7') {
             const ru = countries.find(c => c.code === 'RU');
             if (ru && selectedCountry.code !== 'RU') setSelectedCountry(ru);
           } else {
             const kz = countries.find(c => c.code === 'KZ');
             if (kz && selectedCountry.code !== 'KZ') setSelectedCountry(kz);
           }
        } else {
          setSelectedCountry(matchedCountry);
        }
      }
    }

    setFormData(prev => ({ ...prev, [name]: value }));
    setServerError('');
    
    // Очистка ошибки при изменении
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!isLoginMode && !formData.name.trim()) {
      newErrors.name = t('auth.errors.nameRequired');
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('auth.errors.phoneRequired');
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = t('auth.errors.phoneInvalid');
    }

    if (!isLoginMode && formData.email && !validateEmail(formData.email)) {
      newErrors.email = t('auth.errors.emailInvalid');
    }

    if (!formData.password.trim()) {
      newErrors.password = t('auth.errors.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.errors.passwordShort');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);
    setServerError('');

    try {
      if (isLoginMode) {
        // Авторизация (теперь асинхронная)
        const result = await login(formData.phone, formData.password);
        
        if (result.success) {
          setIsSubmitting(false);
          if (onSuccess) {
            onSuccess(result.user);
          }
          onClose();
        } else {
          setIsSubmitting(false);
          if (result.error === 'userNotFound') {
            setServerError(t('auth.errors.userNotFound'));
          } else if (result.error === 'wrongPassword') {
            setServerError(t('auth.errors.wrongPassword'));
          } else if (result.error === 'emailNotConfirmed') {
            setServerError(t('auth.errors.emailNotConfirmed') || 'Подтвердите email для входа');
          } else {
            setServerError(result.error || t('auth.errors.unknown'));
          }
        }
      } else {
        // Регистрация (теперь асинхронная)
        const result = await register({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password
        });

        if (result.success) {
          setIsSubmitting(false);
          if (onSuccess) {
            onSuccess(result.user);
          }
          onClose();
        } else {
          setIsSubmitting(false);
          if (result.error === 'phoneExists') {
            setServerError(t('auth.errors.phoneExists'));
          } else if (result.error === 'emailExists') {
            setServerError(t('auth.errors.emailExists'));
          } else if (result.error === 'invalidEmail') {
            setServerError(t('auth.errors.emailInvalid'));
          } else {
            setServerError(result.error || t('auth.errors.unknown'));
          }
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setServerError(err.message || t('auth.errors.unknown'));
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal">
        <button className="auth-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="auth-modal-header">
          <h2>{isLoginMode ? t('auth.login') : t('auth.register')}</h2>
          <p>{isLoginMode ? t('auth.loginSubtitle') : t('auth.registerSubtitle')}</p>
        </div>

        {serverError && (
          <div className="server-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="name">
                {t('auth.name')} <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder={t('auth.namePlaceholder')}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="phone">
              {t('auth.phone')} <span className="required">*</span>
            </label>
            <div className="phone-input-container" ref={dropdownRef}>
              <div 
                className="country-selector" 
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
              >
                <span className="country-flag">{selectedCountry.flag}</span>
                <span className="dropdown-arrow">▼</span>
              </div>
              
              {showCountryDropdown && (
                <div className="country-dropdown">
                  {countries.map(country => (
                    <div 
                      key={country.code} 
                      className={`country-option ${selectedCountry.code === country.code ? 'selected' : ''}`}
                      onClick={() => handleCountrySelect(country)}
                    >
                      <span className="country-flag">{country.flag}</span>
                      <span className="country-name">{country.name}</span>
                      <span className="country-code">{country.dial_code}</span>
                    </div>
                  ))}
                </div>
              )}

              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder={selectedCountry.format}
                className={`phone-input ${errors.phone ? 'error' : ''}`}
              />
            </div>
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          {!isLoginMode && (
            <div className="form-group">
              <label htmlFor="email">{t('auth.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('auth.emailPlaceholder')}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">
              {t('auth.password')} <span className="required">*</span>
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('auth.passwordPlaceholder')}
              className={errors.password ? 'error' : ''}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading-spinner"></span>
            ) : (
              isLoginMode ? t('auth.loginBtn') : t('auth.registerBtn')
            )}
          </button>
        </form>

        <div className="auth-switch">
          {isLoginMode ? (
            <p>
              {t('auth.noAccount')}{' '}
              <button type="button" onClick={switchMode}>
                {t('auth.registerLink')}
              </button>
            </p>
          ) : (
            <p>
              {t('auth.hasAccount')}{' '}
              <button type="button" onClick={switchMode}>
                {t('auth.loginLink')}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
