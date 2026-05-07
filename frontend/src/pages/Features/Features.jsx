import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import VehicleAnalysis from '../../components/VehicleAnalysis';
import { getVehicles } from '../../services/vehicleService';
import './Features.css';

const Features = () => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

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
          features: [
            'Sistema de seguridad estándar',
            'Conectividad básica',
            'Comodidad para pasajeros',
            'Eficiencia de combustible'
          ]
        }));
        setVehicles(transformedVehicles);
        if (transformedVehicles.length > 0) setSelectedVehicle(transformedVehicles[0]);
      } catch (error) {
        // Mantener manejo de error silencioso
      } finally {
        setLoading(false);
      }
    };

    loadVehicles();
  }, []);


  if (loading) {
    return (
      <div className="features-page">
        <div className="features-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>{t('common.loadingVehicles')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="features-page">
      <div className="features-container">
        {/* Debug panel removed */}
        {/* Header Section */}
        <div className="features-header">
          <div className="features-badge">
            <span>{t('featuresPage.badge')}</span>
          </div>
          <h1 className="features-title text-glow">
            {t('featuresPage.title')}
          </h1>
          <p className="features-subtitle">
            {t('featuresPage.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="features-grid">
          <div className="feature-card hover-lift">
            <div className="feature-icon">🔍</div>
            <h3 className="feature-title">{t('featuresPage.intelligentSearch.title')}</h3>
            <p className="feature-description">
              {t('featuresPage.intelligentSearch.description')}
            </p>
          </div>

          <div className="feature-card hover-lift">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">{t('featuresPage.dataAnalysis.title')}</h3>
            <p className="feature-description">
              {t('featuresPage.dataAnalysis.description')}
            </p>
          </div>

          <div className="feature-card hover-lift">
            <div className="feature-icon">⚖️</div>
            <h3 className="feature-title">{t('featuresPage.advancedComparison.title')}</h3>
            <p className="feature-description">
              {t('featuresPage.advancedComparison.description')}
            </p>
          </div>

          <div className="feature-card hover-lift">
            <div className="feature-icon">🎯</div>
            <h3 className="feature-title">{t('featuresPage.personalizedRecommendations.title')}</h3>
            <p className="feature-description">
              {t('featuresPage.personalizedRecommendations.description')}
            </p>
          </div>

          <div className="feature-card hover-lift">
            <div className="feature-icon">🔒</div>
            <h3 className="feature-title">{t('featuresPage.reliableData.title')}</h3>
            <p className="feature-description">
              {t('featuresPage.reliableData.description')}
            </p>
          </div>

          <div className="feature-card hover-lift">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">{t('featuresPage.intuitiveInterface.title')}</h3>
            <p className="feature-description">
              {t('featuresPage.intuitiveInterface.description')}
            </p>
          </div>
        </div>

        {/* Vehicle Analysis Section */}
        <div className="analysis-section">
          <VehicleAnalysis vehicles={vehicles} selectedVehicle={selectedVehicle} onSelectVehicle={setSelectedVehicle} />
        </div>

        {/* CTA Section */}
        <div className="features-cta">
          <div className="cta-content">
            <h2 className="cta-title">{t('featuresPage.cta.title')}</h2>
            <p className="cta-subtitle">
              {t('featuresPage.cta.subtitle')}
            </p>
            <div className="cta-buttons">
              <button className="btn-primary btn-enhanced hover-glow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                {t('featuresPage.cta.startSearch')}
              </button>
              <button className="btn-secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 3H7c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14H7V5h2v12zm8-14h-2c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 14h-2V5h2v12z"/>
                </svg>
                {t('featuresPage.cta.compareVehicles')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
