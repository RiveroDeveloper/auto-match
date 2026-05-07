// src/components/VehicleList.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../contexts/CurrencyContext';
import { translateColor } from '../i18n/translateVehicleData';
import { getVehicles } from '../services/vehicleService';
import './VehicleList.css';

export default function VehicleList() {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicles()
      .then((data) => setVehicles(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p>{t('admin.loadingVehicles')}</p>;
  }

  if (vehicles.length === 0) {
    return <p>{t('admin.noVehiclesFound')}</p>;
  }

  return (
    <div className="vehicles-grid">
      {vehicles.map((vehicle) => (
        <div className="vehicle-card" key={vehicle.id}>
          <img
            src={vehicle.image || '/images/default-car.jpg'}
            alt={vehicle.model}
            className="vehicle-image"
          />
          <div className="vehicle-info">
            <h3>{vehicle.model}</h3>
            <p>{t('admin.year')}: {vehicle.year}</p>
            <p>{t('admin.color')}: {translateColor(vehicle.color, t)}</p>
            <p>{t('admin.price')}: {formatPrice(vehicle.price)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
