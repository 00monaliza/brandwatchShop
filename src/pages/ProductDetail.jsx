import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import { useAdmin } from '../context/AdminContext';
import { showToast } from '../utils/toast';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { addToCart } = useCart();
  const { products } = useAdmin();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === parseInt(id) || p.id === id);
    if (foundProduct) {
      setProduct(foundProduct);
      // Проверяем избранное
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      setIsFavorite(favorites.some(f => f.id === foundProduct.id));
      // Добавляем в недавно просмотренные
      addToRecentlyViewed(foundProduct);
    }
  }, [id, products]);

  const addToRecentlyViewed = (product) => {
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = recent.filter(p => p.id !== product.id);
    const updated = [product, ...filtered].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    showToast.addedToCart(product.title);
  };

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (isFavorite) {
      const updated = favorites.filter(f => f.id !== product.id);
      localStorage.setItem('favorites', JSON.stringify(updated));
      setIsFavorite(false);
      showToast.removedFromFavorites(product.title);
    } else {
      favorites.push(product);
      localStorage.setItem('favorites', JSON.stringify(favorites));
      setIsFavorite(true);
      showToast.addedToFavorites(product.title);
    }
    window.dispatchEvent(new Event('favoritesUpdated'));
  };

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="container">
          <div className="product-not-found">
            <h2>{t('product.notFound')}</h2>
            <Link to="/catalog" className="back-to-catalog">
              {t('product.backToCatalog')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const images = product.images || [product.image];
  const relatedProducts = products
    .filter(p => p.brand === product.brand && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="product-detail-page">
      <div className="container">
        {/* Breadcrumbs */}
        <nav className="breadcrumbs">
          <Link to="/">{t('nav.home')}</Link>
          <span>/</span>
          <Link to="/catalog">{t('nav.catalog')}</Link>
          <span>/</span>
          <span>{product.brand}</span>
          <span>/</span>
          <span className="current">{product.title}</span>
        </nav>

        {/* Product Main */}
        <div className="product-main">
          {/* Gallery */}
          <div className="product-gallery">
            <div className="main-image">
              <img src={images[selectedImage]} alt={product.title} />
              {product.isNew && <span className="badge new-badge">NEW</span>}
              {product.discount && <span className="badge discount-badge">-{product.discount}%</span>}
            </div>
            {images.length > 1 && (
              <div className="thumbnail-list">
                {images.map((img, index) => (
                  <button
                    key={index}
                    className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img src={img} alt={`${product.title} ${index + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <span className="product-brand">{product.brand}</span>
            <h1 className="product-title">{product.title}</h1>
            
            <div className="product-price-block">
              <span className="product-price">${product.price}</span>
              {product.oldPrice && (
                <span className="product-old-price">${product.oldPrice}</span>
              )}
            </div>

            <p className="product-description">
              {product.description || t('product.defaultDescription')}
            </p>

            {/* Specifications */}
            <div className="product-specs">
              <h3>{t('product.specifications')}</h3>
              <div className="specs-grid">
                {product.diameter && (
                  <div className="spec-item">
                    <span className="spec-label">{t('product.diameter')}</span>
                    <span className="spec-value">{product.diameter}</span>
                  </div>
                )}
                {product.caseMaterial && (
                  <div className="spec-item">
                    <span className="spec-label">{t('product.caseMaterial')}</span>
                    <span className="spec-value">{product.caseMaterial}</span>
                  </div>
                )}
                {product.movement && (
                  <div className="spec-item">
                    <span className="spec-label">{t('product.movement')}</span>
                    <span className="spec-value">{product.movement}</span>
                  </div>
                )}
                {product.waterResistance && (
                  <div className="spec-item">
                    <span className="spec-label">{t('product.waterResistance')}</span>
                    <span className="spec-value">{product.waterResistance}</span>
                  </div>
                )}
                {product.glass && (
                  <div className="spec-item">
                    <span className="spec-label">{t('product.glass')}</span>
                    <span className="spec-value">{product.glass}</span>
                  </div>
                )}
                {product.strapMaterial && (
                  <div className="spec-item">
                    <span className="spec-label">{t('product.strapMaterial')}</span>
                    <span className="spec-value">{product.strapMaterial}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <div className="quantity-selector">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>

              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {t('product.addToCart')}
              </button>

              <button 
                className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                onClick={toggleFavorite}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? '#d4af37' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </button>
            </div>

            {/* Guarantees */}
            <div className="product-guarantees">
              <div className="guarantee-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
                <span>{t('product.guarantee')}</span>
              </div>
              <div className="guarantee-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="1" y="3" width="15" height="13"/>
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
                  <circle cx="5.5" cy="18.5" r="2.5"/>
                  <circle cx="18.5" cy="18.5" r="2.5"/>
                </svg>
                <span>{t('product.freeDelivery')}</span>
              </div>
              <div className="guarantee-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                <span>{t('product.return')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="related-products">
            <h2>{t('product.related')}</h2>
            <div className="related-grid">
              {relatedProducts.map(p => (
                <Link key={p.id} to={`/product/${p.id}`} className="related-card">
                  <img src={p.image} alt={p.title} />
                  <div className="related-info">
                    <span className="related-brand">{p.brand}</span>
                    <span className="related-title">{p.title}</span>
                    <span className="related-price">${p.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
