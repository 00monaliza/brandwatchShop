import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { showAdminToast } from '../../../shared/utils/toast';
import './AdminPanel.css';

const AdminUsers = () => {
  const { admins, currentAdmin, addAdmin, updateAdmin, deleteAdmin } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
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
        email: admin.email || ''
      });
    } else {
      setEditingAdmin(null);
      setFormData({
        name: '',
        phone: '',
        email: ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (editingAdmin) {
      // Обновление
      const updates = { name: formData.name, phone: formData.phone };
      const result = await updateAdmin(editingAdmin.id, updates);
      if (result.success) {
        setSuccess('Данные успешно обновлены!');
        showAdminToast.info('Администратор обновлён', `Данные ${formData.name} обновлены`);
        setTimeout(() => {
          handleCloseModal();
          setSuccess('');
        }, 1500);
      } else {
        setError(result.error);
        showAdminToast.error(result.error);
      }
    } else {
      // Добавление — по email зарегистрированного пользователя
      if (!formData.email) {
        setError('Укажите email зарегистрированного пользователя');
        return;
      }
      const result = await addAdmin({ email: formData.email, phone: formData.phone });
      if (result.success) {
        setSuccess('Администратор успешно добавлен!');
        showAdminToast.adminAdded(result.admin?.name || formData.email);
        setTimeout(() => {
          handleCloseModal();
          setSuccess('');
        }, 1500);
      } else {
        setError(result.error);
        showAdminToast.error(result.error);
      }
    }
  };

  const handleDelete = async (id) => {
    const admin = admins.find(a => a.id === id);
    if (window.confirm(`Удалить администратора "${admin?.name}"?`)) {
      const result = await deleteAdmin(id);
      if (result.success) {
        showAdminToast.adminDeleted(admin?.name);
      } else {
        showAdminToast.error(result.error);
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

              {!editingAdmin && (
                <div className="form-group">
                  <label>Email пользователя</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@example.com"
                    required
                  />
                </div>
              )}

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
