import React, { createContext, useContext, useState, useEffect } from 'react';
import { convertPrice as convertPriceAPI } from '../services/exchangeRateService';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [selectedCurrency, setSelectedCurrency] = useState('COP');
  const [conversionRate, setConversionRate] = useState(1); // Inicializar en 1 para COP
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar moneda guardada en localStorage al iniciar
  useEffect(() => {
    const savedCurrency = localStorage.getItem('selectedCurrency');
    if (savedCurrency && ['COP', 'USD', 'EUR'].includes(savedCurrency)) {
      setSelectedCurrency(savedCurrency);
    }
  }, []);

  // Obtener tasa de conversión cuando cambia la moneda
  useEffect(() => {
    const fetchConversionRate = async () => {
      if (selectedCurrency === 'COP') {
        setConversionRate(1);
        setError(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        // Obtener tasa de conversión de COP a la moneda seleccionada
        // Usamos 1 COP para obtener el rate directamente
        const result = await convertPriceAPI(1, 'COP', selectedCurrency);
        
        // Verificar si hay error en la respuesta
        if (result && result.error) {
          throw new Error(result.error + (result.details ? `: ${result.details}` : ''));
        }
        
        // El backend devuelve rate correctamente calculado
        if (result && typeof result.rate === 'number' && result.rate > 0) {
          setConversionRate(result.rate);
        } else {
          console.warn('Rate inválido recibido:', result);
          setError('Tasa de conversión inválida');
          setConversionRate(1); // Fallback a tasa 1
        }
      } catch (err) {
        console.error('Error fetching conversion rate:', err);
        setError(err.message || 'Error al obtener tasa de conversión');
        setConversionRate(1); // Fallback a tasa 1 si hay error
      } finally {
        setLoading(false);
      }
    };

    // Solo intentar fetch si no estamos en COP
    if (selectedCurrency !== 'COP') {
      fetchConversionRate();
    }
  }, [selectedCurrency]);

  const changeCurrency = (currency) => {
    if (['COP', 'USD', 'EUR'].includes(currency)) {
      setSelectedCurrency(currency);
      localStorage.setItem('selectedCurrency', currency);
    }
  };

  const convertPriceAmount = (priceInCOP) => {
    if (!priceInCOP || priceInCOP <= 0) return 0;
    if (selectedCurrency === 'COP') return priceInCOP;
    // Usar rate si está disponible, sino retornar precio original
    if (conversionRate && conversionRate > 0) {
      return priceInCOP * conversionRate;
    }
    return priceInCOP;
  };

  const formatPrice = (priceInCOP) => {
    const convertedPrice = convertPriceAmount(priceInCOP);
    
    const currencyMap = {
      'USD': 'en-US',
      'EUR': 'de-DE',
      'COP': 'es-CO'
    };

    const locale = currencyMap[selectedCurrency] || 'en-US';
    
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: selectedCurrency,
      minimumFractionDigits: selectedCurrency === 'COP' ? 0 : 2,
      maximumFractionDigits: selectedCurrency === 'COP' ? 0 : 2
    }).format(convertedPrice);
  };

  const value = {
    selectedCurrency,
    changeCurrency,
    convertPrice: convertPriceAmount,
    formatPrice,
    conversionRate,
    loading,
    error
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

