import { useCallback, useMemo, useState, useEffect } from 'react';
import { useSettings } from '../../features/admin/context/SettingsContext';
import {
  formatPrice,
  convertPrice,
  getCurrencySymbol,
  getExchangeRates,
  onRatesChange,
} from '../../services/currency';

/**
 * Хук для работы с валютой.
 * Подписывается на:
 *  1) SettingsContext — текущая выбранная валюта
 *  2) onRatesChange  — актуальные курсы с API
 * Компоненты перерисовываются только при реальном изменении валюты или курсов.
 */
export const useCurrency = () => {
  const { settings } = useSettings();
  const currency = settings?.currency || 'KZT';

  // Подписка на обновление курсов из API
  const [rates, setRates] = useState(getExchangeRates);

  useEffect(() => {
    return onRatesChange(setRates);
  }, []);

  const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  const formatPriceWithCurrency = useCallback(
    (priceInKZT, options = {}) => formatPrice(priceInKZT, currency, options, rates),
    [currency, rates]
  );

  const getPriceInCurrentCurrency = useCallback(
    (priceInKZT) => convertPrice(priceInKZT, currency, rates),
    [currency, rates]
  );

  const getSymbol = useCallback(() => getCurrencySymbol(currency), [currency]);
  const getCode = useCallback(() => currency, [currency]);

  return useMemo(() => ({
    currency,
    currencySymbol,
    rates,
    formatPrice: formatPriceWithCurrency,
    getPrice: getPriceInCurrentCurrency,
    getSymbol,
    getCode,
  }), [currency, currencySymbol, rates, formatPriceWithCurrency, getPriceInCurrentCurrency, getSymbol, getCode]);
};
