import React, { useRef, useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useCurrency } from '../../../shared/hooks/useCurrency';
import { showAdminToast } from '../../../shared/utils/toast';
import ImageUploader from './ImageUploader';
import { storage } from '../../../services/supabase';
import './AdminPanel.css';

const AdminProducts = () => {
  const {
    products,
    archivedProducts,
    productsLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    restoreFromArchive,
    deleteFromArchive
  } = useAdmin();
  const { formatPrice } = useCurrency();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalOpenedAtRef = useRef(0);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'archived'
  const [formData, setFormData] = useState({
    brand: '',
    title: '',
    price: '',
    originalPrice: '',
    images: [], // Массив изображений вместо одного image
    category: '',
    gender: 'unisex',
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
    modalOpenedAtRef.current = Date.now();

    if (product) {
      setEditingProduct(product);
      // Преобразуем старый формат image в новый формат images
      let images = [];
      if (product.images && Array.isArray(product.images)) {
        images = product.images.map(img => 
          typeof img === 'string' ? { url: img, isTemporary: false } : img
        );
      } else if (product.image) {
        // Поддержка старого формата с одним изображением
        images = [{ url: product.image, isTemporary: false }];
      }
      
      setFormData({
        brand: product.brand || '',
        title: product.title || '',
        price: product.price || '',
        originalPrice: product.originalPrice || '',
        images: images,
        category: product.category || '',
        gender: product.gender || 'unisex',
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
        images: [],
        category: '',
        gender: 'unisex',
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

  const handleOverlayClick = (e) => {
    // Ignore click-through immediately after opening modal on mobile browsers.
    if (e.target !== e.currentTarget) return;
    if (Date.now() - modalOpenedAtRef.current < 250) return;
    handleCloseModal();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация изображений
    if (!formData.images || formData.images.length === 0) {
      alert('Пожалуйста, добавьте хотя бы одно изображение товара');
      return;
    }

    // Загружаем временные изображения в Supabase
    const imagesToUpload = formData.images.filter(img => img.isTemporary);
    let uploadedImages = formData.images.filter(img => !img.isTemporary);

    if (imagesToUpload.length > 0) {
      try {
        // Для новых товаров создаем временный ID
        const tempProductId = editingProduct?.id || `temp_${Date.now()}`;
        
        for (const tempImage of imagesToUpload) {
          const file = tempImage.file;
          if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${tempProductId}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
            const result = await storage.uploadProductImage(file, fileName);
            
            if (result.error) {
              console.error('Ошибка загрузки изображения:', result.error);
              continue;
            }
            
            uploadedImages.push({
              url: result.url,
              path: result.path,
              isTemporary: false
            });
          }
        }
      } catch (error) {
        console.error('Ошибка при загрузке изображений:', error);
        alert('Ошибка при загрузке изображений. Попробуйте еще раз.');
        return;
      }
    }

    // Извлекаем только URL для сохранения в БД
    const imageUrls = uploadedImages.map(img => img.url);
    
    // Сохраняем цены в KZT (админ вводит цены в KZT)
    const priceInKZT = Number(formData.price);
    const originalPriceInKZT = formData.originalPrice ? Number(formData.originalPrice) : null;
    
    const productData = {
      ...formData,
      price: priceInKZT, // Сохраняем в KZT
      priceInKZT: priceInKZT, // Явно указываем, что это KZT
      originalPrice: originalPriceInKZT,
      oldPrice: originalPriceInKZT, // Для обратной совместимости
      originalPriceInKZT: originalPriceInKZT,
      stock: Number(formData.stock) || 5,
      images: imageUrls,
      // Сохраняем первое изображение как image для обратной совместимости
      image: imageUrls[0] || ''
    };

    setIsSubmitting(true);
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, productData);
        showAdminToast.productUpdated(productData.title || productData.brand);
      } else {
        await addProduct(productData);
        showAdminToast.productAdded(productData.title || productData.brand);
      }
      handleCloseModal();
    } catch (err) {
      alert(`Ошибка сохранения: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      try {
        await deleteProduct(productId);
        showAdminToast.productDeleted(product?.title || product?.brand);
      } catch (err) {
        alert(`Ошибка удаления: ${err.message}`);
      }
    }
  };

  const handleStockChange = async (productId, newStock) => {
    const stock = parseInt(newStock);
    if (!isNaN(stock) && stock >= 0) {
      const product = products.find(p => p.id === productId);
      try {
        await updateProductStock(productId, stock);
        showAdminToast.stockUpdated(product?.title || product?.brand, stock);
      } catch (err) {
        alert(`Ошибка обновления остатка: ${err.message}`);
      }
    }
  };

  const handleRestore = async (productId) => {
    const product = archivedProducts.find(p => p.id === productId);
    const newStock = prompt('Введите количество товара для восстановления:', '5');
    if (newStock !== null) {
      const stock = parseInt(newStock);
      if (!isNaN(stock) && stock > 0) {
        try {
          await restoreFromArchive(productId, stock);
          showAdminToast.productRestored(product?.title || product?.brand);
        } catch (err) {
          alert(`Ошибка восстановления: ${err.message}`);
        }
      }
    }
  };

  const handleDeleteArchived = async (productId) => {
    const product = archivedProducts.find(p => p.id === productId);
    if (window.confirm('Удалить товар из архива навсегда?')) {
      try {
        await deleteFromArchive(productId);
        showAdminToast.info('Товар удалён', `"${product?.title || product?.brand}" удалён навсегда`);
      } catch (err) {
        alert(`Ошибка удаления: ${err.message}`);
      }
    }
  };

  const calculateDiscount = (price, originalPrice) => {
    if (!originalPrice || originalPrice <= price) return null;
    return Math.round((1 - price / originalPrice) * 100);
  };

  if (productsLoading) {
    return <div className="admin-products"><p style={{ padding: '2rem' }}>Загрузка товаров...</p></div>;
  }

  return (
    <div className="admin-products">
      <div className="admin-products-header">
        <h2 className="admin-section-title">Управление товарами</h2>
        <button type="button" className="admin-add-btn" onClick={() => handleOpenModal()}>
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
                <img src={product.images?.[0] || product.image || ''} alt={product.title} />
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
                  <span className="current-price">
                    {formatPrice(product.priceInKZT || product.price || 0)}
                  </span>
                  {(() => {
                    const originalPriceInKZT = product.originalPriceInKZT || product.originalPrice || null;
                    const priceInKZT = product.priceInKZT || product.price || 0;
                    return originalPriceInKZT && originalPriceInKZT > priceInKZT ? (
                      <span className="original-price">
                        {formatPrice(originalPriceInKZT)}
                      </span>
                    ) : null;
                  })()}
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
                <img src={product.images?.[0] || product.image || ''} alt={product.title} />
                <div className="archived-overlay">
                  <span>В архиве</span>
                </div>
              </div>
              <div className="admin-product-info">
                <h3 className="admin-product-brand">{product.brand}</h3>
                <p className="admin-product-title">{product.title}</p>
                <div className="admin-product-price">
                  <span className="current-price">
                    {formatPrice(product.priceInKZT || product.price || 0)}
                  </span>
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
        <div className="admin-modal-overlay" onClick={handleOverlayClick}>
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
                  <label>Цена (₸) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="15000"
                  />
                  <span className="form-hint">Цена в тенге (KZT) - базовой валюте</span>
                </div>
                <div className="form-group">
                  <label>Старая цена (₸) - для скидки</label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    min="0"
                    placeholder="18000"
                  />
                  <span className="form-hint">Старая цена в тенге (KZT)</span>
                </div>
                <div className="form-group">
                  <label>Количество *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="5"
                  />
                </div>
              </div>

              <div className="form-group">
                <ImageUploader
                  images={formData.images}
                  onChange={(images) => setFormData(prev => ({ ...prev, images }))}
                  productId={editingProduct?.id}
                  maxSizeMB={20}
                />
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
                    <option value="unisex">Унисекс</option>
                    <option value="men">Мужские</option>
                    <option value="women">Женские</option>
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
                <button type="submit" className="admin-save-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Сохранение...' : editingProduct ? 'Сохранить' : 'Добавить'}
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
