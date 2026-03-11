import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';
import { storage } from '../../../services/supabase';
import { showAdminToast } from '../../../shared/utils/toast';
import { CODE_TO_SYMBOL } from '../../../services/currency';
import './AdminPanel.css';

const AdminSettings = () => {
  const { settings, updateSettings, loading } = useSettings();
  const [activeSection, setActiveSection] = useState('general');
  const [formData, setFormData] = useState(() => {
    // Используем код валюты напрямую (теперь хранится как код)
    const currencyCode = settings?.currency || 'KZT';
    return {
      ...settings,
      currency: currencyCode
    };
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (settings) {
      // Используем код валюты напрямую
      const currencyCode = settings.currency || 'KZT';
      setFormData(prev => ({
        ...prev,
        ...settings,
        currency: currencyCode
      }));
    }
  }, [settings]);

  const handleChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    const dataToSave = {
      ...formData,
      currency: formData.currency || 'KZT'
    };
    
    const result = await updateSettings(dataToSave);
    setSaving(false);
    
    if (result.success) {
      setSaved(true);
      showAdminToast.settingsSaved();
      setTimeout(() => setSaved(false), 3000);
    } else {
      showAdminToast.settingsError(result.error?.message || 'Неизвестная ошибка');
    }
  };

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showAdminToast.settingsError('Файл слишком большой. Максимум 2MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      showAdminToast.settingsError('Пожалуйста, загрузите изображение');
      return;
    }

    setUploadingLogo(true);

    try {
      const { url, error } = await storage.uploadStoreLogo(file);
      
      if (error) {
        console.error('Error uploading logo:', error);
        showAdminToast.settingsError('Ошибка загрузки логотипа');
        setUploadingLogo(false);
        return;
      }

      setFormData(prev => ({
        ...prev,
        logo: url
      }));
      setSaved(false);
      showAdminToast.settingsSaved();
    } catch (err) {
      console.error('Error in handleLogoChange:', err);
      showAdminToast.settingsError('Ошибка загрузки логотипа');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleRemoveLogo = async () => {
    setUploadingLogo(true);
    try {
      await storage.deleteStoreLogo();
      setFormData(prev => ({
        ...prev,
        logo: null
      }));
      setSaved(false);
    } catch (err) {
      console.error('Error removing logo:', err);
      showAdminToast.settingsError('Ошибка удаления логотипа');
    } finally {
      setUploadingLogo(false);
    }
  };

  const sections = [
    { id: 'general', label: 'Общие', },
    { id: 'contacts', label: 'Контакты', },
    { id: 'payment', label: 'Оплата', },
    { id: 'notifications', label: 'Уведомления', }
  ];

  if (loading) {
    return (
      <div className="admin-settings">
        <h2 className="admin-section-title">Настройки магазина</h2>
        <div className="loading-state">Загрузка настроек...</div>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <h2 className="admin-section-title">Настройки магазина</h2>

      <div className="settings-layout">
        {/* Боковое меню */}
        <div className="settings-sidebar">
          {sections.map(section => (
            <button
              key={section.id}
              className={`settings-nav-btn ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-label">{section.label}</span>
            </button>
          ))}
        </div>

        {/* Контент */}
        <div className="settings-content">
          {/* Общие настройки */}
          {activeSection === 'general' && (
            <div className="settings-section">
              <h3>Общие настройки</h3>
              
              <div className="form-group">
                <label>Логотип магазина</label>
                <div className="logo-upload">
                  <div className="logo-preview">
                    {uploadingLogo ? (
                      <span className="logo-loading">Загрузка...</span>
                    ) : formData.logo ? (
                      <img src={formData.logo} alt="Logo" />
                    ) : (
                      <span className="logo-placeholder">📷</span>
                    )}
                  </div>
                  <div className="logo-actions">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      id="logo-input"
                      hidden
                      disabled={uploadingLogo}
                    />
                    <label htmlFor="logo-input" className={`upload-btn ${uploadingLogo ? 'disabled' : ''}`}>
                      {uploadingLogo ? 'Загрузка...' : 'Загрузить логотип'}
                    </label>
                    {formData.logo && (
                      <button 
                        type="button" 
                        className="remove-logo-btn"
                        onClick={handleRemoveLogo}
                        disabled={uploadingLogo}
                      >
                        Удалить
                      </button>
                    )}
                    <span className="upload-hint">PNG, JPG до 2MB. Логотип будет отображаться в шапке и подвале сайта</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Название магазина</label>
                <input
                  type="text"
                  value={formData.storeName || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, storeName: e.target.value }))}
                  placeholder="BrandWatch"
                />
              </div>

              <div className="form-group">
                <label>Валюта отображения</label>
                <select
                  value={formData.currency || 'KZT'}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, currency: e.target.value }));
                    setSaved(false);
                  }}
                >
                  <option value="KZT">KZT (₸) - Тенге</option>
                  <option value="USD">USD ($) - Доллар США</option>
                  <option value="EUR">EUR (€) - Евро</option>
                  <option value="RUB">RUB (₽) - Рубль</option>
                </select>
                <span className="form-hint">
                  Текущая валюта: {CODE_TO_SYMBOL[formData.currency] || '₸'} ({formData.currency || 'KZT'})
                  <br />
                  <small>Все цены хранятся в KZT и автоматически конвертируются при отображении</small>
                </span>
              </div>
            </div>
          )}

          {/* Контакты */}
          {activeSection === 'contacts' && (
            <div className="settings-section">
              <h3>Контактная информация</h3>

              <div className="form-group">
                <label>WhatsApp</label>
                <input
                  type="tel"
                  value={formData.contacts?.whatsapp || ''}
                  onChange={(e) => handleChange('contacts', 'whatsapp', e.target.value)}
                  placeholder="+7 777 123 4567"
                />
                <span className="form-hint">Номер для связи через WhatsApp</span>
              </div>

              <div className="form-group">
                <label>Telegram</label>
                <input
                  type="text"
                  value={formData.contacts?.telegram || ''}
                  onChange={(e) => handleChange('contacts', 'telegram', e.target.value)}
                  placeholder="@username или ссылка"
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.contacts?.email || ''}
                  onChange={(e) => handleChange('contacts', 'email', e.target.value)}
                  placeholder="info@brandwatch.com"
                />
              </div>

              <div className="form-group">
                <label>Адрес</label>
                <textarea
                  value={formData.contacts?.address || ''}
                  onChange={(e) => handleChange('contacts', 'address', e.target.value)}
                  placeholder="г. Алматы, ул. Примерная, 123"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Время работы</label>
                <input
                  type="text"
                  value={formData.contacts?.workingHours || ''}
                  onChange={(e) => handleChange('contacts', 'workingHours', e.target.value)}
                  placeholder="Пн-Пт: 10:00-20:00, Сб-Вс: 11:00-18:00"
                />
              </div>

              <div className="form-group">
                <label>Instagram</label>
                <input
                  type="text"
                  value={formData.contacts?.instagram || ''}
                  onChange={(e) => handleChange('contacts', 'instagram', e.target.value)}
                  placeholder="https://www.instagram.com/brandwatch.kz/"
                />
                <span className="form-hint">Ссылка на страницу Instagram</span>
              </div>
            </div>
          )}

          {/* Оплата */}
          {activeSection === 'payment' && (
            <div className="settings-section">
              <h3>Способы оплаты</h3>

              <div className="payment-methods">
                <div className="payment-method-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods?.cash || false}
                      onChange={(e) => handleChange('paymentMethods', 'cash', e.target.checked)}
                    />
                    <span className="checkbox-custom"></span>
                    Наличные при получении
                  </label>
                </div>

                <div className="payment-method-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods?.card || false}
                      onChange={(e) => handleChange('paymentMethods', 'card', e.target.checked)}
                    />
                    <span className="checkbox-custom"></span>
                    Банковская карта
                  </label>
                </div>

                <div className="payment-method-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods?.kaspiQR || false}
                      onChange={(e) => handleChange('paymentMethods', 'kaspiQR', e.target.checked)}
                    />
                    <span className="checkbox-custom"></span>
                    Kaspi QR
                  </label>
                </div>

                <div className="payment-method-item">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.paymentMethods?.bankTransfer || false}
                      onChange={(e) => handleChange('paymentMethods', 'bankTransfer', e.target.checked)}
                    />
                    <span className="checkbox-custom"></span>
                    Банковский перевод
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                <label>Реквизиты для перевода</label>
                <textarea
                  value={formData.bankDetails || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, bankDetails: e.target.value }))}
                  placeholder="ИИН/БИН, номер счета, банк..."
                  rows="3"
                />
              </div>
            </div>
          )}

          {/* Уведомления */}
          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h3>Настройки уведомлений</h3>

              <div className="notification-settings">
                <div className="form-group">
                  <label>Telegram Bot Token</label>
                  <input
                    type="text"
                    value={formData.notifications?.telegramBotToken || ''}
                    onChange={(e) => handleChange('notifications', 'telegramBotToken', e.target.value)}
                    placeholder="123456:ABC-DEF..."
                  />
                  <span className="form-hint">Получите токен у @BotFather в Telegram</span>
                </div>

                <div className="form-group">
                  <label>Telegram Chat ID</label>
                  <input
                    type="text"
                    value={formData.notifications?.telegramChatId || ''}
                    onChange={(e) => handleChange('notifications', 'telegramChatId', e.target.value)}
                    placeholder="1234567890"
                  />
                  <span className="form-hint">ID чата для получения уведомлений</span>
                </div>

                <div className="notification-toggles">
                  <h4>Уведомлять о:</h4>
                  
                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={formData.notifications?.onNewOrder ?? true}
                      onChange={(e) => handleChange('notifications', 'onNewOrder', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    Новые заказы
                  </label>

                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={formData.notifications?.onOrderStatusChange ?? false}
                      onChange={(e) => handleChange('notifications', 'onOrderStatusChange', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    Изменение статуса заказа
                  </label>

                  <label className="toggle-label">
                    <input
                      type="checkbox"
                      checked={formData.notifications?.onLowStock ?? false}
                      onChange={(e) => handleChange('notifications', 'onLowStock', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                    Низкий остаток товара
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Кнопка сохранения */}
          <div className="settings-actions">
            <button 
              className={`save-settings-btn ${saved ? 'saved' : ''} ${saving ? 'saving' : ''}`}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Сохранение...' : saved ? '✓ Сохранено!' : 'Сохранить настройки'}
            </button>
            <span className="settings-hint">
              Изменения будут применены на всём сайте
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
