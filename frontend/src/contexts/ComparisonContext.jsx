import React, { createContext, useContext, useState } from 'react';

const ComparisonContext = createContext();

export const useComparison = () => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

export const ComparisonProvider = ({ children }) => {
  const [comparisonVehicles, setComparisonVehicles] = useState([]);

  const addToComparison = (vehicle) => {
    if (comparisonVehicles.length >= 2) {
      // Reemplazar el primer vehículo si ya hay 2
      setComparisonVehicles([comparisonVehicles[1], vehicle]);
    } else if (!comparisonVehicles.find(v => v.id === vehicle.id)) {
      setComparisonVehicles([...comparisonVehicles, vehicle]);
    }
  };

  const removeFromComparison = (vehicleId) => {
    setComparisonVehicles(comparisonVehicles.filter(v => v.id !== vehicleId));
  };

  const clearComparison = () => {
    setComparisonVehicles([]);
  };

  const isInComparison = (vehicleId) => {
    return comparisonVehicles.some(v => v.id === vehicleId);
  };

  const canAddMore = comparisonVehicles.length < 2;

  const value = {
    comparisonVehicles,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore
  };

  return (
    <ComparisonContext.Provider value={value}>
      {children}
    </ComparisonContext.Provider>
  );
};