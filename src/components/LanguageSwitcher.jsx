import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

export const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher desktop-switcher">
      <div className={`lang-slider ${i18n.language}`} />
      <button 
        className={i18n.language === 'kz' ? 'active' : ''}
        onClick={() => changeLanguage('kz')}
      >
        KZ
      </button>
      <button 
        className={i18n.language === 'ru' ? 'active' : ''}
        onClick={() => changeLanguage('ru')}
      >
        RU
      </button>
      <button 
        className={i18n.language === 'en' ? 'active' : ''}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
    </div>
  );
};

export const MobileLanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="language-switcher mobile-switcher">
      <div className={`lang-slider ${i18n.language}`} />
      <button 
        className={i18n.language === 'kz' ? 'active' : ''}
        onClick={() => changeLanguage('kz')}
      >
        KZ
      </button>
      <button 
        className={i18n.language === 'ru' ? 'active' : ''}
        onClick={() => changeLanguage('ru')}
      >
        RU
      </button>
      <button 
        className={i18n.language === 'en' ? 'active' : ''}
        onClick={() => changeLanguage('en')}
      >
        EN
      </button>
    </div>
  );
};
