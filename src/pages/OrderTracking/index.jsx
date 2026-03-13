import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../features/auth/context/AuthContext';
import { useCurrency } from '../../shared/hooks/useCurrency';
import { supabase } from '../../services/supabase/client';
import { getProductImage } from '../../shared/utils/productImage';
import './OrderTracking.css';

const statusSteps = [
  { key: 'pending', label: 'Заказ принят', icon: '1', iconDone: '1' },
  { key: 'processing', label: 'Обрабатывается', icon: '2', iconDone: '2' },
  { key: 'shipped', label: 'Отправлен', icon: '3', iconDone: '3' },
  { key: 'delivered', label: 'Доставлен', icon: '4', iconDone: '4' },
];

const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];

const OrderTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { formatPrice } = useCurrency();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/catalog');
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;

        if (data.user_id && data.user_id !== user?.id) {
          setError('Заказ не найден');
          return;
        }

        setOrder(normalizeOrder(data));
      } catch (err) {
        console.error('Error fetching order:', err);
        setError('Не удалось загрузить заказ');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, user, isAuthenticated, navigate]);

  // Realtime подписка — автообновление статуса
  useEffect(() => {
    if (!id) return;

    const subscription = supabase
      .channel('order-' + id)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'orders',
        filter: 'id=eq.' + id
      }, (payload) => {
        setOrder(normalizeOrder(payload.new));
      })
      .subscribe();

    return () => supabase.removeChannel(subscription);
  }, [id]);

  const normalizeOrder = (o) => {
    if (!o) return o;
    return {
      ...o,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      userId: o.user_id,
      paymentMethod: o.payment_method,
      totalInKZT: o.total_in_kzt ?? o.total,
      trackingUrl: o.tracking_url,
      trackingAddedAt: o.tracking_added_at,
    };
  };

  const getStatusIndex = (status) => {
    return statusOrder.indexOf(status);
  };

  const isStepCompleted = (stepKey) => {
    const currentIndex = getStatusIndex(order?.status);
    const stepIndex = getStatusIndex(stepKey);
    return stepIndex <= currentIndex;
  };

  const isStepActive = (stepKey) => {
    return order?.status === stepKey;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getOrderTitle = () => {
    if (order?.status === 'shipped' || order?.status === 'delivered') {
      return 'Ваш заказ отправлен!';
    }
    return 'Заказ принят!';
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="order-tracking-page">
        <div className="order-tracking-container">
          <div className="order-tracking-loading">
            <div className="loading-spinner"></div>
            <p>Загрузка заказа...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-tracking-page">
        <div className="order-tracking-container">
          <div className="order-tracking-error">
            <span className="error-icon">!</span>
            <h2>{error || 'Заказ не найден'}</h2>
            <Link to="/profile" className="back-link">Вернуться в профиль</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-tracking-page">
      <div className="order-tracking-container">
        {/* Header */}
        <div className="order-tracking-header">
          <div className="order-status-badge" data-status={order.status}>
            {order.status === 'shipped' || order.status === 'delivered' ? '>' : ''}
          </div>
          <h1>{getOrderTitle()}</h1>
          <p className="order-id">Заказ #{String(order.id).slice(-8)}</p>
          <p className="order-date">{formatDate(order.createdAt)}</p>
        </div>

        {/* Status Timeline */}
        <div className="order-status-timeline">
          {statusSteps.map((step, index) => (
            <div
              key={step.key}
              className={`status-step ${isStepCompleted(step.key) ? 'completed' : ''} ${isStepActive(step.key) ? 'active' : ''}`}
            >
              <div className="step-indicator">
                <div className="step-circle">
                  {isStepCompleted(step.key) ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>
                {index < statusSteps.length - 1 && (
                  <div className={`step-line ${isStepCompleted(statusSteps[index + 1].key) ? 'completed' : ''}`}></div>
                )}
              </div>
              <span className="step-label">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Tracking Button */}
        {order.trackingUrl && (
          <div className="tracking-section">
            <a
              href={order.trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tracking-btn"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              Отследить заказ
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="7" y1="17" x2="17" y2="7"></line>
                <polyline points="7 7 17 7 17 17"></polyline>
              </svg>
            </a>
            <p className="tracking-hint">Нажмите, чтобы открыть страницу отслеживания</p>
          </div>
        )}

        {/* Order Items */}
        <div className="order-items-section">
          <h3>Состав заказа</h3>
          <div className="order-items-list">
            {order.items?.map((item, index) => (
              <div key={index} className="order-item">
                <img
                  src={getProductImage(item)}
                  alt={item.title || item.name}
                  className="item-image"
                />
                <div className="item-details">
                  <span className="item-brand">{item.brand}</span>
                  <span className="item-title">{item.title || item.name}</span>
                  <span className="item-qty">x{item.quantity}</span>
                </div>
                <span className="item-price">
                  {formatPrice((item.priceInKZT || item.price || 0) * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="order-summary">
            <div className="summary-row total">
              <span>Итого:</span>
              <span>{formatPrice(order.totalInKZT || order.total || 0)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        {order.customer && (
          <div className="delivery-info-section">
            <h3>Информация о доставке</h3>
            <div className="delivery-details">
              {order.customer.address && (
                <div className="detail-row">
                  <span className="detail-icon">*</span>
                  <span>{order.customer.address || order.customer.city}</span>
                </div>
              )}
              {order.customer.phone && (
                <div className="detail-row">
                  <span className="detail-icon">#</span>
                  <span>{order.customer.phone}</span>
                </div>
              )}
              {order.customer.name && (
                <div className="detail-row">
                  <span className="detail-icon">@</span>
                  <span>{order.customer.name}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back Link */}
        <div className="order-tracking-footer">
          <Link to="/profile" className="back-to-profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Мои заказы
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
