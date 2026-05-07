import axiosGlobalInstance from '../api/axiosGlobalInstance';

/**
 * Ensure a cart exists for the current user and return its id.
 * The backend list action creates a cart on-demand via get_queryset.
 */
export const getOrCreateCartId = async () => {
  console.log('=== GET OR CREATE CART ID ===');
  console.log('Token exists:', !!localStorage.getItem('accessToken'));
  
  try {
    const response = await axiosGlobalInstance.get('/cart/');
    console.log('Cart response status:', response.status);
    console.log('Cart response data:', response.data);
    console.log('Data type:', typeof response.data);
    console.log('Is array:', Array.isArray(response.data));
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      console.log('✅ Cart ID found:', response.data[0].id);
      return response.data[0].id;
    }
    
    console.log('⚠️ First attempt failed, trying again...');
    // In unusual cases, try again once to allow backend to create it
    const retry = await axiosGlobalInstance.get('/cart/');
    console.log('Retry response status:', retry.status);
    console.log('Retry response data:', retry.data);
    
    if (Array.isArray(retry.data) && retry.data.length > 0) {
      console.log('✅ Cart ID found on retry:', retry.data[0].id);
      return retry.data[0].id;
    }
    
    console.log('❌ Both attempts failed');
    throw new Error('No se pudo obtener o crear el carrito');
  } catch (error) {
    console.error('❌ Error in getOrCreateCartId:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

/**
 * Add a vehicle to the current user's cart.
 */
export const addVehicleToCart = async (vehicleId) => {
  console.log('=== ADD TO CART START ===');
  console.log('Vehicle ID:', vehicleId);
  console.log('Token exists:', !!localStorage.getItem('accessToken'));
  
  try {
    const response = await axiosGlobalInstance.post(`/cart/add_item/`, { vehicle_id: vehicleId });
    console.log('✅ Cart add success:', response.status);
    return response.data;
  } catch (err) {
    console.error('❌ Cart add error:', {
      status: err.response?.status,
      statusText: err.response?.statusText,
      data: err.response?.data,
      message: err.message
    });
    
    // Si el error es de autenticación, dar un mensaje más específico
    if (err.response?.status === 401) {
      throw new Error('No estás autenticado. Inicia sesión primero.');
    }
    
    if (err.response?.status === 403) {
      throw new Error('No tienes permisos para agregar al carrito.');
    }
    
    // Fallback to old endpoint
    try {
      console.log('🔄 Trying fallback endpoint...');
      const cartId = await getOrCreateCartId();
      const response = await axiosGlobalInstance.post(`/cart/${cartId}/add_item/`, { vehicle_id: vehicleId });
      console.log('✅ Cart add fallback success:', response.status);
      return response.data;
    } catch (fallbackErr) {
      console.error('❌ Cart add fallback error:', {
        status: fallbackErr.response?.status,
        data: fallbackErr.response?.data,
        message: fallbackErr.message
      });
      throw fallbackErr;
    }
  }
};


