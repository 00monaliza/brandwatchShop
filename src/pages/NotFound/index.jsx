import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './NotFound.css';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">{t('notFound.title', 'Страница не найдена')}</h2>
        <p className="not-found-text">{t('notFound.text', 'Запрашиваемая страница не существует или была перемещена.')}</p>
        <div className="not-found-actions">
          <Link to="/" className="not-found-home-btn">
            {t('notFound.goHome', 'На главную')}
          </Link>
          <Link to="/catalog" className="not-found-catalog-btn">
            {t('notFound.goCatalog', 'В каталог')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
