import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { storeSettings } from '../lib/supabase';
import { getCurrencyCode, CODE_TO_SYMBOL } from '../utils/currency';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Преобразование данных из Supabase формата в формат приложения
const transformFromDb = (dbSettings) => {
  if (!dbSettings) return null;
  
  // Преобразуем символ валюты в код для единообразия
  const currencySymbol = dbSettings.currency || '$';
  const currencyCode = getCurrencyCode(currencySymbol);
  
  return {
    storeName: dbSettings.store_name || 'brandwatch',
    logo: dbSettings.logo_url || null,
    currency: currencyCode, // Храним код валюты, а не символ
    currencySymbol: CODE_TO_SYMBOL[currencyCode] || '$', // Для обратной совместимости
    contacts: {
      whatsapp: dbSettings.whatsapp || '',
      telegram: dbSettings.telegram || '',
      email: dbSettings.email || '',
      address: dbSettings.address || '',
      workingHours: dbSettings.working_hours || '',
      instagram: dbSettings.instagram || ''
    },
    paymentMethods: dbSettings.payment_methods || [],
    bankDetails: dbSettings.bank_details || '',
    notifications: dbSettings.notifications || {
      telegramBotToken: '',
      telegramChatId: '',
      onNewOrder: true,
      onOrderStatusChange: false,
      onLowStock: false
    }
  };
};

// Дефолтные настройки
const defaultSettings = {
  storeName: 'brandwatch',
  logo: null,
  currency: 'KZT', // Базовая валюта по умолчанию
  currencySymbol: '₸',
  contacts: {
    whatsapp: '+77778115151',
    telegram: '@baikadamov_a',
    email: 'info@brandwatch.kz',
    address: '',
    workingHours: '',
    instagram: 'https://www.instagram.com/brandwatch.kz/'
  },
  paymentMethods: [
    { id: 1, name: 'Kaspi', enabled: true },
    { id: 2, name: 'Карта', enabled: true },
    { id: 3, name: 'Наличные', enabled: true }
  ],
  bankDetails: '',
  notifications: {
    telegramBotToken: '',
    telegramChatId: '',
    onNewOrder: true,
    onOrderStatusChange: false,
    onLowStock: false
  }
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Загружаем из localStorage для быстрого старта
    const saved = localStorage.getItem('storeSettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Загрузка настроек из Supabase
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await storeSettings.get();
      
      if (fetchError) {
        console.error('Error fetching settings:', fetchError);
        setError(fetchError);
        return;
      }
      
      if (data) {
        const transformedSettings = transformFromDb(data);
        setSettings(transformedSettings);
        // Сохраняем в localStorage для быстрого старта при следующей загрузке
        localStorage.setItem('storeSettings', JSON.stringify(transformedSettings));
      }
    } catch (err) {
      console.error('Error in fetchSettings:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Обновление настроек
  const updateSettings = useCallback(async (updates) => {
    try {
      // Если обновляется валюта, преобразуем код в символ для Supabase
      const updatesForDb = { ...updates };
      if (updates.currency && CODE_TO_SYMBOL[updates.currency]) {
        // Сохраняем символ в БД для обратной совместимости
        updatesForDb.currency = CODE_TO_SYMBOL[updates.currency];
        // Но в локальном состоянии храним код
        updates.currencySymbol = CODE_TO_SYMBOL[updates.currency];
      }
      
      // Оптимистичное обновление
      const newSettings = { ...settings, ...updates };
      setSettings(newSettings);
      localStorage.setItem('storeSettings', JSON.stringify(newSettings));
      
      // Сохраняем в Supabase (с символом валюты)
      const { error: updateError } = await storeSettings.update(updatesForDb);
      
      if (updateError) {
        console.error('Error updating settings:', updateError);
        // Откатываем изменения при ошибке
        setSettings(settings);
        localStorage.setItem('storeSettings', JSON.stringify(settings));
        return { success: false, error: updateError };
      }
      
      // Уведомляем все компоненты об изменении валюты
      window.dispatchEvent(new CustomEvent('currencyChanged', { 
        detail: { currency: updates.currency || settings.currency } 
      }));
      
      return { success: true };
    } catch (err) {
      console.error('Error in updateSettings:', err);
      return { success: false, error: err };
    }
  }, [settings]);

  // Загрузка настроек при монтировании
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Подписка на real-time обновления
  useEffect(() => {
    const subscription = storeSettings.subscribe((newData) => {
      if (newData) {
        const transformedSettings = transformFromDb(newData);
        setSettings(transformedSettings);
        localStorage.setItem('storeSettings', JSON.stringify(transformedSettings));
      }
    });

    return () => {
      storeSettings.unsubscribe(subscription);
    };
  }, []);

  const value = useMemo(() => ({
    settings,
    loading,
    error,
    updateSettings,
    refreshSettings: fetchSettings
  }), [settings, loading, error, updateSettings, fetchSettings]);

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
