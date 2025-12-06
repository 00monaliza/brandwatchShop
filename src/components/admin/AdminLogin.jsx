import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import './AdminPanel.css';

const AdminLogin = ({ onSuccess, onClose }) => {
  const { adminLogin } = useAdmin();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Небольшая задержка для UX
    await new Promise(resolve => setTimeout(resolve, 500));

    const result = adminLogin(phone, password);
    
    if (result.success) {
      onSuccess(result.admin);
    } else {
      setError(result.error);
    }
    
    setIsLoading(false);
  };

  return (
    <div className="admin-login-overlay" onClick={onClose}>
      <div className="admin-login-modal" onClick={(e) => e.stopPropagation()}>
        <button className="admin-login-close" onClick={onClose}>×</button>
        
        <div className="admin-login-header">
          <span className="admin-login-icon"></span>
          <h2>Вход в админ-панель</h2>
          <p>Введите ваши учетные данные</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-login-field">
            <label>Номер телефона</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 XXX XXX XXXX"
              required
            />
          </div>

          <div className="admin-login-field">
            <label>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
            />
          </div>

          {error && (
            <div className="admin-login-error">
              ⚠️ {error}
            </div>
          )}

          <button 
            type="submit" 
            className="admin-login-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
