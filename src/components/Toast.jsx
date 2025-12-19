import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import './Toast.css';

// Toast Manager - синглтон для управления уведомлениями
let toastListeners = [];
let toastId = 0;

const addToastListener = (listener) => {
  toastListeners.push(listener);
  return () => {
    toastListeners = toastListeners.filter(l => l !== listener);
  };
};

const notifyListeners = (toast) => {
  toastListeners.forEach(listener => listener(toast));
};

// Функция для добавления toast
export const addToast = ({ title, description, color = 'default', timeout = 3000, icon }) => {
  const id = ++toastId;
  notifyListeners({ id, title, description, color, timeout, icon });
  return id;
};

// Toast иконки
const ToastIcon = ({ color }) => {
  switch (color) {
    case 'success':
      return <CheckCircle size={20} />;
    case 'danger':
      return <XCircle size={20} />;
    case 'warning':
      return <AlertTriangle size={20} />;
    case 'primary':
      return <Info size={20} />;
    default:
      return <Info size={20} />;
  }
};

// Отдельный Toast компонент
const Toast = ({ toast, onRemove }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const duration = toast.timeout;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining > 0) {
        requestAnimationFrame(updateProgress);
      }
    };

    const progressFrame = requestAnimationFrame(updateProgress);

    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onRemove(toast.id), 300);
    }, duration);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(progressFrame);
    };
  }, [toast, onRemove]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div className={`toast toast--${toast.color} ${isExiting ? 'toast--exit' : ''}`}>
      <div className="toast__icon">
        <ToastIcon color={toast.color} />
      </div>
      <div className="toast__content">
        <div className="toast__title">{toast.title}</div>
        {toast.description && (
          <div className="toast__description">{toast.description}</div>
        )}
      </div>
      <button className="toast__close" onClick={handleClose}>
        <X size={16} />
      </button>
      <div className="toast__progress">
        <div 
          className="toast__progress-bar" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// Container для всех Toast
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = addToastListener((toast) => {
      setToasts(prev => [...prev, toast]);
    });

    return unsubscribe;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;
