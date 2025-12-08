import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './PremiumFooter.css';

const PremiumFooter = ({
  logo,
  logoText = 'BRAND',
  columns = [],
  socialLinks = [],
  newsletter = true,
  copyright = '© 2024 Все права защищены'
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
    }
  };

  return (
    <footer className="premium-footer">
      <div className="premium-footer__container">
        <motion.div
          className="premium-footer__content"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          {/* Brand Column */}
          <motion.div className="premium-footer__brand" variants={itemVariants}>
            <Link to="/" className="premium-footer__logo">
              {logo ? (
                <img src={logo} alt={logoText} />
              ) : (
                <span>{logoText}</span>
              )}
            </Link>
            <p className="premium-footer__tagline">
              Искусство точного времени.<br />
              Наследие превосходства.
            </p>

            {/* Social Links */}
            <div className="premium-footer__social">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="premium-footer__social-link"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Link Columns */}
          {columns.map((column, index) => (
            <motion.div key={index} className="premium-footer__column" variants={itemVariants}>
              <h4 className="premium-footer__column-title">{column.title}</h4>
              <ul className="premium-footer__links">
                {column.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link to={link.url || '#'}>{link.label}</Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter */}
          {newsletter && (
            <motion.div className="premium-footer__newsletter" variants={itemVariants}>
              <h4 className="premium-footer__column-title">Подпишитесь</h4>
              <p className="premium-footer__newsletter-text">
                Получайте эксклюзивные предложения и новости о коллекциях первыми
              </p>
              <form onSubmit={handleSubscribe} className="premium-footer__form">
                <input
                  type="email"
                  placeholder="Ваш email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="premium-footer__input"
                  required
                />
                <motion.button
                  type="submit"
                  className="premium-footer__submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {subscribed ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="4 10 8 14 16 6"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 10h16M12 4l6 6-6 6"/>
                    </svg>
                  )}
                </motion.button>
              </form>
              {subscribed && (
                <motion.p 
                  className="premium-footer__success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  Спасибо за подписку!
                </motion.p>
              )}
            </motion.div>
          )}
        </motion.div>

        {/* Bottom Bar */}
        <div className="premium-footer__bottom">
          <p className="premium-footer__copyright">{copyright}</p>
          <div className="premium-footer__legal">
            <Link to="/privacy">Политика конфиденциальности</Link>
            <Link to="/terms">Условия использования</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PremiumFooter;
