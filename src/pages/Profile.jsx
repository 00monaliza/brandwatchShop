import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../hooks/useCurrency';
import { showToast } from '../utils/toast';
import './Profile.css';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, logout, updateProfile } = useAuth();
  const { cartItems, favoritesCount } = useCart();
  const { formatPrice } = useCurrency();
  
  const [activeTab, setActiveTab] = useState('info');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [saving, setSaving] = useState(false);

  const getUserName = () => {
    if (profile?.first_name) return profile.first_name;
    if (user?.name) return user.name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    return '';
  };

  const getUserEmail = () => {
    if (profile?.email) return profile.email;
    if (user?.email) return user.email;
    return '';
  };

  const getUserPhone = () => {
    if (profile?.phone) return profile.phone;
    if (user?.phone) return user.phone;
    return '';
  };


  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/catalog');
    }
  }, [isAuthenticated, navigate]);

  // Заполняем форму данными пользователя
  useEffect(() => {
    if (user || profile) {
      setFormData({
        name: getUserName(),
        email: getUserEmail(),
        phone: getUserPhone(),
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, profile]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // Используем функции для получения данных
  const displayName = getUserName();
  const displayEmail = getUserEmail();
  const displayPhone = getUserPhone();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await updateProfile(formData);
      if (result?.success) {
        showToast.success(t('profile.profileUpdated'), t('profile.profileUpdatedDesc'));
        setIsEditing(false);
      } else {
        showToast.error(result?.error || t('profile.updateError'));
      }
    } catch (err) {
      showToast.error(t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      showToast.logoutSuccess();
      navigate('/catalog');
    } catch (err) {
      console.error('Logout error:', err);
      showToast.error('Ошибка при выходе');
    }
  };

  const tabs = [
    { id: 'info', label: t('profile.personalInfo') },
    { id: 'orders', label: t('profile.orders')},
    { id: 'favorites', label: t('profile.favorites')},
    { id: 'settings', label: t('profile.settings')},
  ];

  // Моковые заказы для демонстрации
  const orders = user.orders || [];

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-avatar">
            <div className="avatar-circle">
              {displayName ? displayName.charAt(0).toUpperCase() : '👤'}
            </div>
            <h2 className="profile-name">{displayName || t('profile.user')}</h2>
            <p className="profile-email">{displayEmail || displayPhone}</p>
          </div>

          <nav className="profile-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`profile-nav-btn ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          <button className="profile-logout-btn" onClick={handleLogout}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            {t('profile.logout')}
          </button>
        </aside>

        {/* Main Content */}
        <main className="profile-content">
          {/* Personal Info Tab */}
          {activeTab === 'info' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>{t('profile.personalInfo')}</h2>
                {!isEditing ? (
                  <button className="edit-btn" onClick={() => setIsEditing(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    {t('profile.edit')}
                  </button>
                ) : (
                  <div className="edit-actions">
                    <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                      {t('profile.cancel')}
                    </button>
                    <button className="save-btn" onClick={handleSave} disabled={saving}>
                      {saving ? t('profile.saving') : t('profile.save')}
                    </button>
                  </div>
                )}
              </div>

              <div className="info-grid">
                <div className="info-item">
                  <label>{t('profile.name')}</label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t('profile.enterName')}
                    />
                  ) : (
                    <p>{displayName || '—'}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>{t('profile.email')}</label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('profile.enterEmail')}
                    />
                  ) : (
                    <p>{displayEmail || '—'}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>{t('profile.phone')}</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={t('profile.enterPhone')}
                    />
                  ) : (
                    <p>{displayPhone || '—'}</p>
                  )}
                </div>

                <div className="info-item">
                  <label>{t('profile.memberSince')}</label>
                  <p>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString('ru-RU') : 
                      user?.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : '—'}</p>
                </div>
              </div>

              {/* Stats */}
              <div className="profile-stats">
                <div className="stat-card">
                  {/* <span className="stat-icon">🛒</span> */}
                  <div className="stat-info">
                    <span className="stat-value">{cartItems?.length || 0}</span>
                    <span className="stat-label">{t('profile.inCart')}</span>
                  </div>
                </div>
                <div className="stat-card">
                  {/* <span className="stat-icon">❤️</span> */}
                  <div className="stat-info">
                    <span className="stat-value">{favoritesCount || 0}</span>
                    <span className="stat-label">{t('profile.inFavorites')}</span>
                  </div>
                </div>
                <div className="stat-card">
                  {/* <span className="stat-icon">📦</span> */}
                  <div className="stat-info">
                    <span className="stat-value">{orders.length}</span>
                    <span className="stat-label">{t('profile.totalOrders')}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="profile-section">
              <h2>{t('profile.orderHistory')}</h2>
              
              {orders.length === 0 ? (
                <div className="empty-state">
                  {/* <span className="empty-icon">📦</span> */}
                  <h3>{t('profile.noOrders')}</h3>
                  <p>{t('profile.noOrdersDesc')}</p>
                  <button className="shop-btn" onClick={() => navigate('/catalog')}>
                    {t('profile.goShopping')}
                  </button>
                </div>
              ) : (
                <div className="orders-list">
                  {orders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <span className="order-id">#{order.id}</span>
                        <span className={`order-status status-${order.status}`}>
                          {t(`profile.orderStatus.${order.status}`)}
                        </span>
                      </div>
                      <div className="order-info">
                        <span className="order-date">
                          {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                        </span>
                        <span className="order-total">
                          {formatPrice(order.totalInKZT || order.total || 0)}
                        </span>
                      </div>
                      <div className="order-items">
                        {order.items?.slice(0, 3).map((item, idx) => (
                          <span key={idx} className="order-item-name">{item.name}</span>
                        ))}
                        {order.items?.length > 3 && (
                          <span className="order-more">+{order.items.length - 3} ещё</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Favorites Tab */}
          {activeTab === 'favorites' && (
            <div className="profile-section">
              <h2>{t('profile.myFavorites')}</h2>
              <div className="favorites-redirect">
                <p>{t('profile.favoritesDesc')}</p>
                <button className="view-btn" onClick={() => navigate('/favorites')}>
                  {t('profile.viewFavorites')}
                </button>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="profile-section">
              <h2>{t('profile.accountSettings')}</h2>
              
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <h4>{t('profile.notifications')}</h4>
                    <p>{t('profile.notificationsDesc')}</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" defaultChecked />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item">
                  <div className="setting-info">
                    <h4>{t('profile.emailNotifications')}</h4>
                    <p>{t('profile.emailNotificationsDesc')}</p>
                  </div>
                  <label className="toggle">
                    <input type="checkbox" />
                    <span className="toggle-slider"></span>
                  </label>
                </div>

                <div className="setting-item danger">
                  <div className="setting-info">
                    <h4>{t('profile.deleteAccount')}</h4>
                    <p>{t('profile.deleteAccountDesc')}</p>
                  </div>
                  <button className="delete-btn">
                    {t('profile.delete')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Profile;
