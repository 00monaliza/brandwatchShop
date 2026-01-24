import { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { formatPrice, convertPrice, getCurrencySymbol } from '../utils/currency';

/**
 * Хук для работы с валютой
 * Предоставляет функции форматирования цен с учетом текущей валюты
 * Автоматически обновляется при изменении валюты
 */
export const useCurrency = () => {
  const { settings } = useSettings();
  const [currency, setCurrency] = useState(settings?.currency || 'KZT');
  
  // Обновляем валюту при изменении настроек
  useEffect(() => {
    if (settings?.currency) {
      setCurrency(settings.currency);
    }
  }, [settings?.currency]);
  
  // Слушаем события изменения валюты
  useEffect(() => {
    const handleCurrencyChange = (event) => {
      if (event.detail?.currency) {
        setCurrency(event.detail.currency);
      }
    };
    
    window.addEventListener('currencyChanged', handleCurrencyChange);
    return () => {
      window.removeEventListener('currencyChanged', handleCurrencyChange);
    };
  }, []);

  /**
   * Форматировать цену с учетом текущей валюты
   * @param {number} priceInKZT - Цена в базовой валюте (KZT)
   * @param {Object} options - Опции форматирования
   * @returns {string} - Отформатированная строка цены
   */
  const formatPriceWithCurrency = (priceInKZT, options = {}) => {
    return formatPrice(priceInKZT, currency, options);
  };

  /**
   * Получить цену в текущей валюте (без форматирования)
   * @param {number} priceInKZT - Цена в базовой валюте (KZT)
   * @returns {number} - Цена в текущей валюте
   */
  const getPriceInCurrentCurrency = (priceInKZT) => {
    return convertPrice(priceInKZT, currency);
  };

  /**
   * Получить символ текущей валюты
   * @returns {string} - Символ валюты
   */
  const getCurrentCurrencySymbol = () => {
    return getCurrencySymbol(currency);
  };

  /**
   * Получить код текущей валюты
   * @returns {string} - Код валюты
   */
  const getCurrentCurrencyCode = () => {
    return currency;
  };

  return {
    currency,
    currencySymbol: getCurrentCurrencySymbol(),
    formatPrice: formatPriceWithCurrency,
    getPrice: getPriceInCurrentCurrency,
    getSymbol: getCurrentCurrencySymbol,
    getCode: getCurrentCurrencyCode
  };
};
