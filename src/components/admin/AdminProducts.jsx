import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import './AdminPanel.css';

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    brand: '',
    title: '',
    price: '',
    originalPrice: '',
    image: '',
    category: '',
    gender: 'унисекс',
    description: ''
  });

  const filteredProducts = products.filter(product => 
    product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        brand: product.brand || '',
        title: product.title || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        image: product.image || '',
        category: product.category || '',
        gender: product.gender || 'унисекс',
        description: product.description || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({
        brand: '',
        title: '',
        price: '',
        originalPrice: '',
        image: '',
        category: '',
        gender: 'унисекс',
        description: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    handleCloseModal();
  };

  const handleDelete = (productId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      deleteProduct(productId);
    }
  };

  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round((1 - price / originalPrice) * 100);
  };

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h2 className="admin-section-title">Управление товарами</h2>
        <button className="admin-add-btn" onClick={() => handleOpenModal()}>
          + Добавить товар
        </button>
      </div>

      <div className="admin-search">
        <input
          type="text"
          placeholder="Поиск товаров..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="admin-search-input"
        />
      </div>

      <div className="admin-products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="admin-product-card">
            <div className="admin-product-image">
              <img src={product.image} alt={product.title} />
              {calculateDiscount(product.price, product.originalPrice) && (
                <span className="admin-product-discount">
                  -{calculateDiscount(product.price, product.originalPrice)}%
                </span>
              )}
            </div>
            <div className="admin-product-info">
              <h3 className="admin-product-brand">{product.brand}</h3>
              <p className="admin-product-title">{product.title}</p>
              <div className="admin-product-price">
                <span className="current-price">${product.price}</span>
                {product.originalPrice && (
                  <span className="original-price">${product.originalPrice}</span>
                )}
              </div>
            </div>
            <div className="admin-product-actions">
              <button 
                className="admin-edit-btn"
                onClick={() => handleOpenModal(product)}
              >
                Редактировать
              </button>
              <button 
                className="admin-delete-btn"
                onClick={() => handleDelete(product.id)}
              >
                Удалить
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="admin-modal-overlay" onClick={handleCloseModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{editingProduct ? 'Редактировать товар' : 'Добавить товар'}</h3>
              <button className="admin-modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Бренд *</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    required
                    placeholder="Rolex, Omega, Patek Philippe..."
                  />
                </div>
                <div className="form-group">
                  <label>Название *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Submariner Date"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Цена ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="15000"
                  />
                </div>
                <div className="form-group">
                  <label>Старая цена ($) - для скидки</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="18000"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>URL изображения *</label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  required
                  placeholder="https://example.com/watch.jpg"
                />
                {formData.image && (
                  <div className="image-preview">
                    <img src={formData.image} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Категория</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Выберите категорию</option>
                    <option value="luxury">Люкс</option>
                    <option value="sport">Спорт</option>
                    <option value="classic">Классика</option>
                    <option value="casual">Повседневные</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Пол</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                  >
                    <option value="унисекс">Унисекс</option>
                    <option value="мужские">Мужские</option>
                    <option value="женские">Женские</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Описание</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Описание товара..."
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-cancel-btn" onClick={handleCloseModal}>
                  Отмена
                </button>
                <button type="submit" className="admin-save-btn">
                  {editingProduct ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
