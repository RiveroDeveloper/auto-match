import api from '../api/axiosGlobalInstance';

export const getVehicles = (params = {}) =>
    api.get('/vehicles/', { params }).then((res) => {
        console.log('getVehicles - Respuesta completa:', res);
        console.log('getVehicles - res.data:', res.data);
        // Manejar tanto respuestas paginadas como no paginadas
        if (res.data.results) {
            console.log('getVehicles - Respuesta paginada, results:', res.data.results);
            return res.data.results;
        }
        if (Array.isArray(res.data)) {
            console.log('getVehicles - Respuesta directa (array):', res.data);
            return res.data;
        }
        console.warn('getVehicles - Formato inesperado, devolviendo array vacío');
        return [];
    }).catch((error) => {
        console.error('getVehicles - Error:', error);
        console.error('getVehicles - Error response:', error.response);
        throw error;
    });

export const getVehicle = (id) =>
    api.get(`/vehicles/${id}/`).then((res) => res.data);

export const createVehicle = (vehicle_data) =>
    api.post('/vehicles/', vehicle_data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then((res) => res.data);

export const updateVehicle = (id, vehicle_data) =>
    api.put(`/vehicles/${id}/`, vehicle_data).then((res) => res.data);

export const partialUpdateVehicle = (id, vehicle_data) =>
    api.patch(`/vehicles/${id}/`, vehicle_data).then((res) => res.data);

export const deleteVehicle = (id) =>
    api.delete(`/vehicles/${id}/`).then((res) => res.data);

// Búsquedas inteligentes
export const searchVehicles = (searchParams = {}) => {
    // Crear URLSearchParams para manejar correctamente los arrays
    const params = new URLSearchParams();
    
    Object.keys(searchParams).forEach(key => {
        const value = searchParams[key];
        if (Array.isArray(value)) {
            // Para arrays, agregar cada elemento como parámetro separado
            value.forEach(item => {
                params.append(key, item);
            });
        } else if (value !== null && value !== undefined && value !== '') {
            params.append(key, value);
        }
    });
    
    console.log('URL params:', params.toString());
    console.log('Search params sent to backend:', searchParams);
    return api.get(`/vehicles/search/?${params.toString()}`).then((res) => {
        // Manejar tanto respuestas paginadas como no paginadas
        if (res.data.results) {
            return res.data.results;
        }
        return Array.isArray(res.data) ? res.data : [];
    });
};

export const getSearchSuggestions = (query) =>
    api.get('/vehicles/suggestions/', { params: { q: query } }).then((res) => res.data);

export const getVehiclesByMake = (makeId) =>
    api.get(`/vehicles/by_make/?make_id=${makeId}`).then((res) => res.data);

export const getVehiclesByCategory = (categoryId) =>
    api.get(`/vehicles/by_category/?category_id=${categoryId}`).then((res) => res.data);

/**
 * Descarga un reporte PDF del vehículo
 * @param {number} vehicleId - ID del vehículo
 * @returns {Promise<Blob>} Blob del archivo PDF
 */
export const downloadVehicleReport = async (vehicleId) => {
    const response = await api.get(`/vehicles/${vehicleId}/download_report/`, {
        responseType: 'blob' // Importante: indicar que esperamos un blob (archivo binario)
    });
    return response.data; // Retorna el blob directamente
};