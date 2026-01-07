import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { auth } from '../lib/supabase';
import { showToast } from '../utils/toast';
import './AuthModal.css';

const ResetPasswordModal = ({ isOpen, onClose, onSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.password.trim()) {
      newErrors.password = t('auth.errors.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.errors.passwordShort');
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = t('auth.errors.confirmPasswordRequired') || 'Подтвердите пароль';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordsMismatch') || 'Пароли не совпадают';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const { error } = await auth.updatePassword(formData.password);
      
      if (error) {
        console.error('Update password error:', error);
        showToast.error(t('auth.errors.updatePasswordFailed') || 'Ошибка обновления пароля');
        setIsSubmitting(false);
        return;
      }

      setIsSuccess(true);
      showToast.success(
        t('auth.passwordUpdated') || 'Пароль обновлен!',
        t('auth.passwordUpdatedDesc') || 'Теперь вы можете войти с новым паролем'
      );

      // Автоматически закрываем через 3 секунды
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 3000);
      
    } catch (err) {
      console.error('Update password exception:', err);
      showToast.error(err.message || t('auth.errors.unknown'));
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
          <h2>{t('auth.newPassword') || 'Новый пароль'}</h2>
          <p>{t('auth.newPasswordSubtitle') || 'Введите новый пароль для вашего аккаунта'}</p>
        </div>

        {isSuccess ? (
          <div className="reset-sent-message">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <h3>{t('auth.passwordUpdated') || 'Пароль обновлен!'}</h3>
            <p>{t('auth.passwordUpdatedDesc') || 'Теперь вы можете войти с новым паролем'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="new-password">
                {t('auth.newPasswordLabel') || 'Новый пароль'} <span className="required">*</span>
              </label>
              <input
                type="password"
                id="new-password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('auth.passwordPlaceholder')}
                className={errors.password ? 'error' : ''}
                autoComplete="new-password"
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">
                {t('auth.confirmPassword') || 'Подтвердите пароль'} <span className="required">*</span>
              </label>
              <input
                type="password"
                id="confirm-password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder={t('auth.confirmPasswordPlaceholder') || 'Повторите пароль'}
                className={errors.confirmPassword ? 'error' : ''}
                autoComplete="new-password"
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <button 
              type="submit" 
              className="auth-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loading-spinner"></span>
              ) : (
                t('auth.savePassword') || 'Сохранить пароль'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
