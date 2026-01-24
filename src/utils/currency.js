/**
 * Утилита для работы с валютами и конвертацией
 * Базовая валюта: KZT (тенге)
 */

// Маппинг валют
export const CURRENCIES = {
  KZT: {
    code: 'KZT',
    symbol: '₸',
    name: 'Тенге',
    isBase: true
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: 'Доллар США',
    isBase: false
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: 'Евро',
    isBase: false
  },
  RUB: {
    code: 'RUB',
    symbol: '₽',
    name: 'Рубль',
    isBase: false
  }
};

// Курсы валют относительно базовой валюты (KZT)
// Обновляйте эти курсы регулярно или получайте из API
export const EXCHANGE_RATES = {
  KZT: 1,      // Базовая валюта
  USD: 450,    // 1 USD = 450 KZT (примерный курс)
  EUR: 490,    // 1 EUR = 490 KZT (примерный курс)
  RUB: 5       // 1 RUB = 5 KZT (примерный курс)
};

// Маппинг символа в код валюты
export const SYMBOL_TO_CODE = {
  '$': 'USD',
  '€': 'EUR',
  '₸': 'KZT',
  '₽': 'RUB'
};

// Маппинг кода в символ
export const CODE_TO_SYMBOL = {
  'USD': '$',
  'EUR': '€',
  'KZT': '₸',
  'RUB': '₽'
};

/**
 * Конвертировать цену из базовой валюты (KZT) в целевую
 * @param {number} priceInKZT - Цена в базовой валюте (KZT)
 * @param {string} targetCurrency - Целевая валюта (USD, EUR, KZT, RUB)
 * @returns {number} - Цена в целевой валюте
 */
export const convertPrice = (priceInKZT, targetCurrency) => {
  if (!priceInKZT || priceInKZT === 0) return 0;
  if (!targetCurrency || targetCurrency === 'KZT') return priceInKZT;
  
  const rate = EXCHANGE_RATES[targetCurrency];
  if (!rate) {
    console.warn(`Курс для валюты ${targetCurrency} не найден, используется KZT`);
    return priceInKZT;
  }
  
  // Конвертируем из KZT в целевую валюту
  return priceInKZT / rate;
};

/**
 * Конвертировать цену из любой валюты в базовую (KZT)
 * @param {number} price - Цена
 * @param {string} fromCurrency - Исходная валюта
 * @returns {number} - Цена в KZT
 */
export const convertToBase = (price, fromCurrency) => {
  if (!price || price === 0) return 0;
  if (!fromCurrency || fromCurrency === 'KZT') return price;
  
  const rate = EXCHANGE_RATES[fromCurrency];
  if (!rate) {
    console.warn(`Курс для валюты ${fromCurrency} не найден, предполагается KZT`);
    return price;
  }
  
  // Конвертируем в KZT
  return price * rate;
};

/**
 * Форматировать цену с учетом валюты
 * @param {number} priceInKZT - Цена в базовой валюте (KZT)
 * @param {string} currency - Валюта для отображения (символ или код)
 * @param {Object} options - Опции форматирования
 * @returns {string} - Отформатированная строка цены
 */
export const formatPrice = (priceInKZT, currency = 'KZT', options = {}) => {
  if (priceInKZT === null || priceInKZT === undefined) return '';
  
  // Определяем код валюты
  let currencyCode = currency;
  if (SYMBOL_TO_CODE[currency]) {
    currencyCode = SYMBOL_TO_CODE[currency];
  }
  
  // Конвертируем цену
  const convertedPrice = convertPrice(priceInKZT, currencyCode);
  
  // Получаем символ валюты
  const symbol = CODE_TO_SYMBOL[currencyCode] || currencyCode;
  
  // Опции форматирования
  const {
    showDecimals = false,
    locale = 'ru-RU',
    minimumFractionDigits = 0,
    maximumFractionDigits = showDecimals ? 2 : 0
  } = options;
  
  // Форматируем число
  const formattedNumber = new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits
  }).format(convertedPrice);
  
  // Возвращаем с символом валюты
  return `${formattedNumber} ${symbol}`;
};

/**
 * Получить символ валюты по коду или символу
 * @param {string} currency - Код или символ валюты
 * @returns {string} - Символ валюты
 */
export const getCurrencySymbol = (currency) => {
  if (!currency) return '₸';
  
  // Если это уже символ
  if (CODE_TO_SYMBOL[currency]) {
    return CODE_TO_SYMBOL[currency];
  }
  
  // Если это символ из маппинга
  if (SYMBOL_TO_CODE[currency]) {
    return currency;
  }
  
  return '₸'; // По умолчанию
};

/**
 * Получить код валюты по символу
 * @param {string} symbol - Символ валюты
 * @returns {string} - Код валюты
 */
export const getCurrencyCode = (symbol) => {
  if (!symbol) return 'KZT';
  
  if (SYMBOL_TO_CODE[symbol]) {
    return SYMBOL_TO_CODE[symbol];
  }
  
  if (CODE_TO_SYMBOL[symbol]) {
    return symbol;
  }
  
  return 'KZT'; // По умолчанию
};

/**
 * Обновить курсы валют (можно вызывать из API)
 * @param {Object} newRates - Новые курсы { USD: 450, EUR: 490, ... }
 */
export const updateExchangeRates = (newRates) => {
  Object.keys(newRates).forEach(currency => {
    if (EXCHANGE_RATES.hasOwnProperty(currency)) {
      EXCHANGE_RATES[currency] = newRates[currency];
    }
  });
  
  // Сохраняем в localStorage для кэширования
  localStorage.setItem('exchangeRates', JSON.stringify(EXCHANGE_RATES));
};

/**
 * Загрузить курсы из localStorage (при инициализации)
 */
export const loadExchangeRates = () => {
  try {
    const saved = localStorage.getItem('exchangeRates');
    if (saved) {
      const rates = JSON.parse(saved);
      Object.assign(EXCHANGE_RATES, rates);
    }
  } catch (error) {
    console.error('Ошибка загрузки курсов валют:', error);
  }
};

// Загружаем курсы при инициализации модуля
loadExchangeRates();
