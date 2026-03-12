import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const languages = ['kz', 'ru', 'en'];

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div className="language-switcher desktop-switcher">
      {languages.map((lng) => (
        <button
          key={lng}
          className={i18n.language === lng ? 'active' : ''}
          onClick={() => i18n.changeLanguage(lng)}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
};

export const MobileLanguageSwitcher = () => {
  const { i18n } = useTranslation();

  return (
    <div className="language-switcher mobile-switcher">
      {languages.map((lng) => (
        <button
          key={lng}
          className={i18n.language === lng ? 'active' : ''}
          onClick={() => i18n.changeLanguage(lng)}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
};
