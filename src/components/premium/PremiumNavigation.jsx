import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import './PremiumNavigation.css';

const PremiumNavigation = ({
  logo,
  logoText = 'BRAND',
  menuItems = [],
  isTransparent = true,
  onCartClick,
  onFavoritesClick,
  onProfileClick,
  cartCount = 0,
  favoritesCount = 0
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const megaMenuVariants = {
    hidden: {
      opacity: 0,
      y: -10,
      transition: { duration: 0.2 }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
    }
  };

  return (
    <nav 
      ref={navRef}
      className={`premium-nav ${isScrolled ? 'scrolled' : ''} ${isTransparent ? 'transparent' : ''}`}
    >
      <div className="premium-nav__container">
        {/* Logo */}
        <Link to="/" className="premium-nav__logo">
          {logo ? (
            <img src={logo} alt={logoText} />
          ) : (
            <span className="premium-nav__logo-text">{logoText}</span>
          )}
        </Link>

        {/* Desktop Menu */}
        <div className="premium-nav__menu">
          {menuItems.map((item, index) => (
            <div 
              key={index}
              className="premium-nav__item"
              onMouseEnter={() => item.megaMenu && setActiveMenu(index)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link 
                to={item.link || '#'}
                className={`premium-nav__link ${activeMenu === index ? 'active' : ''}`}
              >
                {item.label}
                {item.megaMenu && (
                  <svg className="premium-nav__arrow" width="10" height="6" viewBox="0 0 10 6">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                )}
              </Link>

              {/* Mega Menu */}
              <AnimatePresence>
                {item.megaMenu && activeMenu === index && (
                  <motion.div
                    className="premium-nav__mega"
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    variants={megaMenuVariants}
                  >
                    <div className="premium-nav__mega-content">
                      {item.megaMenu.columns.map((column, colIndex) => (
                        <div key={colIndex} className="premium-nav__mega-column">
                          {column.title && (
                            <h4 className="premium-nav__mega-title">{column.title}</h4>
                          )}
                          <ul className="premium-nav__mega-list">
                            {column.items.map((subItem, subIndex) => (
                              <li key={subIndex}>
                                <Link to={subItem.link || '#'}>
                                  {subItem.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      {item.megaMenu.featured && (
                        <div className="premium-nav__mega-featured">
                          <img src={item.megaMenu.featured.image} alt={item.megaMenu.featured.title} />
                          <div className="premium-nav__mega-featured-content">
                            <h4>{item.megaMenu.featured.title}</h4>
                            <p>{item.megaMenu.featured.description}</p>
                            <Link to={item.megaMenu.featured.link || '#'}>
                              Подробнее
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="premium-nav__actions">
          <motion.button 
            className="premium-nav__action"
            onClick={onFavoritesClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="22" height="20" viewBox="0 0 22 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M11 19L2.5 10.5C0.5 8.5 0.5 5 2.5 3C4.5 1 8 1 10 3L11 4L12 3C14 1 17.5 1 19.5 3C21.5 5 21.5 8.5 19.5 10.5L11 19Z"/>
            </svg>
            {favoritesCount > 0 && (
              <span className="premium-nav__badge">{favoritesCount}</span>
            )}
          </motion.button>

          <motion.button 
            className="premium-nav__action"
            onClick={onCartClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="20" height="22" viewBox="0 0 20 22" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 7V5C4 2.79 6.24 1 10 1C13.76 1 16 2.79 16 5V7"/>
              <path d="M1 7H19V19C19 20.1 18.1 21 17 21H3C1.9 21 1 20.1 1 19V7Z"/>
            </svg>
            {cartCount > 0 && (
              <span className="premium-nav__badge">{cartCount}</span>
            )}
          </motion.button>

          <motion.button 
            className="premium-nav__action"
            onClick={onProfileClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg width="20" height="22" viewBox="0 0 20 22" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="6" r="5"/>
              <path d="M1 21V19C1 16.24 5.03 14 10 14C14.97 14 19 16.24 19 19V21"/>
            </svg>
          </motion.button>

          {/* Mobile Menu Toggle */}
          <button 
            className={`premium-nav__burger ${isMobileOpen ? 'active' : ''}`}
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className="premium-nav__mobile"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {menuItems.map((item, index) => (
              <div key={index} className="premium-nav__mobile-item">
                <Link 
                  to={item.link || '#'}
                  onClick={() => !item.megaMenu && setIsMobileOpen(false)}
                >
                  {item.label}
                </Link>
                {item.megaMenu && (
                  <div className="premium-nav__mobile-sub">
                    {item.megaMenu.columns.map((column, colIndex) => (
                      <div key={colIndex}>
                        {column.title && <h5>{column.title}</h5>}
                        {column.items.map((subItem, subIndex) => (
                          <Link 
                            key={subIndex}
                            to={subItem.link || '#'}
                            onClick={() => setIsMobileOpen(false)}
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default PremiumNavigation;
