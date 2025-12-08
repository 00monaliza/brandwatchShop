import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminSettings from './AdminSettings';
import AdminStatistics from './AdminStatistics';
import AdminUsers from './AdminUsers';
import './AdminPanel.css';

const AdminPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('statistics');
  const { orders, currentAdmin, adminLogout } = useAdmin();

  const newOrdersCount = orders.filter(o => o.status === 'new').length;

  const tabs = [
    { id: 'statistics', label: 'Статистика', },
    { id: 'products', label: 'Товары', },
    { id: 'orders', label: 'Заказы', badge: newOrdersCount },
    { id: 'settings', label: 'Настройки', },
    { id: 'admins', label: 'Админы', }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'statistics':
        return <AdminStatistics />;
      case 'products':
        return <AdminProducts />;
      case 'orders':
        return <AdminOrders />;
      case 'settings':
        return <AdminSettings />;
      case 'admins':
        return <AdminUsers />;
      default:
        return <AdminStatistics />;
    }
  };

  const handleLogout = () => {
    adminLogout();
    onClose();
  };

  // Если не авторизован - ничего не показываем
  if (!currentAdmin) {
    return null;
  }

  return (
    <div className="admin-panel-overlay">
      <div className="admin-panel">
        <div className="admin-header">
          <h1>Панель Администратора</h1>
          <div className="admin-header-right">
            <div className="admin-user-info-header">
              <span className="admin-user-name-header">{currentAdmin.name}</span>
            </div>
            <button className="admin-logout-btn" onClick={handleLogout}>
              Выйти
            </button>
            <button className="admin-close-btn" onClick={onClose}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="admin-content">
          <nav className="admin-sidebar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`admin-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
                {tab.badge > 0 && (
                  <span className="nav-badge">{tab.badge}</span>
                )}
              </button>
            ))}
          </nav>

          <main className="admin-main">
            {renderContent()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
