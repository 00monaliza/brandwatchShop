import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { showAdminToast } from '../../utils/toast';
import './AdminPanel.css';

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useAdmin();
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

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

  const handleStatusChange = (orderId, newStatus) => {
    updateOrderStatus(orderId, newStatus);
    showAdminToast.orderStatusChanged(orderId, newStatus);
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
        {Object.entries(statusLabels).map(([status, { label, icon }]) => {
          const count = orders.filter(o => o.status === status).length;
          return (
            <button 
              key={status}
              className={`filter-btn ${filterStatus === status ? 'active' : ''}`}
              onClick={() => setFilterStatus(status)}
            >
              {icon} {label} ({count})
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
                  {statusLabels[order.status]?.icon} {statusLabels[order.status]?.label}
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-customer">
                  <h4>👤 Покупатель</h4>
                  <p>{order.customer?.name || 'Не указано'}</p>
                  <p>📱 {order.customer?.phone || 'Не указано'}</p>
                  {order.customer?.address && <p>📍 {order.customer.address}</p>}
                </div>

                <div className="order-items-preview">
                  <h4>🛒 Товары ({order.items?.length || 0})</h4>
                  <div className="order-items-list">
                    {order.items?.slice(0, 2).map((item, index) => (
                      <div key={index} className="order-item-mini">
                        <img src={item.image} alt={item.title} />
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
                  <h4>💰 Сумма</h4>
                  <span className="total-amount">${order.total?.toLocaleString()}</span>
                  <p className="payment-method">{order.paymentMethod || 'Не указано'}</p>
                </div>
              </div>

              <div className="order-card-actions">
                <button 
                  className="view-details-btn"
                  onClick={() => setSelectedOrder(order)}
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
        <div className="admin-modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="admin-modal order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Заказ #{selectedOrder.id}</h3>
              <button className="admin-modal-close" onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className="order-details-content">
              <div className="detail-section">
                <h4>Информация о покупателе</h4>
                <div className="detail-grid">
                  <div><strong>Имя:</strong> {selectedOrder.customer?.name}</div>
                  <div><strong>Телефон:</strong> {selectedOrder.customer?.phone}</div>
                  <div><strong>Адрес:</strong> {selectedOrder.customer?.address || '—'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Товары в заказе</h4>
                <div className="order-items-full">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="order-item-full">
                      <img src={item.image} alt={item.title} />
                      <div className="item-info">
                        <span className="item-brand">{item.brand}</span>
                        <span className="item-title">{item.title}</span>
                        <span className="item-price">${item.price} × {item.quantity}</span>
                      </div>
                      <span className="item-total">${item.price * item.quantity}</span>
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
                      {statusLabels[selectedOrder.status]?.icon} {statusLabels[selectedOrder.status]?.label}
                    </span>
                  </div>
                </div>
              </div>

              <div className="order-total-section">
                <span>Итого:</span>
                <span className="total-big">${selectedOrder.total?.toLocaleString()}</span>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button 
                className="admin-cancel-btn" 
                onClick={() => setSelectedOrder(null)}
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
