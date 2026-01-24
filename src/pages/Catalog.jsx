import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import FilterSidebar from '../components/FilterSidebar';
import SortDropdown from '../components/SortDropdown';
import ProductGrid from '../components/ProductGrid';
import HeroVideo from '../components/HeroVideo';
import { useProducts } from '../hooks/useProducts';
import { useAdmin } from '../context/AdminContext';
import './Catalog.css';

const Catalog = () => {
  const { t } = useTranslation();
  const { products: allProducts } = useAdmin();
  const [sortType, setSortType] = useState('popularity');
  const [filters, setFilters] = useState({
    brand: [],
    diameter: [],
    gender: [],
    caseShape: [],
    movement: [],
    dialColor: [],
    caseMaterial: [],
    glass: [],
    strapMaterial: [],
    claspType: [],
    waterResistance: []
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredProducts = useProducts(allProducts, filters, sortType);

  const handleFilterChange = useCallback((filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      brand: [],
      diameter: [],
      gender: [],
      caseShape: [],
      movement: [],
      dialColor: [],
      caseMaterial: [],
      glass: [],
      strapMaterial: [],
      claspType: [],
      waterResistance: []
    });
  }, []);

  const handleSortChange = useCallback((newSortType) => {
    setSortType(newSortType);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const hasActiveFilters = useMemo(() => 
    Object.values(filters).some(arr => arr.length > 0), 
    [filters]
  );

  return (
    <div className="catalog">
      {/* Боковая панель фильтров */}
      <FilterSidebar
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />

      {/* Основной контент */}
      <div className="catalog-content">
        <HeroVideo />
        
        <div className="catalog-header">
          <div className="catalog-header-left">
            <button 
              className="filter-burger-btn"
              onClick={handleToggleSidebar}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
              <span>{t('filters.title')}</span>
            </button>
            <h1 className="catalog-title">{t('catalog.title')}</h1>
          </div>
          <div className="results-info">
            {hasActiveFilters && (
              <span className="active-filters-count">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'товар' : 'товаров'}
              </span>
            )}
          </div>
        </div>

        {/* Сортировка */}
        <SortDropdown 
          sortType={sortType}
          onSortChange={handleSortChange}
        />

        {/* Сетка товаров */}
        <ProductGrid products={filteredProducts} />
      </div>
    </div>
  );
};

export default Catalog;
