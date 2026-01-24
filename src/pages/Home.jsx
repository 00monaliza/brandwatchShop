import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HeroVideo from '../components/HeroVideo';
import ProductGrid from '../components/ProductGrid';
import { useAdmin } from '../context/AdminContext';
import './Home.css';

const Home = () => {
  const { t } = useTranslation();
  const { products } = useAdmin();
  
  // Получаем новинки и популярные товары (мемоизировано)
  const newProducts = useMemo(() => products.filter(p => p.isNew).slice(0, 4), [products]);
  const popularProducts = useMemo(() => products.slice(0, 8), [products]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <HeroVideo />

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <h3>{t('home.features.authentic')}</h3>
              <p>{t('home.features.authenticDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>{t('home.features.warranty')}</h3>
              <p>{t('home.features.warrantyDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
              </div>
              <h3>{t('home.features.delivery')}</h3>
              <p>{t('home.features.deliveryDesc')}</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                </svg>
              </div>
              <h3>{t('home.features.support')}</h3>
              <p>{t('home.features.supportDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      {newProducts.length > 0 && (
        <section className="products-section">
          <div className="container">
            <div className="section-header">
              <h2>{t('home.newArrivals')}</h2>
              <Link to="/catalog" className="view-all-link">
                {t('home.viewAll')} →
              </Link>
            </div>
            <ProductGrid products={newProducts} />
          </div>
        </section>
      )}

      {/* Popular Products Section */}
      <section className="products-section">
        <div className="container">
          <div className="section-header">
            <h2>{t('home.popular')}</h2>
            <Link to="/catalog" className="view-all-link">
              {t('home.viewAll')} →
            </Link>
          </div>
          <ProductGrid products={popularProducts} />
        </div>
      </section>

      {/* Brands Section */}
      <section className="brands-section">
        <div className="container">
          <h2>{t('home.brands')}</h2>
          <div className="brands-grid">
            {['Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet', 'Cartier', 'IWC'].map(brand => (
              <Link 
                key={brand} 
                to={`/catalog?brand=${brand}`} 
                className="brand-card"
              >
                <span>{brand}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>{t('home.cta.title')}</h2>
            <p>{t('home.cta.subtitle')}</p>
            <Link to="/catalog" className="cta-button">
              {t('home.cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
