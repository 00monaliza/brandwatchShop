import React from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';
import './AdminPanel.css';

const AdminStatistics = () => {
  const { getStatistics } = useAdmin();
  const { formatPrice } = useCurrency();
  const stats = getStatistics();

  return (
    <div className="admin-statistics">
      <h2 className="admin-section-title">Статистика</h2>

      {/* Основные карточки */}
      <div className="stats-cards">
        <div className="stats-card">
          <div className="stats-card-info">
            <span className="stats-card-value">{stats.totalProducts}</span>
            <span className="stats-card-label">Товаров в продаже</span>
          </div>
        </div>

        <div className="stats-card archived-stat">
          <div className="stats-card-info">
            <span className="stats-card-value">{stats.archivedCount || 0}</span>
            <span className="stats-card-label">В архиве</span>
          </div>
        </div>

        <div className="stats-card">
          <div className="stats-card-info">
            <span className="stats-card-value">{stats.totalOrders}</span>
            <span className="stats-card-label">Всего заказов</span>
          </div>
        </div>

        <div className="stats-card highlight">
          <div className="stats-card-info">
            <span className="stats-card-value">{formatPrice(stats.totalRevenue || 0)}</span>
            <span className="stats-card-label">Выручка</span>
          </div>
        </div>

        <div className="stats-card warning">
          <div className="stats-card-info">
            <span className="stats-card-value">{stats.pendingOrders}</span>
            <span className="stats-card-label">Ожидают обработки</span>
          </div>
        </div>

        <div className="stats-card success">
          <div className="stats-card-info">
            <span className="stats-card-value">{stats.completedOrders}</span>
            <span className="stats-card-label">Выполнено</span>
          </div>
        </div>
      </div>

      <div className="stats-row">
        {/* График за 7 дней */}
        <div className="stats-chart-card">
          <h3>Заказы за последние 7 дней</h3>
          <div className="stats-chart">
            {stats.last7Days.map((day, index) => {
              const maxOrders = Math.max(...stats.last7Days.map(d => d.orders), 1);
              const height = (day.orders / maxOrders) * 100;
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short' });
              
              return (
                <div key={index} className="chart-bar-container">
                  <div className="chart-bar-value">{day.orders}</div>
                  <div 
                    className="chart-bar" 
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <div className="chart-bar-label">{dayName}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Топ товары */}
        <div className="stats-top-products">
          <h3>Топ товаров</h3>
          {stats.topProducts.length > 0 ? (
            <ul className="top-products-list">
              {stats.topProducts.map((product, index) => (
                <li key={product.id || index} className="top-product-item">
                  <span className="top-product-rank">#{index + 1}</span>
                  <div className="top-product-info">
                    <span className="top-product-name">{product.brand} {product.title}</span>
                    <span className="top-product-stats">
                      Продано: {product.totalSold} | {formatPrice(product.totalRevenue || 0)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-data">Пока нет данных о продажах</p>
          )}
        </div>
      </div>

      {/* Конверсия */}
      <div className="stats-conversion">
        <h3>Статусы заказов</h3>
        <div className="conversion-bars">
          <div className="conversion-item">
            <div className="conversion-label">
              <span>Выполнено</span>
              <span>{stats.completedOrders} из {stats.totalOrders}</span>
            </div>
            <div className="conversion-bar">
              <div 
                className="conversion-fill success"
                style={{ width: `${stats.totalOrders ? (stats.completedOrders / stats.totalOrders) * 100 : 0}%` }}
              />
            </div>
          </div>
          <div className="conversion-item">
            <div className="conversion-label">
              <span>В обработке</span>
              <span>{stats.pendingOrders} из {stats.totalOrders}</span>
            </div>
            <div className="conversion-bar">
              <div 
                className="conversion-fill warning"
                style={{ width: `${stats.totalOrders ? (stats.pendingOrders / stats.totalOrders) * 100 : 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStatistics;
