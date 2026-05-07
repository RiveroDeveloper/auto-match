import api from '../api/axiosGlobalInstance';

/**
 * Servicio para obtener tasas de cambio y convertir precios
 */
export const getExchangeRates = (baseCurrency = 'USD') =>
  api.get('/exchange-rates/', { params: { base: baseCurrency } })
    .then((res) => res.data)
    .catch((error) => {
      console.error('Error fetching exchange rates:', error);
      // Si es un error de red, retornar un objeto de error estructurado
      if (!error.response) {
        return {
          error: 'Network error',
          details: 'Could not connect to the server. Please check if the backend is running.'
        };
      }
      throw error;
    });

/**
 * Convierte un precio de una moneda a otra
 * @param {number} amount - Cantidad a convertir
 * @param {string} fromCurrency - Moneda origen (ej: 'COP')
 * @param {string} toCurrency - Moneda destino (ej: 'USD', 'EUR')
 * @returns {Promise} Promise con el resultado de la conversión
 */
export const convertPrice = (amount, fromCurrency, toCurrency) =>
  api.post('/exchange-rates/convert/', {
    amount,
    from_currency: fromCurrency,
    to_currency: toCurrency
  })
    .then((res) => {
      // El backend ya devuelve rate correctamente calculado
      // Usar directamente los valores del backend
      if (res.data && res.data.rate !== undefined) {
        return {
          rate: res.data.rate,
          converted_amount: res.data.converted_amount,
          original_amount: res.data.original_amount,
          from_currency: res.data.from_currency,
          to_currency: res.data.to_currency
        };
      }
      return res.data;
    })
    .catch((error) => {
      console.error('Error converting price:', error);
      // Si es un error de red o 401, retornar un objeto de error estructurado
      if (!error.response || error.response.status === 401) {
        return {
          error: error.response?.status === 401 
            ? 'Unauthorized: Please check backend permissions' 
            : 'Network error',
          details: 'Could not connect to the server. Please check if the backend is running.',
          converted_amount: null,
          rate: 1 // Fallback rate
        };
      }
      // Para otros errores, retornar objeto de error en lugar de lanzar
      return {
        error: error.response?.data?.error || 'Conversion failed',
        details: error.response?.data?.details || error.message,
        converted_amount: null,
        rate: 1 // Fallback rate
      };
    });

/**
 * Obtiene múltiples conversiones de precio en paralelo
 * @param {number} amount - Cantidad a convertir
 * @param {string} fromCurrency - Moneda origen
 * @param {string[]} toCurrencies - Array de monedas destino
 * @returns {Promise} Promise con objeto de conversiones { USD: {...}, EUR: {...}, ... }
 */
export const convertPriceToMultiple = async (amount, fromCurrency, toCurrencies) => {
  const conversions = await Promise.allSettled(
    toCurrencies.map(currency => convertPrice(amount, fromCurrency, currency))
  );
  
  const result = {};
  toCurrencies.forEach((currency, index) => {
    if (conversions[index].status === 'fulfilled') {
      result[currency] = conversions[index].value;
    } else {
      result[currency] = {
        error: conversions[index].reason?.response?.data?.error || 'Conversion failed',
        converted_amount: null
      };
    }
  });
  
  return result;
};

