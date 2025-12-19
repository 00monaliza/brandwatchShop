import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import defaultLogoImage from '../images/image.png';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  
  // Используем логотип из настроек или дефолтный
  const logoImage = settings?.logo || defaultLogoImage;
  const storeName = settings?.storeName || 'brandwatch';

  // Форматирование ссылок
  const getWhatsAppLink = () => {
    const phone = settings.contacts?.whatsapp?.replace(/[^0-9]/g, '') || '77778115151';
    return `https://wa.me/${phone}`;
  };

  const getTelegramLink = () => {
    const telegram = settings.contacts?.telegram || '@baikadamov_a';
    // Если это username (начинается с @), убираем @ и формируем ссылку
    if (telegram.startsWith('@')) {
      return `https://t.me/${telegram.slice(1)}`;
    }
    // Если уже ссылка, возвращаем как есть
    if (telegram.startsWith('http')) {
      return telegram;
    }
    return `https://t.me/${telegram}`;
  };

  const getInstagramLink = () => {
    return settings.contacts?.instagram || 'https://www.instagram.com/brandwatch.kz/';
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-main">
          {/* Brand Column */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo-link">
              <img src={logoImage} alt={storeName} className="footer-logo-image" />
            </Link>
            <p className="footer-desc">
              {t('footer.description')}
            </p>
          </div>

          {/* Navigation Column */}
          <div className="footer-col">
            <h3 className="footer-title">{t('footer.navigation')}</h3>
            <ul className="footer-links">
              <li><Link to="/">{t('nav.main')}</Link></li>
              <li><Link to="/about">{t('nav.aboutUs')}</Link></li>
              <li><Link to="/contacts">{t('nav.contacts')}</Link></li>
              <li><Link to="/delivery">{t('footer.delivery')}</Link></li>
              <li><Link to="/service">{t('footer.service')}</Link></li>
              <li><Link to="/stores">{t('footer.stores')}</Link></li>
            </ul>
          </div>

          {/* Categories Column */}
          <div className="footer-col">
            <h3 className="footer-title">{t('footer.categories')}</h3>
            <ul className="footer-links">
              <li><Link to="/catalog">{t('footer.watches')}</Link></li>
              <li><Link to="/accessories">{t('footer.accessories')}</Link></li>
              <li><Link to="/sales">{t('nav.sales')}</Link></li>
              <li><Link to="/blog">{t('footer.blog')}</Link></li>
            </ul>
          </div>

          {/* Contacts Column */}
          <div className="footer-col contacts-col">
            <div className="social-icons">
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="WhatsApp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </a>
              <a href={getTelegramLink()} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Telegram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </a>
              <a href={getInstagramLink()} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
            </div>
            <div className="contact-info">
              <a href={`mailto:${settings.contacts?.email || 'info@brandwatch.kz'}`} className="contact-link">
                {settings.contacts?.email || 'info@brandwatch.kz'}
              </a>
              <a href={`tel:${settings.contacts?.whatsapp?.replace(/[^0-9+]/g, '') || '+77778115151'}`} className="contact-link phone">
                {settings.contacts?.whatsapp || '+7 777 811 5151'}
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">© 2025 {t('footer.copyright')}</p>
          <div className="footer-bottom-links">
            <Link to="/privacy">{t('footer.privacy')}</Link>
            <Link to="/offer">{t('footer.offer')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
