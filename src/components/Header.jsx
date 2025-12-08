import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';
import { LanguageSwitcher, MobileLanguageSwitcher } from './LanguageSwitcher';
import { ResponsiveLogo } from './OptimizedImage';
import './Header.css';

const Header = ({ onOpenAdmin }) => {
  const { t, i18n } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, favoritesCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { key: 'nav.main', path: '/' },
    { key: 'nav.catalog', path: '/catalog' },
    { key: 'nav.sales', path: '/sales' },
    { key: 'nav.aboutUs', path: '/about' },
    { key: 'nav.contacts', path: '/contacts' }
  ];

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      {/* Overlay for mobile menu */}
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      <div className="header-container">
        {/* Логотип */}
        <div className="logo">
          <Link to="/">
            <ResponsiveLogo context="header" className="logo-image" />
          </Link>
        </div>

        {/* Навигация */}
        <nav className={`nav ${menuOpen ? 'open' : ''}`}>
          <div className="nav-header">
            <span className="nav-title">Меню</span>
            <button className="close-menu-btn" onClick={() => setMenuOpen(false)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          {navItems.map(item => (
            <Link 
              key={item.key} 
              to={item.path} 
              className="nav-link"
              onClick={() => setMenuOpen(false)}
            >
              {t(item.key)}
            </Link>
          ))}
          <MobileLanguageSwitcher />
        </nav>

        {/* Правая часть */}
        <div className="header-right">
          {/* Переключатель языков (Desktop) */}
          <LanguageSwitcher />

          {/* Иконки */}
          <div className="header-icons">
            <button className="icon-btn" title={t('header.search')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
            </button>
            <Link to="/favorites" className="icon-btn" title={t('header.favorites')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              {favoritesCount > 0 && (
                <span className="icon-badge">{favoritesCount}</span>
              )}
            </Link>
            <Link to="/cart" className="icon-btn" title={t('header.cart')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {cartCount > 0 && (
                <span className="icon-badge">{cartCount}</span>
              )}
            </Link>

            {/* Кнопка админ-панели (видна только админам) */}
            {user?.role === 'admin' && (
              <button 
                className="icon-btn admin-btn"
                onClick={() => onOpenAdmin?.()}
                title="Админ-панель"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
              </button>
            )}

            {/* Кнопка профиля/авторизации */}
            {isAuthenticated ? (
              <div className="user-menu-container">
                <button 
                  className="icon-btn user-btn"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </button>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <span className="user-name">{user?.name}</span>
                      <span className="user-phone">{user?.phone}</span>
                    </div>
                    <button className="logout-btn" onClick={() => { logout(); setShowUserMenu(false); }}>
                      {t('auth.logout')}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button 
                className="icon-btn login-btn"
                onClick={() => setShowAuthModal(true)}
                title={t('auth.login')}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </button>
            )}
          </div>

          {/* Меню бургер */}
          <button 
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Модальное окно авторизации */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </header>
  );
};

export default Header;
