# Руководство по миграции системы валют

## Архитектурное решение

### Принципы работы

1. **Базовая валюта: KZT (тенге)**
   - Все цены хранятся в базе данных в KZT
   - Это обеспечивает единообразие и точность расчетов

2. **Динамическое отображение**
   - Цены конвертируются в выбранную валюту только при отображении
   - Никогда не сохраняются конвертированные значения

3. **Единый источник курсов**
   - Курсы валют хранятся в `src/utils/currency.js`
   - Можно обновлять из API или вручную

4. **Глобальное состояние**
   - Валюта хранится в `SettingsContext`
   - При изменении валюты все компоненты автоматически обновляются

## Структура данных

### Товар в базе данных

```javascript
{
  id: 123,
  brand: "Rolex",
  title: "Submariner",
  price: 6750000,        // Цена в KZT (базовая валюта)
  priceInKZT: 6750000,   // Явное указание (для ясности)
  oldPrice: 7500000,     // Старая цена в KZT
  oldPriceInKZT: 7500000,
  // ... другие поля
}
```

### Товар в корзине

```javascript
{
  id: 123,
  brand: "Rolex",
  title: "Submariner",
  price: 6750000,        // Цена в KZT
  priceInKZT: 6750000,   // Явное указание
  quantity: 2
}
```

### Заказ

```javascript
{
  id: 456,
  items: [
    {
      id: 123,
      price: 6750000,     // Цена в KZT
      priceInKZT: 6750000,
      quantity: 2
    }
  ],
  total: 13500000,       // Общая сумма в KZT
  totalInKZT: 13500000
}
```

## Использование

### В компонентах

```javascript
import { useCurrency } from '../hooks/useCurrency';

const MyComponent = () => {
  const { formatPrice, currency, currencySymbol } = useCurrency();
  const priceInKZT = 6750000; // Цена в базовой валюте
  
  return (
    <div>
      <span>{formatPrice(priceInKZT)}</span>
      {/* Отобразит: "15 000 $" если валюта USD */}
      {/* Отобразит: "6 750 000 ₸" если валюта KZT */}
    </div>
  );
};
```

### Форматирование цен

```javascript
import { formatPrice } from '../utils/currency';

// Простое форматирование
formatPrice(6750000, 'USD'); // "15 000 $"
formatPrice(6750000, 'KZT'); // "6 750 000 ₸"

// С опциями
formatPrice(6750000, 'USD', { 
  showDecimals: true,
  locale: 'en-US' 
}); // "15,000.00 $"
```

### Конвертация цен

```javascript
import { convertPrice, convertToBase } from '../utils/currency';

// Из KZT в USD
const priceInUSD = convertPrice(6750000, 'USD'); // 15000

// Из USD в KZT
const priceInKZT = convertToBase(15000, 'USD'); // 6750000
```

## Миграция существующих данных

### Шаг 1: Обновление товаров

Если у вас есть товары с ценами в другой валюте, нужно конвертировать их в KZT:

```javascript
// Пример миграции
const migrateProducts = (products) => {
  return products.map(product => {
    // Если цена уже в KZT, оставляем как есть
    if (product.priceInKZT) {
      return product;
    }
    
    // Если цена в USD (старая система)
    if (product.currency === 'USD' || product.price < 10000) {
      const priceInKZT = convertToBase(product.price, 'USD');
      return {
        ...product,
        price: priceInKZT,
        priceInKZT: priceInKZT,
        oldPrice: product.oldPrice ? convertToBase(product.oldPrice, 'USD') : null
      };
    }
    
    // Предполагаем, что цена уже в KZT
    return {
      ...product,
      priceInKZT: product.price
    };
  });
};
```

### Шаг 2: Обновление заказов

```javascript
const migrateOrders = (orders) => {
  return orders.map(order => {
    const items = order.items.map(item => ({
      ...item,
      priceInKZT: item.priceInKZT || convertToBase(item.price, 'USD'),
      price: item.priceInKZT || convertToBase(item.price, 'USD')
    }));
    
    const totalInKZT = items.reduce((sum, item) => 
      sum + (item.priceInKZT || item.price) * item.quantity, 0
    );
    
    return {
      ...order,
      items,
      total: totalInKZT,
      totalInKZT
    };
  });
};
```

## Обновление курсов валют

### Ручное обновление

```javascript
import { updateExchangeRates } from '../utils/currency';

updateExchangeRates({
  USD: 450,  // 1 USD = 450 KZT
  EUR: 490,  // 1 EUR = 490 KZT
  RUB: 5     // 1 RUB = 5 KZT
});
```

### Обновление из API

```javascript
// Пример получения курсов из API
const fetchExchangeRates = async () => {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/KZT');
    const data = await response.json();
    
    // Конвертируем в формат нашей системы
    const rates = {
      USD: 1 / data.rates.USD,
      EUR: 1 / data.rates.EUR,
      RUB: 1 / data.rates.RUB
    };
    
    updateExchangeRates(rates);
  } catch (error) {
    console.error('Ошибка загрузки курсов:', error);
  }
};
```

## Автоматическое обновление при смене валюты

При изменении валюты в админ-панели:

1. `SettingsContext` обновляет состояние
2. Отправляется событие `currencyChanged`
3. Все компоненты, использующие `useCurrency`, автоматически перерисовываются
4. Цены пересчитываются и отображаются в новой валюте

## Важные замечания

1. **Никогда не сохраняйте конвертированные цены**
   - Всегда храните цены в KZT
   - Конвертация только для отображения

2. **Проверяйте источник цен**
   - При добавлении товара убедитесь, что цена в KZT
   - При загрузке из БД проверяйте формат

3. **Обратная совместимость**
   - Старые товары без `priceInKZT` используют `price`
   - Постепенно мигрируйте данные

4. **Тестирование**
   - Проверяйте отображение в разных валютах
   - Проверяйте расчеты в корзине
   - Проверяйте сохранение заказов

## Примеры использования

### Создание товара

```javascript
const product = {
  brand: "Rolex",
  title: "Submariner",
  price: 6750000,        // В KZT
  priceInKZT: 6750000,   // Явно
  oldPrice: 7500000,
  oldPriceInKZT: 7500000
};
```

### Отображение цены

```javascript
const ProductCard = ({ product }) => {
  const { formatPrice } = useCurrency();
  const priceInKZT = product.priceInKZT || product.price;
  
  return <div>{formatPrice(priceInKZT)}</div>;
};
```

### Расчет суммы в корзине

```javascript
const cartTotal = cartItems.reduce((sum, item) => {
  const priceInKZT = item.priceInKZT || item.price;
  return sum + priceInKZT * item.quantity;
}, 0);
```
