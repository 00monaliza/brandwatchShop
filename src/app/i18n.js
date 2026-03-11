import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ruTranslations from './locales/ru.json';
import enTranslations from './locales/en.json';
import kzTranslations from './locales/kz.json';

const resources = {
  ru: {
    translation: ruTranslations
  },
  en: {
    translation: enTranslations
  },
  kz: {
    translation: kzTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
