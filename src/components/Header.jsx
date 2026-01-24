import React, { useState, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import AuthModal from './AuthModal';
import SearchModal from './SearchModal';
import { LanguageSwitcher, MobileLanguageSwitcher } from './LanguageSwitcher';
import { showToast } from '../utils/toast';
import defaultLogoImage from '../images/image.png';
import './Header.css';

const Header = memo(({ onOpenAdmin }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { cartCount, favoritesCount } = useCart();
  const { user, profile, isAuthenticated, logout } = useAuth();
  const { settings } = useSettings();

  const logoImage = useMemo(() => settings?.logo || defaultLogoImage, [settings?.logo]);
  const storeName = useMemo(() => settings?.storeName || 'brandwatch', [settings?.storeName]);

  const displayName = useMemo(() => 
    profile?.first_name || user?.name || user?.user_metadata?.name || '', 
    [profile?.first_name, user?.name, user?.user_metadata?.name]
  );
  const displayEmail = useMemo(() => 
    profile?.email || user?.email || '', 
    [profile?.email, user?.email]
  );
  const displayPhone = useMemo(() => 
    profile?.phone || user?.phone || '', 
    [profile?.phone, user?.phone]
  );

  React.useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = useMemo(() => [
    { key: 'nav.main', path: '/' },
    { key: 'nav.catalog', path: '/catalog' },
    { key: 'nav.sales', path: '/sales' },
    { key: 'nav.aboutUs', path: '/about' },
    { key: 'nav.contacts', path: '/contacts' }
  ], []);

  const handleLogout = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowUserMenu(false);
    try {
      await logout();
      showToast.logoutSuccess();
    } catch (err) {
      console.error('Logout error:', err);
    }
  }, [logout]);

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      {/* Overlay for mobile menu */}
      <div className={`menu-overlay ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(false)} />

      <div className="header-container">
        {/* Логотип */}
        <div className="logo">
          <Link to="/">
            <img src={logoImage} alt={storeName} className="logo-image" />
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
            <button className="icon-btn" title={t('header.search')} onClick={() => setShowSearchModal(true)}>
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
                      <span className="user-name">{displayName || t('profile.user')}</span>
                      <span className="user-phone">{displayEmail || displayPhone}</span>
                    </div>
                    <div className="user-dropdown-links">
                      <button 
                        className="dropdown-link"
                        onClick={() => {
                          navigate('/profile');
                          setShowUserMenu(false);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                          <circle cx="12" cy="7" r="4"/>
                        </svg>
                        {t('profile.myProfile')}
                      </button>
                      <button 
                        className="dropdown-link"
                        onClick={() => {
                          navigate('/favorites');
                          setShowUserMenu(false);
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                        </svg>
                        {t('profile.favorites')}
                      </button>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                        <polyline points="16 17 21 12 16 7"/>
                        <line x1="21" y1="12" x2="9" y2="12"/>
                      </svg>
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

      {/* Модальное окно поиска */}
      <SearchModal 
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
