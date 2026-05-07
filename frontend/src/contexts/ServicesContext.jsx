import React, { createContext, useContext } from 'react';
import * as vehicleService from '../services/vehicleService';
import * as authService from '../services/authService';
import * as cartService from '../services/cartService';
// Importar otros servicios aquí

const ServicesContext = createContext();

export const ServicesProvider = ({ children }) => {
  // Aquí podrías cambiar la implementación por mocks si estuvieras en un entorno de test
  const services = {
    vehicle: vehicleService,
    auth: authService,
    cart: cartService,
  };

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
};

export const useServices = () => {
  const context = useContext(ServicesContext);
  if (!context) {
    throw new Error('useServices debe ser usado dentro de un ServicesProvider');
  }
  return context;
};
