import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import './AdminPanel.css';

const AdminUsers = () => {
  const { admins, currentAdmin, addAdmin, updateAdmin, deleteAdmin } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleOpenModal = (admin = null) => {
    setError('');
    setSuccess('');
    if (admin) {
      setEditingAdmin(admin);
      setFormData({
        name: admin.name,
        phone: admin.phone,
        password: ''
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        phone: '',
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAdmin(null);
    setError('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (editingAdmin) {
      // Обновление
      const updates = { name: formData.name, phone: formData.phone };
      if (formData.password) {
        updates.password = formData.password;
      }
      const result = updateAdmin(editingAdmin.id, updates);
      if (result.success) {
        setSuccess('Данные успешно обновлены!');
        setTimeout(() => {
          handleCloseModal();
          setSuccess('');
        }, 1500);
      } else {
        setError(result.error);
      }
    } else {
      // Добавление
      if (!formData.password) {
        setError('Укажите пароль для нового администратора');
        return;
      }
      const result = addAdmin(formData);
      if (result.success) {
        setSuccess('Администратор успешно добавлен!');
        setTimeout(() => {
          handleCloseModal();
          setSuccess('');
        }, 1500);
      } else {
        setError(result.error);
      }
    }
  };

  const handleDelete = (id) => {
    const admin = admins.find(a => a.id === id);
    if (window.confirm(`Удалить администратора "${admin?.name}"?`)) {
      const result = deleteAdmin(id);
      if (!result.success) {
        alert(result.error);
      }
    }
  };

  return (
    <div className="admin-users">
      <div className="admin-users-header">
        <h2 className="admin-section-title">👥 Управление администраторами</h2>
        <button className="admin-add-btn" onClick={() => handleOpenModal()}>
          + Добавить админа
        </button>
      </div>

      <div className="admin-users-list">
        {admins.map(admin => (
          <div 
            key={admin.id} 
            className={`admin-user-card ${currentAdmin?.id === admin.id ? 'current' : ''}`}
          >
            <div className="admin-user-avatar">
              {admin.name.charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-info">
              <h3 className="admin-user-name">
                {admin.name}
                {currentAdmin?.id === admin.id && (
                  <span className="current-badge">Это вы</span>
                )}
              </h3>
              <p className="admin-user-phone">{admin.phone}</p>
            </div>
            <div className="admin-user-actions">
              <button 
                className="admin-edit-btn"
                onClick={() => handleOpenModal(admin)}
              >
                Редактировать
              </button>
              {currentAdmin?.id !== admin.id && (
                <button 
                  className="admin-delete-btn"
                  onClick={() => handleDelete(admin.id)}
                >
                  🗑️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingAdmin ? 'Редактировать администратора' : 'Добавить администратора'}</h3>
              <button className="admin-modal-close" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="form-group">
                <label>Имя</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Введите имя"
                  required
                />
              </div>

              <div className="form-group">
                <label>Номер телефона</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+7 XXX XXX XXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label>{editingAdmin ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль'}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={editingAdmin ? 'Введите новый пароль' : 'Придумайте пароль'}
                  required={!editingAdmin}
                />
              </div>

              {error && (
                <div className="admin-form-error">
                  {error}
                </div>
              )}

              {success && (
                <div className="admin-form-success">
                  {success}
                </div>
              )}

              <div className="admin-modal-actions">
                <button type="button" className="admin-cancel-btn" onClick={handleCloseModal}>
                  Отмена
                </button>
                <button type="submit" className="admin-save-btn">
                  {editingAdmin ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
