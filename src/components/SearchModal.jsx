import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../utils/productImage';
import { useCurrency } from '../hooks/useCurrency';
import './SearchModal.css';

const SearchModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { products } = useAdmin();
  const { formatPrice } = useCurrency();
  const [searchQuery, setSearchQuery] = useState('');
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase().trim();
    
    return products.filter(product => {
      const searchableText = [
        product.title,
        product.brand,
        product.dialColor,
        product.caseMaterial,
        product.movement,
        product.strapMaterial,
        product.gender,
        product.caseShape,
        `${product.diameter}mm`,
        `${product.price}`
      ].join(' ').toLowerCase();
      
      return searchableText.includes(query);
    }).slice(0, 8); // Limit to 8 results
  }, [searchQuery, products]);

  // Save search to recent
  const saveRecentSearch = (query) => {
    try {
      let recent = [...recentSearches];
      recent = recent.filter(item => item.toLowerCase() !== query.toLowerCase());
      recent.unshift(query);
      recent = recent.slice(0, 5);
      setRecentSearches(recent);
      localStorage.setItem('recentSearches', JSON.stringify(recent));
    } catch (error) {
      console.error('Error saving recent search:', error);
    }
  };

  const handleProductClick = (product) => {
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
    }
    // Add to recently viewed
    try {
      const stored = localStorage.getItem('recentlyViewed');
      let recentlyViewed = stored ? JSON.parse(stored) : [];
      recentlyViewed = recentlyViewed.filter(item => item.id !== product.id);
      recentlyViewed.unshift({
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        image: getProductImage(product),
        viewedAt: Date.now()
      });
      recentlyViewed = recentlyViewed.slice(0, 10);
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
      window.dispatchEvent(new CustomEvent('recentlyViewedUpdated'));
    } catch (error) {
      console.error('Error saving recently viewed:', error);
    }
    onClose();
    navigate('/catalog');
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleRecentSearchClick = (query) => {
    setSearchQuery(query);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery.trim());
      onClose();
      navigate('/catalog');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="search-modal-overlay" onClick={onClose}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        {/* Search Input */}
        <form className="search-form" onSubmit={handleSubmit}>
          <div className="search-input-wrapper">
            <svg className="search-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              ref={inputRef}
              type="text"
              className="search-input"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="search-clear-btn"
                onClick={() => setSearchQuery('')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
          <button type="button" className="search-close-btn" onClick={onClose}>
            {t('search.cancel')}
          </button>
        </form>

        {/* Content */}
        <div className="search-content">
          {/* No query - show recent searches and popular */}
          {!searchQuery.trim() && (
            <>
              {recentSearches.length > 0 && (
                <div className="search-section">
                  <div className="search-section-header">
                    <h3>{t('search.recentSearches')}</h3>
                    <button className="clear-recent-btn" onClick={clearRecentSearches}>
                      {t('search.clear')}
                    </button>
                  </div>
                  <div className="recent-searches">
                    {recentSearches.map((query, index) => (
                      <button
                        key={index}
                        className="recent-search-item"
                        onClick={() => handleRecentSearchClick(query)}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        {query}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="search-section">
                <h3>{t('search.popularBrands')}</h3>
                <div className="popular-brands">
                  {['Rolex', 'Omega', 'Patek Philippe', 'Cartier', 'TAG Heuer'].map(brand => (
                    <button
                      key={brand}
                      className="brand-chip"
                      onClick={() => handleRecentSearchClick(brand)}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              <div className="search-section">
                <h3>{t('search.popularCategories')}</h3>
                <div className="popular-categories">
                  {[
                    { key: 'automatic', label: t('search.automatic') },
                    { key: 'gold', label: t('search.gold') },
                    { key: 'steel', label: t('search.steel') },
                    { key: 'leather', label: t('search.leather') }
                  ].map(cat => (
                    <button
                      key={cat.key}
                      className="category-chip"
                      onClick={() => handleRecentSearchClick(cat.label)}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Search Results */}
          {searchQuery.trim() && (
            <div className="search-results">
              {searchResults.length > 0 ? (
                <>
                  <div className="search-results-header">
                    <span>{t('search.resultsFor')} "{searchQuery}"</span>
                    <span className="results-count">{searchResults.length} {t('search.found')}</span>
                  </div>
                  <div className="search-results-list">
                    {searchResults.map(product => (
                      <div 
                        key={product.id} 
                        className="search-result-item"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="result-image">
                          <img src={getProductImage(product)} alt={product.title} />
                        </div>
                        <div className="result-info">
                          <span className="result-brand">{product.brand}</span>
                          <span className="result-title">{product.title}</span>
                          <div className="result-details">
                            <span>Ø {product.diameter}mm</span>
                            <span className="detail-separator">•</span>
                            <span>{product.movement}</span>
                          </div>
                          <div className="result-price">
                            {(() => {
                              const priceInKZT = product.priceInKZT || product.price || 0;
                              const oldPriceInKZT = product.oldPriceInKZT || product.oldPrice || null;
                              return (
                                <>
                                  {oldPriceInKZT && oldPriceInKZT > priceInKZT && (
                                    <span className="result-old-price">{formatPrice(oldPriceInKZT)}</span>
                                  )}
                                  <span className="result-current-price">{formatPrice(priceInKZT)}</span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <button 
                          className="result-add-btn"
                          onClick={(e) => handleAddToCart(e, product)}
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="no-results">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.35-4.35"></path>
                  </svg>
                  <h3>{t('search.noResults')}</h3>
                  <p>{t('search.noResultsText')}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
