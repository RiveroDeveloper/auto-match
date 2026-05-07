import React from 'react';
import { useTranslation } from 'react-i18next';
import './VehicleCard.css';
import { useComparison } from '../contexts/ComparisonContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { addVehicleToCart } from '../services/cartService';
import { translateColor, translateSpec } from '../i18n/translateVehicleData';

const VehicleCard = ({ vehicle, onViewDetails, onCompare }) => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const {
    id,
    image,
    brand,
    model,
    year,
    price,
    color,
    category,
    rating,
    specifications,
    location,
    isAvailable,
    isPromoted
  } = vehicle;

  // Verificar que el contexto esté disponible
  let comparisonContext;
  try {
    comparisonContext = useComparison();
  } catch (error) {
    console.warn('ComparisonContext not available:', error);
    comparisonContext = {
      addToComparison: () => {},
      removeFromComparison: () => {},
      isInComparison: () => false,
      canAddMore: true
    };
  }

  const { addToComparison, removeFromComparison, isInComparison, canAddMore } = comparisonContext;
  
  const handleCompare = () => {
    if (isInComparison(id)) {
      removeFromComparison(id);
    } else if (canAddMore) {
      addToComparison(vehicle);
    }
  };

  const handleAddToCart = async () => {
    try {
      console.log('Attempting to add vehicle to cart:', id);
      await addVehicleToCart(id);
      alert(t('vehicle.addedToCart'));
    } catch (error) {
      console.error('Error al agregar al carrito', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error desconocido';
      alert(`${t('common.error')}: ${errorMessage}`);
    }
  };


  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">★</span>
      );
    }

    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">★</span>
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <span key={`empty-${i}`} className="star empty">★</span>
      );
    }

    return stars;
  };

  return (
    <div 
      className={`custom-vehicle-card hover-lift ${isPromoted ? 'promoted' : ''}`}
      style={{ height: 'auto', minHeight: 0 }}
    >
      {isPromoted && (
        <div className="promotion-badge">
          <span className="promotion-icon">⭐</span>
          <span className="promotion-text">{t('vehicle.promoted')}</span>
        </div>
      )}
      
      <div className="card-image-container">
        <img 
          src={image} 
          alt={`${brand} ${model}`}
          className="card-image"
          loading="lazy"
        />
        <div className="card-overlay">
          <button 
            className="overlay-btn view-btn"
            onClick={() => onViewDetails(id)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            {t('vehicle.viewDetails')}
          </button>
          <button 
            className="overlay-btn compare-btn"
            onClick={handleAddToCart}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2zM7.82 12.94l.03.05c.22.23.53.36.85.36h7.46c.54 0 1.02-.33 1.21-.84l2.54-6.79A1 1 0 0019 4H6.21l-.94-2H2v2h2l3.6 7.59-1.35 2.44C5.52 14.36 6.48 16 8 16h10v-2H8l1.82-3.06z"/>
            </svg>
            {t('vehicle.addToCart')}
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="card-header">
          <h3 className="vehicle-title">
            {year} {brand} {model}
          </h3>
          <div className="vehicle-rating">
            <div className="stars">
              {renderStars(rating)}
            </div>
            <span className="rating-value">{rating}</span>
          </div>
        </div>

        <div className="vehicle-specs">
          {specifications.map((spec, index) => (
            <div key={index} className="spec-item">
              <span className="spec-icon">{spec.icon}</span>
              <span className="spec-text">{translateSpec(spec.value, t)}</span>
            </div>
          ))}
        </div>

        <div className="vehicle-info-compact">
          <div className="info-row">
            <span className="info-label">{t('vehicle.color')}:</span>
            <span className="info-value">{translateColor(color, t)}</span>
          </div>
          <div className="info-row">
            <span className="info-label">{t('vehicle.category')}:</span>
            <span className="info-value">{category}</span>
          </div>
        </div>

        <div className="vehicle-location">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
          </svg>
          <span>{location}</span>
        </div>

        <div className="card-footer">
          <div className="price-container">
            <span className="price-label">{t('vehicle.price')}</span>
            <span className="price-value">{formatPrice(price)}</span>
          </div>
          
          <div className="availability">
            {isAvailable ? (
              <span className="available">{t('vehicle.available')}</span>
            ) : (
              <span className="unavailable">{t('vehicle.notAvailable')}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
