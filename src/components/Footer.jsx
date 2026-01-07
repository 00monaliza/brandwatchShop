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
              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer" className="social-icon whatsapp" aria-label="WhatsApp">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
              <a href={getTelegramLink()} target="_blank" rel="noopener noreferrer" className="social-icon telegram" aria-label="Telegram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.638z"/>
                </svg>
              </a>
              <a href={getInstagramLink()} target="_blank" rel="noopener noreferrer" className="social-icon instagram" aria-label="Instagram">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.999 3.999 0 110-8 3.999 3.999 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
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
