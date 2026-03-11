import React, { useState, useMemo, useCallback, memo } from 'react';
import { useTranslation } from 'react-i18next';
import './FilterSidebar.css';

const FilterSidebar = memo(({ filters, onFilterChange, onReset, isOpen, onClose }) => {
  const { t } = useTranslation();
  const [expandedFilters, setExpandedFilters] = useState({
    brand: true,
    diameter: false,
    gender: false,
    caseShape: false,
    movement: false,
    dialColor: false,
    caseMaterial: false,
    glass: false,
    strapMaterial: false,
    claspType: false,
    waterResistance: false,
  });

  const [searchQueries, setSearchQueries] = useState({
    brand: '',
    diameter: '',
    gender: '',
    caseShape: '',
    movement: '',
    dialColor: '',
    caseMaterial: '',
    glass: '',
    strapMaterial: '',
    claspType: '',
    waterResistance: '',
  });

  const toggleFilter = useCallback((filterName) => {
    setExpandedFilters(prev => ({
      ...prev,
      [filterName]: !prev[filterName]
    }));
  }, []);

  const handleCheckboxChange = useCallback((filterName, value) => {
    const current = filters[filterName];
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    onFilterChange(filterName, updated);
  }, [filters, onFilterChange]);

  const handleSearchChange = useCallback((filterName, value) => {
    setSearchQueries(prev => ({
      ...prev,
      [filterName]: value
    }));
  }, []);

  const filterOptions = useMemo(() => ({
    brand: ['Rolex', 'Omega', 'Cartier', 'Tag Heuer', 'Patek Philippe', 'Chopard', 'Breitling', 'Skagen', 'Hamilton', 'Submariner', 'Guess', 'Citizen', 'Piaget', 'Fossil', 'Seiko', 'Longines', 'Bulova', 'Tissot', 'Jaeger-LeCoultre', 'IWC'],
    diameter: ['34', '36', '38', '40', '42', '44'],
    gender: ['Male', 'Female', 'Unisex'],
    caseShape: ['Round', 'Square', 'Rectangular', 'Oval'],
    movement: ['Automatic', 'Quartz', 'Manual'],
    dialColor: ['Black', 'White', 'Silver', 'Gold', 'Dark Blue', 'Navy', 'Rose', 'Brown', 'Cream', 'Champagne', 'Mother of Pearl', 'Dark'],
    caseMaterial: ['Steel', 'Gold', 'White Gold', 'Rose Gold', 'Yellow Gold', 'Platinum', 'Gold Plated'],
    glass: ['Sapphire', 'Mineral', 'Acrylic'],
    strapMaterial: ['Metal', 'Leather', 'Rubber', 'Fabric'],
    claspType: ['Folding', 'Buckle'],
    waterResistance: ['30m', '50m', '100m', '200m', '300m', '500m', '1000m']
  }), []);

  const FilterGroup = memo(({ filterKey, title }) => {
    const isExpanded = expandedFilters[filterKey];
    const searchQuery = searchQueries[filterKey].toLowerCase();
    
    const filteredOptions = useMemo(() => {
      const options = filterOptions[filterKey] || [];
      return options.filter(option => 
        option.toLowerCase().includes(searchQuery)
      );
    }, [filterKey, searchQuery]);

    return (
      <div className="filter-group">
        <button 
          className={`filter-header ${isExpanded ? 'expanded' : ''}`}
          onClick={() => toggleFilter(filterKey)}
        >
          <span className="filter-title">{title}</span>
          <span className="filter-toggle">
            {isExpanded ? '−' : '+'}
          </span>
        </button>
        {isExpanded && (
          <div className="filter-options">
            <div className="filter-search-wrapper">
              <svg className="filter-search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                className="filter-search-input"
                placeholder={t('filters.search') || 'Поиск...'}
                value={searchQueries[filterKey]}
                onChange={(e) => handleSearchChange(filterKey, e.target.value)}
              />
              {searchQueries[filterKey] && (
                <button 
                  className="filter-search-clear"
                  onClick={() => handleSearchChange(filterKey, '')}
                >
                  ×
                </button>
              )}
            </div>
            <div className="filter-options-list">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <label key={option} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters[filterKey].includes(option)}
                      onChange={() => handleCheckboxChange(filterKey, option)}
                    />
                    <span className="checkbox-label">{option}</span>
                  </label>
                ))
              ) : (
                <span className="filter-no-results">{t('filters.noResults') || 'Ничего не найдено'}</span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  });

  FilterGroup.displayName = 'FilterGroup';

  return (
    <>
      <div className={`filter-overlay ${isOpen ? 'visible' : ''}`} onClick={onClose} />
      <aside className={`filter-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="filter-header-section">
          <h2 className="filter-title-main">{t('filters.title')}</h2>
          <div className="filter-header-actions">
            <button className="filter-reset" onClick={onReset}>
              {t('filters.reset')}
            </button>
            <button className="filter-close-btn" onClick={onClose}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="filter-groups">
          <FilterGroup filterKey="brand" title={t('filters.brand')} />
          <FilterGroup filterKey="diameter" title={t('filters.diameter')} />
          <FilterGroup filterKey="gender" title={t('filters.gender')} />
          <FilterGroup filterKey="caseShape" title={t('filters.caseShape')} />
          <FilterGroup filterKey="movement" title={t('filters.movement')} />
          <FilterGroup filterKey="dialColor" title={t('filters.dialColor')} />
          <FilterGroup filterKey="caseMaterial" title={t('filters.caseMaterial')} />
          <FilterGroup filterKey="glass" title={t('filters.glass')} />
          <FilterGroup filterKey="strapMaterial" title={t('filters.strapMaterial')} />
          <FilterGroup filterKey="claspType" title={t('filters.claspType')} />
          <FilterGroup filterKey="waterResistance" title={t('filters.waterResistance')} />
        </div>
      </aside>
    </>
  );
});

FilterSidebar.displayName = 'FilterSidebar';

export default FilterSidebar;
