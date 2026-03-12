import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../../../shared/utils/toast';
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
  const { login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot'
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    loginIdentifier: '', // для входа по телефону или email
    resetEmail: '' // для восстановления пароля
  });
  const [resetSent, setResetSent] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const modalRef = useRef(null);

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Блокировка прокрутки body при открытии модалки
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

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
    setFormData({ 
      name: '', 
      email: '', 
      phone: selectedCountry.dial_code, 
      password: '',
      loginIdentifier: '',
      resetEmail: ''
    });
    setErrors({});
    setServerError('');
    setResetSent(false);
    // Прокрутка модалки наверх при смене режима
    if (modalRef.current) {
      modalRef.current.scrollTop = 0;
    }
  }, [mode, selectedCountry.dial_code]);

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
    
    if (name === 'phone' || name === 'loginIdentifier') {
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

    if (mode === 'forgot') {
      // При восстановлении пароля проверяем только email
      if (!formData.resetEmail.trim()) {
        newErrors.resetEmail = t('auth.errors.emailRequired') || 'Введите email';
      } else if (!validateEmail(formData.resetEmail)) {
        newErrors.resetEmail = t('auth.errors.emailInvalid');
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    }

    if (mode === 'register' && !formData.name.trim()) {
      newErrors.name = t('auth.errors.nameRequired');
    }

    if (mode === 'login') {
      // При логине проверяем loginIdentifier (телефон или email)
      if (!formData.loginIdentifier.trim()) {
        newErrors.loginIdentifier = t('auth.errors.phoneOrEmailRequired') || 'Введите телефон или email';
      }
    } else if (mode === 'register') {
      // При регистрации проверяем телефон
      if (!formData.phone.trim()) {
        newErrors.phone = t('auth.errors.phoneRequired');
      } else if (!validatePhone(formData.phone)) {
        newErrors.phone = t('auth.errors.phoneInvalid');
      }

      if (formData.email && !validateEmail(formData.email)) {
        newErrors.email = t('auth.errors.emailInvalid');
      }
    }

    if (mode !== 'forgot') {
      if (!formData.password.trim()) {
        newErrors.password = t('auth.errors.passwordRequired');
      } else if (formData.password.length < 6) {
        newErrors.password = t('auth.errors.passwordShort');
      }
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
      // Режим восстановления пароля
      if (mode === 'forgot') {
        const result = await resetPassword(formData.resetEmail);
        setIsSubmitting(false);
        
        if (result.success) {
          setResetSent(true);
          showToast.success(
            t('auth.resetPasswordSent') || 'Письмо отправлено',
            t('auth.resetPasswordSentDesc') || 'Проверьте почту для сброса пароля'
          );
        } else {
          setServerError(result.error || t('auth.errors.unknown'));
          showToast.error(result.error || 'Ошибка отправки');
        }
        return;
      }

      if (mode === 'login') {
        // Авторизация по телефону или email
        const result = await login(formData.loginIdentifier, formData.password);
        
        if (result.success) {
          setIsSubmitting(false);
          showToast.loginSuccess(result.user?.name || result.user?.email);
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
          showToast.error('Ошибка входа');
        }
      } else if (mode === 'register') {
        // Регистрация (теперь асинхронная)
        const result = await register({
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          password: formData.password
        });

        if (result.success) {
          setIsSubmitting(false);
          showToast.registrationSuccess();
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
          showToast.error('Ошибка регистрации');
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setServerError(err.message || t('auth.errors.unknown'));
      showToast.error(err.message);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const switchMode = (newMode) => {
    if (typeof newMode === 'string') {
      setMode(newMode);
    } else {
      setMode(mode === 'login' ? 'register' : 'login');
    }
  };

  return createPortal(
    <div className="auth-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label={mode === 'login' ? 'Авторизация' : 'Регистрация'}>
      <div className="auth-modal" ref={modalRef}>
        <button className="auth-modal-close" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div className="auth-modal-header">
          <h2>
            {mode === 'login' && t('auth.login')}
            {mode === 'register' && t('auth.register')}
            {mode === 'forgot' && (t('auth.forgotPassword') || 'Восстановление пароля')}
          </h2>
          <p>
            {mode === 'login' && t('auth.loginSubtitle')}
            {mode === 'register' && t('auth.registerSubtitle')}
            {mode === 'forgot' && (t('auth.forgotPasswordSubtitle') || 'Введите email для получения ссылки на сброс пароля')}
          </p>
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
          {/* Режим восстановления пароля */}
          {mode === 'forgot' && (
            <>
              {resetSent ? (
                <div className="reset-sent-message">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <h3>{t('auth.resetPasswordSent') || 'Письмо отправлено!'}</h3>
                  <p>{t('auth.checkEmailDesc') || 'Проверьте вашу почту и перейдите по ссылке для сброса пароля.'}</p>
                  <button 
                    type="button" 
                    className="auth-submit-btn"
                    onClick={() => switchMode('login')}
                  >
                    {t('auth.backToLogin') || 'Вернуться к входу'}
                  </button>
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="resetEmail">
                    {t('auth.email')} <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    id="resetEmail"
                    name="resetEmail"
                    value={formData.resetEmail}
                    onChange={handleChange}
                    placeholder={t('auth.emailPlaceholder')}
                    className={errors.resetEmail ? 'error' : ''}
                  />
                  {errors.resetEmail && <span className="error-message">{errors.resetEmail}</span>}
                </div>
              )}
            </>
          )}

          {mode === 'register' && (
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

          {/* При логине - одно поле для телефона или email */}
          {mode === 'login' && (
            <div className="form-group">
              <label htmlFor="loginIdentifier">
                {t('auth.phoneOrEmail') || 'Телефон или Email'} <span className="required">*</span>
              </label>
              <div className="login-identifier-wrapper">
                {formData.loginIdentifier.startsWith('+') && (
                  <span className="login-country-flag">{selectedCountry.flag}</span>
                )}
                <input
                  type="text"
                  id="loginIdentifier"
                  name="loginIdentifier"
                  value={formData.loginIdentifier}
                  onChange={handleChange}
                  placeholder={t('auth.phoneOrEmailPlaceholder') || '+7... или email@example.com'}
                  className={`${errors.loginIdentifier ? 'error' : ''} ${formData.loginIdentifier.startsWith('+') ? 'with-flag' : ''}`}
                  autoComplete="username"
                />
              </div>
              {errors.loginIdentifier && <span className="error-message">{errors.loginIdentifier}</span>}
            </div>
          )}

          {mode === 'register' && (
            /* При регистрации - поле телефона с выбором страны */
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

              {/* Email поле при регистрации */}
              <div className="form-group" style={{ marginTop: '16px' }}>
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
            </div>
          )}

          {/* Поле пароля - только для логина и регистрации */}
          {mode !== 'forgot' && (
            <div className="form-group">
              <label htmlFor="password">
                {t('auth.password')} <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('auth.passwordPlaceholder')}
                  className={errors.password ? 'error' : ''}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>
          )}

          {/* Ссылка "Забыл пароль" при логине */}
          {mode === 'login' && (
            <div className="forgot-password-link">
              <button type="button" onClick={() => switchMode('forgot')}>
                {t('auth.forgotPasswordLink') || 'Забыли пароль?'}
              </button>
            </div>
          )}

          {/* Кнопка отправки - скрываем если письмо уже отправлено */}
          {!(mode === 'forgot' && resetSent) && (
            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading-spinner"></span>
              ) : (
                <>
                  {mode === 'login' && t('auth.loginBtn')}
                  {mode === 'register' && t('auth.registerBtn')}
                  {mode === 'forgot' && (t('auth.sendResetLink') || 'Отправить ссылку')}
                </>
              )}
            </button>
          )}
        </form>

        <div className="auth-switch">
          {mode === 'login' && (
            <p>
              {t('auth.noAccount')}{' '}
              <button type="button" onClick={() => switchMode('register')}>
                {t('auth.registerLink')}
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              {t('auth.hasAccount')}{' '}
              <button type="button" onClick={() => switchMode('login')}>
                {t('auth.loginLink')}
              </button>
            </p>
          )}
          {mode === 'forgot' && !resetSent && (
            <p>
              {t('auth.rememberPassword') || 'Вспомнили пароль?'}{' '}
              <button type="button" onClick={() => switchMode('login')}>
                {t('auth.loginLink')}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default AuthModal;
