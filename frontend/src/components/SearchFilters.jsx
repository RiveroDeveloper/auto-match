import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './SearchFilters.css';

const SearchFilters = ({ onFilterChange, filters, makes = [], categories = [], onSearch }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (filterType, value) => {
    onFilterChange(filterType, value);
  };

  const clearFilters = () => {
    // Reset all filters
    const resetFilters = {
      search: '',
      priceMin: '',
      priceMax: '',
      brands: [],
      yearFrom: '',
      yearTo: '',
      color: '',
      category: ''
    };
    
    Object.keys(resetFilters).forEach(key => {
      onFilterChange(key, resetFilters[key]);
    });
  };

  const activeFiltersCount = Object.values(filters).filter(value => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    return value !== '' && value !== null && value !== undefined;
  }).length;

  return (
    <div className={`search-filters ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="filters-header">
        <h3 className="filters-title">
          {t('common.filters')} {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </h3>
        <button 
          className="clear-filters-btn"
          onClick={clearFilters}
          disabled={activeFiltersCount === 0}
        >
          {t('common.clearFilters')}
        </button>
        <button 
          className="toggle-filters-btn"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <div className="filters-content">
        {/* Search */}
        <div className="filter-group">
          <label className="filter-label">{t('filters.search')}</label>
          <input
            type="text"
            placeholder={t('search.searchPlaceholder')}
            className="filter-input"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
        </div>


        {/* Price Range */}
        <div className="filter-group">
          <label className="filter-label">{t('filters.priceRange')}</label>
          <div className="price-range">
            <input
              type="number"
              placeholder={t('common.min')}
              className="price-input"
              value={filters.priceMin || ''}
              onChange={(e) => handleFilterChange('priceMin', e.target.value)}
            />
            <span className="price-separator">-</span>
            <input
              type="number"
              placeholder={t('common.max')}
              className="price-input"
              value={filters.priceMax || ''}
              onChange={(e) => handleFilterChange('priceMax', e.target.value)}
            />
          </div>
        </div>

        {/* Brand */}
        <div className="filter-group">
          <label className="filter-label">{t('filters.brand')}</label>
          <div className="checkbox-group">
            {makes.map(make => (
              <label key={make.id} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={filters.brands?.includes(make.name) || false}
                  onChange={(e) => {
                    const currentBrands = filters.brands || [];
                    const newBrands = e.target.checked
                      ? [...currentBrands, make.name]
                      : currentBrands.filter(b => b !== make.name);
                    handleFilterChange('brands', newBrands);
                  }}
                />
                <span className="checkbox-label">{make.name}</span>
              </label>
            ))}
          </div>
        </div>


        {/* Year Range */}
        <div className="filter-group">
          <label className="filter-label">{t('filters.year')}</label>
          <div className="year-range">
            <input
              type="number"
              placeholder={t('common.from')}
              className="year-input"
              value={filters.yearFrom || ''}
              onChange={(e) => handleFilterChange('yearFrom', e.target.value)}
            />
            <span className="year-separator">-</span>
            <input
              type="number"
              placeholder={t('common.to')}
              className="year-input"
              value={filters.yearTo || ''}
              onChange={(e) => handleFilterChange('yearTo', e.target.value)}
            />
          </div>
        </div>

        {/* Color */}
        <div className="filter-group">
          <label className="filter-label">{t('filters.color')}</label>
          <select
            className="filter-select"
            value={filters.color || ''}
            onChange={(e) => handleFilterChange('color', e.target.value)}
          >
            <option value="">{t('common.allColors')}</option>
            <option value="Blanco">{t('colors.white')}</option>
            <option value="Negro">{t('colors.black')}</option>
            <option value="Gris">{t('colors.gray')}</option>
            <option value="Rojo">{t('colors.red')}</option>
            <option value="Azul">{t('colors.blue')}</option>
            <option value="Verde">{t('colors.green')}</option>
            <option value="Plateado">{t('colors.silver')}</option>
          </select>
        </div>

        {/* Category */}
        <div className="filter-group">
          <label className="filter-label">{t('filters.category')}</label>
          <select
            className="filter-select"
            value={filters.category || ''}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <option value="">{t('common.allCategories')}</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Botón de búsqueda */}
        <div className="search-button-container">
          <button 
            className="search-button"
            onClick={() => {
              console.log('Search button clicked in SearchFilters');
              if (onSearch) {
                onSearch();
              } else {
                console.error('onSearch function not provided');
              }
            }}
          >
            🔍 {t('search.searchVehicles')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
