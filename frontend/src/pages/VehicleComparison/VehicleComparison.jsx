import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import './VehicleComparison.css';
import { useComparison } from '../../contexts/ComparisonContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { getVehicles } from '../../services/vehicleService';

const VehicleComparison = () => {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const { comparisonVehicles, removeFromComparison, clearComparison, addToComparison, isInComparison, canAddMore } = useComparison();
  const [allVehicles, setAllVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoading(true);
        const data = await getVehicles();
        const transformedVehicles = data.map(vehicle => ({
          id: vehicle.id,
          image: vehicle.image_url || (vehicle.image ? `http://localhost:8000${vehicle.image}` : '/images/default-car.jpg'),
          brand: vehicle.make_name || vehicle.make?.name || t('vehicle.noBrand'),
          model: vehicle.model,
          year: vehicle.year,
          price: parseFloat(vehicle.price),
          color: vehicle.color,
          category: vehicle.category_name || vehicle.category?.name || t('vehicle.noCategory'),
          rating: 4.5,
          specifications: {
            engine: 'Motor estándar',
            power: 'Potencia estándar',
            transmission: 'Automática',
            fuelType: 'Gasolina',
            seats: 5,
            doors: 4
          },
          expertRatings: { 
            safety: 8.5, 
            comfort: 8.5, 
            technology: 8.5, 
            performance: 8.5, 
            reliability: 8.5, 
            value: 8.5 
          },
          features: [
            'Sistema de seguridad estándar',
            'Conectividad básica',
            'Comodidad para pasajeros',
            'Eficiencia de combustible'
          ]
        }));
        setAllVehicles(transformedVehicles);
      } catch (error) {
        console.error('Error cargando vehículos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);


  const translateSpecValue = (value, specKey, t) => {
    if (typeof value !== 'string') return value;
    
    // Traducir según el tipo de especificación
    switch (specKey) {
      case 'transmission':
        return t(`vehicleData.transmissions.${value}`, value);
      case 'fuelType':
        return t(`vehicleData.fuelTypes.${value}`, value);
      case 'engine':
      case 'power':
      case 'torque':
      case 'fuelConsumption':
      case 'acceleration':
      case 'topSpeed':
      case 'cargo':
      case 'drivetrain':
      case 'weight':
      case 'length':
      case 'width':
      case 'height':
        return t(`vehicleFeatures.${value}`, value);
      default:
        return value;
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="star half">★</span>);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">★</span>);
    }

    return stars;
  };

  const activeVehicles = comparisonVehicles;
  const hasEmptySlots = comparisonVehicles.length < 3;

  const comparisonSpecs = [
    { key: 'engine', label: t('comparison.specs.engine') },
    { key: 'power', label: t('comparison.specs.power') },
    { key: 'torque', label: t('comparison.specs.torque') },
    { key: 'transmission', label: t('comparison.specs.transmission') },
    { key: 'fuelType', label: t('comparison.specs.fuelType') },
    { key: 'fuelConsumption', label: t('comparison.specs.fuelConsumption') },
    { key: 'acceleration', label: t('comparison.specs.acceleration') },
    { key: 'topSpeed', label: t('comparison.specs.topSpeed') },
    { key: 'seats', label: t('comparison.specs.seats') },
    { key: 'doors', label: t('comparison.specs.doors') },
    { key: 'cargo', label: t('comparison.specs.cargo') },
    { key: 'drivetrain', label: t('comparison.specs.drivetrain') },
    { key: 'weight', label: t('comparison.specs.weight') },
    { key: 'length', label: t('comparison.specs.length') },
    { key: 'width', label: t('comparison.specs.width') },
    { key: 'height', label: t('comparison.specs.height') }
  ];

  const ratingSpecs = [
    { key: 'safety', label: t('comparison.ratings.safety') },
    { key: 'comfort', label: t('comparison.ratings.comfort') },
    { key: 'technology', label: t('comparison.ratings.technology') },
    { key: 'performance', label: t('comparison.ratings.performance') },
    { key: 'reliability', label: t('comparison.ratings.reliability') },
    { key: 'value', label: t('comparison.ratings.value') }
  ];

  return (
    <div className="vehicle-comparison">
      <div className="comparison-container">
        {/* Header */}
        <div className="comparison-header">
          <div className="header-content">
            <h1 className="comparison-title">{t('comparison.title')}</h1>
            <p className="comparison-subtitle">
              {t('comparison.subtitle')}
            </p>
          </div>
          <div className="header-actions">
            <button 
              className="btn-secondary"
              onClick={clearComparison}
              disabled={activeVehicles.length === 0}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              {t('comparison.clearAll')}
            </button>
          </div>
        </div>

        {/* Vehicle Cards */}
        <div className="vehicles-row">
          {comparisonVehicles.map((vehicle, index) => (
            <div key={vehicle.id} className="vehicle-column has-vehicle">
              <div className="vehicle-card">
                <button 
                  className="remove-vehicle"
                  onClick={() => removeFromComparison(vehicle.id)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                </button>
                
                <div className="vehicle-image">
                  <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} />
                </div>
                
                <div className="vehicle-info">
                  <h3 className="vehicle-name">
                    {vehicle.year} {vehicle.brand} {vehicle.model}
                  </h3>
                  
                  <div className="vehicle-rating">
                    <div className="stars">
                      {renderStars(vehicle.rating)}
                    </div>
                    <span className="rating-value">{vehicle.rating}</span>
                  </div>
                  
                  <div className="vehicle-price">
                    <span className="price-value">{formatPrice(vehicle.price)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {/* Mostrar slots vacíos si hay menos de 3 vehículos */}
          {Array.from({ length: 3 - comparisonVehicles.length }).map((_, index) => (
            <div key={`empty-${index}`} className="vehicle-column empty-slot">
              <div className="empty-slot-card">
                <div className="empty-slot-content">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                  </svg>
                  <p>{t('comparison.addVehicle')}</p>
                  <p className="empty-slot-hint">{t('comparison.goToCatalog')}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison Table */}
        {activeVehicles.length > 0 && (
          <div className="comparison-content">
            {/* Specifications Table */}
            <div className="comparison-section">
              <h2 className="section-title">{t('comparison.technicalSpecs')}</h2>
              <div className="comparison-table">
                <div className="table-header">
                  <div className="spec-label-column">{t('comparison.specification')}</div>
                  {activeVehicles.map((vehicle, index) => (
                    <div key={index} className="vehicle-column-header">
                      {vehicle.year} {vehicle.brand} {vehicle.model}
                    </div>
                  ))}
                </div>
                
                <div className="table-body">
                  {comparisonSpecs.map(spec => (
                    <div key={spec.key} className="table-row">
                      <div className="spec-label">{spec.label}</div>
                      {activeVehicles.map((vehicle, index) => (
                        <div key={index} className="spec-value">
                          {vehicle.specifications?.[spec.key] ? translateSpecValue(vehicle.specifications[spec.key], spec.key, t) : t('comparison.notAvailable')}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Expert Ratings */}
            <div className="comparison-section">
              <h2 className="section-title">{t('comparison.expertRatings')}</h2>
              <div className="ratings-comparison">
                {ratingSpecs.map(rating => (
                  <div key={rating.key} className="rating-row">
                    <div className="rating-label">{rating.label}</div>
                    <div className="rating-bars">
                      {activeVehicles.map((vehicle, index) => (
                        <div key={index} className="rating-bar-container">
                          <div className="rating-bar">
                            <div 
                              className="rating-fill"
                              style={{ width: `${((vehicle.expertRatings?.[rating.key] || 8.5) / 10) * 100}%` }}
                            ></div>
                          </div>
                          <span className="rating-value">
                            {vehicle.expertRatings?.[rating.key] || 8.5}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Features Comparison */}
            <div className="comparison-section">
              <h2 className="section-title">{t('comparison.features')}</h2>
              <div className="features-comparison">
                <div className="features-grid">
                  {activeVehicles.map((vehicle, index) => (
                    <div key={index} className="vehicle-features">
                      <h4 className="features-title">
                        {vehicle.year} {vehicle.brand} {vehicle.model}
                      </h4>
                      <ul className="features-list">
                        {(vehicle.features || []).map((feature, featureIndex) => (
                          <li key={featureIndex} className="feature-item">
                            <span className="feature-icon">✓</span>
                            {t(`vehicleFeatures.${feature}`)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Comparison */}
            <div className="comparison-section">
              <h2 className="section-title">{t('comparison.priceComparison')}</h2>
              <div className="price-comparison">
                <div className="price-chart">
                  {activeVehicles.map((vehicle, index) => (
                    <div key={index} className="price-bar">
                      <div className="price-info">
                        <span className="vehicle-name">
                          {vehicle.year} {vehicle.brand} {vehicle.model}
                        </span>
                        <span className="price-value">
                          {formatPrice(vehicle.price)}
                        </span>
                      </div>
                      <div className="price-visual">
                        <div 
                          className="price-fill"
                          style={{ 
                            width: `${(vehicle.price / Math.max(...activeVehicles.map(v => v.price))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Vehicles Section */}
        {!loading && (
          <div className="available-vehicles-section">
            <h2 className="section-title">{t('comparison.availableVehicles')}</h2>
            <div className="vehicles-grid">
              {allVehicles.map(vehicle => {
                // Generar análisis para calcular puntuación general
                const yearScore = Math.min(10, (vehicle.year - 2010) / 2 + 5);
                const priceScore = Math.max(5, 10 - (vehicle.price / 100000000));
                const overallScore = ((8.0 + 8.5 + 8.2 + 8.0 + priceScore) / 5);
                
                return (
                  <div 
                    key={vehicle.id}
                    className={`vehicle-option comparison-vehicle ${isInComparison(vehicle.id) ? 'in-comparison' : ''}`}
                  >
                    <div className="vehicle-image">
                      <img src={vehicle.image} alt={`${vehicle.brand} ${vehicle.model}`} />
                    </div>
                    <div className="vehicle-info">
                      <h4 className="vehicle-name">{vehicle.year} {vehicle.brand} {vehicle.model}</h4>
                      <div className="vehicle-score">
                        <span className="score-label">{t('comparison.overallScore')}</span>
                        <div className="overall-score">
                          {overallScore.toFixed(1)}
                        </div>
                      </div>
                      <button 
                        className={`btn-primary add-to-comparison-btn ${isInComparison(vehicle.id) ? 'in-comparison' : ''}`}
                        onClick={() => {
                          if (isInComparison(vehicle.id)) {
                            removeFromComparison(vehicle.id);
                          } else if (canAddMore) {
                            addToComparison(vehicle);
                          }
                        }}
                        disabled={!isInComparison(vehicle.id) && !canAddMore}
                      >
                        {isInComparison(vehicle.id) ? t('comparison.inComparison') : t('comparison.addToComparison')}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {activeVehicles.length === 0 && !loading && (
          <div className="empty-state">
            <div className="empty-state-content">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 3H7c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H7V5h2v12zm8-14h-2c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14h-2V5h2v12z"/>
              </svg>
              <h3>{t('comparison.noVehicles')}</h3>
              <p>{t('comparison.selectToStart')}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>{t('common.loadingVehicles')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleComparison;
