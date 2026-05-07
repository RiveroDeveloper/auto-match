// Función helper para traducir datos del vehículo que vienen del backend
export const translateVehicleData = (value, type, t) => {
  if (!value) return value;
  
  const key = `vehicleData.${type}.${value}`;
  const translated = t(key);
  
  // Si la traducción es igual a la key, significa que no existe, devolver el valor original
  return translated === key ? value : translated;
};

// Función para traducir colores
export const translateColor = (color, t) => {
  if (!color) return color;
  
  const key = `colors.${color}`;
  const translated = t(key);
  
  return translated === key ? color : translated;
};

// Función para traducir especificaciones del vehículo
export const translateSpec = (spec, t) => {
  if (!spec || typeof spec !== 'string') return spec;
  
  // Normalizar el texto para comparación
  const normalized = spec.trim();
  
  // Intentar traducir valores estándar primero
  if (normalized.match(/estándar/i)) {
    return translateFeature(normalized, t);
  }
  
  // Intentar traducir tipo de combustible
  if (normalized.match(/gasolina|diesel|eléctrico|híbrido|gas/i)) {
    // Capitalizar primera letra para coincidir con las keys
    const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
    return translateVehicleData(capitalized, 'fuelTypes', t);
  }
  
  // Intentar traducir transmisión
  if (normalized.match(/automática|manual|cvt|semiautomática/i)) {
    const capitalized = normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
    return translateVehicleData(capitalized, 'transmissions', t);
  }
  
  // Intentar traducir pasajeros
  if (normalized.match(/\d+\s*pasajeros?/i)) {
    const number = normalized.match(/\d+/)[0];
    const word = parseInt(number) === 1 ? t('vehicleData.passenger') : t('vehicleData.passengers');
    return `${number} ${word}`;
  }
  
  return spec;
};

// Función para traducir características del vehículo
export const translateFeature = (feature, t) => {
  if (!feature) return feature;
  
  const key = `vehicleFeatures.${feature}`;
  const translated = t(key);
  
  return translated === key ? feature : translated;
};

// Función para traducir tags de "Ideal para"
export const translateTag = (tag, t) => {
  if (!tag) return tag;
  
  const key = `idealForTags.${tag}`;
  const translated = t(key);
  
  return translated === key ? tag : translated;
};
