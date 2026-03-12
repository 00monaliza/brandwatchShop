export const CURRENCIES = Object.freeze({
  KZT: { code: 'KZT', symbol: '₸', name: 'Тенге', isBase: true },
  USD: { code: 'USD', symbol: '$', name: 'Доллар США', isBase: false },
  EUR: { code: 'EUR', symbol: '€', name: 'Евро', isBase: false },
  RUB: { code: 'RUB', symbol: '₽', name: 'Рубль', isBase: false },
});

const BASE_CURRENCY = 'KZT';

export const CODE_TO_SYMBOL = Object.fromEntries(
  Object.values(CURRENCIES).map((c) => [c.code, c.symbol])
);

export const SYMBOL_TO_CODE = Object.fromEntries(
  Object.values(CURRENCIES).map((c) => [c.symbol, c.code])
);

const DEFAULT_RATES = Object.freeze({
  KZT: 1,
  USD: 500,
  EUR: 490,
  RUB: 5,
});

let currentRates = { ...DEFAULT_RATES };

// Подписчики на изменение курсов (Observer pattern)
const ratesListeners = new Set();

export const onRatesChange = (listener) => {
  ratesListeners.add(listener);
  return () => ratesListeners.delete(listener);
};

const notifyRatesListeners = () => {
  const snapshot = getExchangeRates();
  ratesListeners.forEach((fn) => fn(snapshot));
};

export const getExchangeRates = () => ({ ...currentRates });

export const EXCHANGE_RATES = currentRates;

export const getCurrencyCode = (input) => {
  if (!input) return BASE_CURRENCY;
  if (CURRENCIES[input]) return input;
  return SYMBOL_TO_CODE[input] || BASE_CURRENCY;
};

export const getCurrencySymbol = (input) => {
  if (!input) return CURRENCIES[BASE_CURRENCY].symbol;
  if (CODE_TO_SYMBOL[input]) return CODE_TO_SYMBOL[input];
  if (SYMBOL_TO_CODE[input]) return input;
  return CURRENCIES[BASE_CURRENCY].symbol;
};

export const convertPrice = (priceInKZT, targetCurrency, rates = currentRates) => {
  if (priceInKZT == null || priceInKZT === 0) return 0;
  const code = getCurrencyCode(targetCurrency);
  if (code === BASE_CURRENCY) return priceInKZT;
  const rate = rates[code];
  return rate ? priceInKZT / rate : priceInKZT;
};

export const convertToBase = (price, fromCurrency, rates = currentRates) => {
  if (price == null || price === 0) return 0;
  const code = getCurrencyCode(fromCurrency);
  if (code === BASE_CURRENCY) return price;
  const rate = rates[code];
  return rate ? price * rate : price;
};

const formatterCache = new Map();

const getFormatter = (locale, minDigits, maxDigits) => {
  const key = `${locale}|${minDigits}|${maxDigits}`;
  let formatter = formatterCache.get(key);
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    });
    formatterCache.set(key, formatter);
  }
  return formatter;
};

export const formatPrice = (priceInKZT, currency = BASE_CURRENCY, options = {}, rates = currentRates) => {
  if (priceInKZT == null) return '';

  const currencyCode = getCurrencyCode(currency);
  const convertedPrice = convertPrice(priceInKZT, currencyCode, rates);
  const symbol = CODE_TO_SYMBOL[currencyCode] || currencyCode;

  const {
    showDecimals = false,
    locale = 'ru-RU',
    minimumFractionDigits = 0,
    maximumFractionDigits = showDecimals ? 2 : 0,
  } = options;

  const formatted = getFormatter(locale, minimumFractionDigits, maximumFractionDigits)
    .format(convertedPrice);

  return `${formatted} ${symbol}`;
}

const STORAGE_KEY_RATES = 'exchangeRates';
const STORAGE_KEY_TIMESTAMP = 'exchangeRatesTimestamp';
const CACHE_TTL = 60 * 60 * 1000; // 1 час

export const updateExchangeRates = (newRates) => {
  let changed = false;
  Object.keys(newRates).forEach((code) => {
    if (code in currentRates && currentRates[code] !== newRates[code]) {
      currentRates[code] = newRates[code];
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(STORAGE_KEY_RATES, JSON.stringify(currentRates));
    notifyRatesListeners();
  }
};

export const loadExchangeRates = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_RATES);
    if (saved) {
      const rates = JSON.parse(saved);
      Object.assign(currentRates, rates);
    }
  } catch (error) {
    console.error('Ошибка загрузки курсов валют:', error);
  }
};

export const fetchExchangeRates = async () => {
  try {
    const lastFetch = localStorage.getItem(STORAGE_KEY_TIMESTAMP);
    if (lastFetch && Date.now() - Number(lastFetch) < CACHE_TTL) return;

    const response = await fetch('https://open.er-api.com/v6/latest/KZT');
    if (!response.ok) return;

    const data = await response.json();
    if (data.result !== 'success' || !data.rates) return;

    const newRates = {};
    for (const code of Object.keys(CURRENCIES)) {
      if (code === BASE_CURRENCY || !data.rates[code]) continue;
      newRates[code] = Math.round(1 / data.rates[code]);
    }

    if (Object.keys(newRates).length > 0) {
      updateExchangeRates(newRates);
      localStorage.setItem(STORAGE_KEY_TIMESTAMP, String(Date.now()));
    }
  } catch {
    // Используем захардкоженные/кэшированные курсы при ошибке сети
  }
};

// Инициализация
loadExchangeRates();
fetchExchangeRates();
