import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SortDropdown.css';

const SortDropdown = ({ sortType, onSortChange }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const sortOptions = [
    { value: 'popularity', label: t('sort.popularity') },
    { value: 'priceLow', label: t('sort.priceLow') },
    { value: 'priceHigh', label: t('sort.priceHigh') },
    { value: 'newest', label: t('sort.newest') },
    { value: 'maxDiscount', label: t('sort.maxDiscount') }
  ];

  const currentSort = sortOptions.find(opt => opt.value === sortType);

  const handleSelect = (value) => {
    onSortChange(value);
    setIsOpen(false);
  };

  return (
    <div className="sort-dropdown-container">
      <label className="sort-label">{t('sort.title')}:</label>
      <div className="sort-dropdown">
        <button 
          className="sort-button"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{currentSort?.label}</span>
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 16 16" 
            fill="none"
            className={`sort-icon ${isOpen ? 'open' : ''}`}
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {isOpen && (
          <div className="sort-menu">
            {sortOptions.map(option => (
              <button
                key={option.value}
                className={`sort-option ${sortType === option.value ? 'active' : ''}`}
                onClick={() => handleSelect(option.value)}
              >
                {option.label}
                {sortType === option.value && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8L6.5 11.5L13 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SortDropdown;
