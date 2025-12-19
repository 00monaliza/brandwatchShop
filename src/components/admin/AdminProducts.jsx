import React, { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { showAdminToast } from '../../utils/toast';
import './AdminPanel.css';

const AdminProducts = () => {
  const { 
    products, 
    archivedProducts,
    addProduct, 
    updateProduct, 
    deleteProduct,
    updateProductStock,
    restoreFromArchive,
    deleteFromArchive 
  } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
  const [formData, setFormData] = useState({
    brand: '',
    title: '',
    price: '',
    originalPrice: '',
    image: '',
    category: '',
    gender: 'унисекс',
    description: '',
    stock: 5
  });

  const filteredProducts = products.filter(product => 
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredArchived = archivedProducts.filter(product => 
    product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.title?.toLowerCase().includes(searchQuery.toLowerCase())
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
        description: product.description || '',
        stock: product.stock !== undefined ? product.stock : 5
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
        description: '',
        stock: 5
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
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
      stock: Number(formData.stock) || 5
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
      showAdminToast.productUpdated(productData.title || productData.brand);
    } else {
      addProduct(productData);
      showAdminToast.productAdded(productData.title || productData.brand);
    }

    handleCloseModal();
  };

  const handleDelete = (productId) => {
    const product = products.find(p => p.id === productId);
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      deleteProduct(productId);
      showAdminToast.productDeleted(product?.title || product?.brand);
    }
  };

  const handleStockChange = (productId, newStock) => {
    const stock = parseInt(newStock);
    if (!isNaN(stock) && stock >= 0) {
      const product = products.find(p => p.id === productId);
      updateProductStock(productId, stock);
      showAdminToast.stockUpdated(product?.title || product?.brand, stock);
    }
  };

  const handleRestore = (productId) => {
    const product = archivedProducts.find(p => p.id === productId);
    const newStock = prompt('Введите количество товара для восстановления:', '5');
    if (newStock !== null) {
      const stock = parseInt(newStock);
      if (!isNaN(stock) && stock > 0) {
        restoreFromArchive(productId, stock);
        showAdminToast.productRestored(product?.title || product?.brand);
      }
    }
  };

  const handleDeleteArchived = (productId) => {
    const product = archivedProducts.find(p => p.id === productId);
    if (window.confirm('Удалить товар из архива навсегда?')) {
      deleteFromArchive(productId);
      showAdminToast.info('Товар удалён', `"${product?.title || product?.brand}" удалён навсегда`);
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

      {/* Табы */}
      <div className="admin-tabs">
        <button 
          className={`admin-tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Активные ({products.length})
        </button>
        <button 
          className={`admin-tab ${activeTab === 'archived' ? 'active' : ''}`}
          onClick={() => setActiveTab('archived')}
        >
          Архив ({archivedProducts.length})
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

      {activeTab === 'active' ? (
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
                <div className={`admin-stock-badge ${product.stock <= 2 ? 'low' : ''}`}>
                  {product.stock} шт
                </div>
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
                <div className="admin-stock-control">
                  <label>Остаток:</label>
                  <input
                    type="number"
                    min="0"
                    value={product.stock || 0}
                    onChange={(e) => handleStockChange(product.id, e.target.value)}
                    className="stock-input"
                  />
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
          {filteredProducts.length === 0 && (
            <div className="no-products">
              <p>Товары не найдены</p>
            </div>
          )}
        </div>
      ) : (
        <div className="admin-products-grid archived">
          {filteredArchived.map(product => (
            <div key={product.id} className="admin-product-card archived">
              <div className="admin-product-image">
                <img src={product.image} alt={product.title} />
                <div className="archived-overlay">
                  <span>В архиве</span>
                </div>
              </div>
              <div className="admin-product-info">
                <h3 className="admin-product-brand">{product.brand}</h3>
                <p className="admin-product-title">{product.title}</p>
                <div className="admin-product-price">
                  <span className="current-price">${product.price}</span>
                </div>
                <p className="archived-date">
                  Архивирован: {new Date(product.archivedAt).toLocaleDateString('ru-RU')}
                </p>
              </div>
              <div className="admin-product-actions">
                <button 
                  className="admin-restore-btn"
                  onClick={() => handleRestore(product.id)}
                >
                  Восстановить
                </button>
                <button 
                  className="admin-delete-btn"
                  onClick={() => handleDeleteArchived(product.id)}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
          {filteredArchived.length === 0 && (
            <div className="no-products">
              <p>Архив пуст</p>
            </div>
          )}
        </div>
      )}

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
                <div className="form-group">
                  <label>Количество *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="1"
                    placeholder="5"
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
