import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useCurrency } from '../../../shared/hooks/useCurrency';
import { showAdminToast } from '../../../shared/utils/toast';
import { getProductImage } from '../../../shared/utils/productImage';
import './AdminPanel.css';

const AdminOrders = () => {
  const { orders, updateOrderStatus, updateOrderTracking } = useAdmin();
  const { formatPrice } = useCurrency();
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingUrl, setTrackingUrl] = useState('');
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  const statusLabels = {
    pending: { label: 'Новый', color: '#f39c12' },
    processing: { label: 'В обработке', color: '#3498db' },
    shipped: { label: 'Отправлен', color: '#9b59b6' },
    delivered: { label: 'Доставлен', color: '#27ae60' },
    cancelled: { label: 'Отменён', color: '#e74c3c' }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      showAdminToast.orderStatusChanged(orderId, newStatus);
    } catch (err) {
      showAdminToast.error('Ошибка при обновлении статуса');
    }
  };

  const handleOpenOrder = (order) => {
    setSelectedOrder(order);
    setTrackingUrl(order.trackingUrl || order.tracking_url || '');
  };

  const handleCloseOrder = () => {
    setSelectedOrder(null);
    setTrackingUrl('');
  };

  const handleSaveTracking = async () => {
    if (!trackingUrl.trim()) {
      showAdminToast.error('Введите ссылку для отслеживания');
      return;
    }

    setIsSavingTracking(true);
    try {
      await updateOrderTracking(selectedOrder.id, trackingUrl.trim());
      showAdminToast.success('Ссылка сохранена, уведомление отправлено!');
      // Обновляем selectedOrder с новыми данными
      setSelectedOrder(prev => ({
        ...prev,
        trackingUrl: trackingUrl.trim(),
        tracking_url: trackingUrl.trim(),
        status: 'shipped'
      }));
    } catch (err) {
      showAdminToast.error('Ошибка при сохранении ссылки');
    } finally {
      setIsSavingTracking(false);
    }
  };

  const getWhatsAppUrl = (order) => {
    const phone = order.customer?.phone?.replace(/[\s\-()+]/g, '');
    if (!phone) return null;
    const trackingLink = order.trackingUrl || order.tracking_url;
    const name = order.customer?.name || 'Покупатель';
    const message = encodeURIComponent(
      `Здравствуйте, ${name}!\n\n` +
      `Ваш заказ #${String(order.id).slice(-8)} в BrandWatch отправлен!\n\n` +
      `Ссылка для отслеживания:\n${trackingLink}\n\n` +
      `Спасибо за покупку!`
    );
    return `https://wa.me/${phone}?text=${message}`;
  };

  return (
    <div className="admin-orders">
      <h2 className="admin-section-title">Управление заказами</h2>

      {/* Фильтры */}
      <div className="admin-orders-filters">
        <button 
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          Все ({orders.length})
        </button>
        {Object.entries(statusLabels).map(([status, { label }]) => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <button
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Список заказов */}
      {filteredOrders.length === 0 ? (
        <div className="no-orders">
          <span className="no-orders-icon">📭</span>
          <p>Заказов пока нет</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {filteredOrders.map(order => (
            <div key={order.id} className="admin-order-card">
              <div className="order-card-header">
                <div className="order-info">
                  <span className="order-id">#{order.id}</span>
                  <span className="order-date">{formatDate(order.createdAt)}</span>
                </div>
                <div 
                  className="order-status"
                  style={{ backgroundColor: statusLabels[order.status]?.color || '#888' }}
                >
                  {statusLabels[order.status]?.label}
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-customer">
                  <h4>Покупатель</h4>
                  <p>{order.customer?.name || 'Не указано'}</p>
                  <p>📱 {order.customer?.phone || 'Не указано'}</p>
                  {order.customer?.address && <p>📍 {order.customer.address}</p>}
                </div>

                <div className="order-items-preview">
                  <h4>Товары ({order.items?.length || 0})</h4>
                  <div className="order-items-list">
                    {order.items?.slice(0, 2).map((item, index) => (
                      <div key={index} className="order-item-mini">
                        <img src={getProductImage(item)} alt={item.title} />
                        <span>{item.brand} {item.title}</span>
                        <span className="item-qty">×{item.quantity}</span>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <span className="more-items">+{order.items.length - 2} ещё</span>
                    )}
                  </div>
                </div>

                <div className="order-total">
                  <h4>Сумма</h4>
                  <span className="total-amount">{formatPrice(order.totalInKZT || order.total || 0)}</span>
                  <p className="payment-method">{order.paymentMethod || 'Не указано'}</p>
                </div>
              </div>

              <div className="order-card-actions">
                <button
                  className="view-details-btn"
                  onClick={() => handleOpenOrder(order)}
                >
                  Подробнее
                </button>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  className="status-select"
                  style={{ borderColor: statusLabels[order.status]?.color }}
                >
                  {Object.entries(statusLabels).map(([status, { label }]) => (
                    <option key={status} value={status}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модальное окно деталей заказа */}
      {selectedOrder && (
        <div className="admin-modal-overlay" onClick={handleCloseOrder}>
          <div className="admin-modal order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Заказ #{String(selectedOrder.id).slice(-8)}</h3>
              <button className="admin-modal-close" onClick={handleCloseOrder}>x</button>
            </div>

            <div className="order-details-content">
              <div className="detail-section">
                <h4>Информация о покупателе</h4>
                <div className="detail-grid">
                  <div><strong>Имя:</strong> {selectedOrder.customer?.name}</div>
                  <div><strong>Телефон:</strong> {selectedOrder.customer?.phone}</div>
                  <div><strong>Email:</strong> {selectedOrder.customer?.email || '—'}</div>
                  <div><strong>Адрес:</strong> {selectedOrder.customer?.address || '—'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Товары в заказе</h4>
                <div className="order-items-full">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item-full">
                      <img src={getProductImage(item)} alt={item.title} />
                      <div className="item-info">
                        <span className="item-brand">{item.brand}</span>
                        <span className="item-title">{item.title}</span>
                        <span className="item-price">
                          {formatPrice(item.priceInKZT || item.price || 0)} x {item.quantity}
                        </span>
                      </div>
                      <span className="item-total">
                        {formatPrice((item.priceInKZT || item.price || 0) * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-section">
                <h4>Оплата и доставка</h4>
                <div className="detail-grid">
                  <div><strong>Способ оплаты:</strong> {selectedOrder.paymentMethod}</div>
                  <div><strong>Дата заказа:</strong> {formatDate(selectedOrder.createdAt)}</div>
                  <div>
                    <strong>Статус:</strong>
                    <span style={{ color: statusLabels[selectedOrder.status]?.color, marginLeft: '8px' }}>
                      {statusLabels[selectedOrder.status]?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Секция трек-ссылки */}
              <div className="detail-section tracking-section">
                <h4>Ссылка для отслеживания</h4>
                <div className="tracking-input-group">
                  <input
                    type="url"
                    placeholder="https://track.kazpost.kz/..."
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    className="tracking-input"
                  />
                  <button
                    className="tracking-save-btn"
                    onClick={handleSaveTracking}
                    disabled={isSavingTracking}
                  >
                    {isSavingTracking ? 'Сохранение...' : 'Сохранить'}
                  </button>
                </div>
                {(selectedOrder.trackingUrl || selectedOrder.tracking_url) && (
                  <div className="tracking-actions">
                    <a
                      href={selectedOrder.trackingUrl || selectedOrder.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="tracking-link"
                    >
                      Открыть ссылку
                    </a>
                    {selectedOrder.customer?.phone && (
                      <a
                        href={getWhatsAppUrl(selectedOrder)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-btn"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                )}
                <p className="tracking-hint">
                  При сохранении пользователю автоматически отправится Email и WhatsApp уведомление
                </p>
              </div>

              <div className="order-total-section">
                <span>Итого:</span>
                <span className="total-big">{formatPrice(selectedOrder.totalInKZT || selectedOrder.total || 0)}</span>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                className="admin-cancel-btn"
                onClick={handleCloseOrder}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
