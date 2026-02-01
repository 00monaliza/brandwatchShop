import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAdmin } from '../context/AdminContext';
import ProductCard from '../components/ProductCard';
import './Sales.css';

const Sales = () => {
  const { t } = useTranslation();
  const { products } = useAdmin();

  // Фильтруем только товары со скидкой
  const saleProducts = useMemo(() => {
    return products.filter(product => product.discount && product.discount > 0);
  }, [products]);

  // Группируем по размеру скидки
  const groupedByDiscount = useMemo(() => {
    const groups = {
      big: saleProducts.filter(p => p.discount >= 30),
      medium: saleProducts.filter(p => p.discount >= 15 && p.discount < 30),
      small: saleProducts.filter(p => p.discount > 0 && p.discount < 15)
    };
    return groups;
  }, [saleProducts]);

  return (
    <div className="sales-page">
      <main className="sales-main">
        {/* Hero Section */}
        <section className="sales-hero">
          <div className="sales-hero__content">
            <span className="sales-hero__badge">{t('sales.badge')}</span>
            <h1 className="sales-hero__title">{t('sales.title')}</h1>
            <p className="sales-hero__subtitle">{t('sales.subtitle')}</p>
          </div>
          <div className="sales-hero__decoration">
            <div className="sales-hero__circle sales-hero__circle--1"></div>
            <div className="sales-hero__circle sales-hero__circle--2"></div>
            <div className="sales-hero__circle sales-hero__circle--3"></div>
          </div>
        </section>

        {/* Большие скидки */}
        {groupedByDiscount.big.length > 0 && (
          <section className="sales-section">
            <div className="sales-section__header">
              <div className="sales-section__badge sales-section__badge--hot">
                🔥 {t('sales.bigDiscount')}
              </div>
              <h2 className="sales-section__title">{t('sales.upTo')} 50% {t('sales.off')}</h2>
            </div>
            <div className="sales-grid">
              {groupedByDiscount.big.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Средние скидки */}
        {groupedByDiscount.medium.length > 0 && (
          <section className="sales-section">
            <div className="sales-section__header">
              <div className="sales-section__badge sales-section__badge--medium">
                ⚡ {t('sales.mediumDiscount')}
              </div>
              <h2 className="sales-section__title">15-30% {t('sales.off')}</h2>
            </div>
            <div className="sales-grid">
              {groupedByDiscount.medium.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Малые скидки */}
        {groupedByDiscount.small.length > 0 && (
          <section className="sales-section">
            <div className="sales-section__header">
              <div className="sales-section__badge sales-section__badge--small">
                💎 {t('sales.smallDiscount')}
              </div>
              <h2 className="sales-section__title">{t('sales.upTo')} 15% {t('sales.off')}</h2>
            </div>
            <div className="sales-grid">
              {groupedByDiscount.small.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* Если нет товаров со скидками */}
        {saleProducts.length === 0 && (
          <section className="sales-empty">
            <div className="sales-empty__icon">🏷️</div>
            <h2 className="sales-empty__title">{t('sales.noSales')}</h2>
            <p className="sales-empty__text">{t('sales.noSalesText')}</p>
          </section>
        )}
      </main>
    </div>
  );
};

export default Sales;
