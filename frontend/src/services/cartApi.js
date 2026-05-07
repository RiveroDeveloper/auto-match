import axios from '../api/axiosGlobalInstance';

// Función para obtener el contenido del carrito
export const getCart = async () => {
  try {
    // Hacemos la petición al endpoint que creamos (ej. /api/cart/)
    const response = await axios.get('/cart/'); // Usando la ruta singular
    return response.data[0]; // La API de DRF a menudo devuelve una lista, tomamos el primer (y único) objeto.
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

// Función para eliminar un item del carrito
export const removeItemFromCart = async (itemId) => {
  try {
    // Hacemos POST a la acción personalizada
    const response = await axios.post(`/cart/remove_item/`, { item_id: itemId });
    return response.data;
  } catch (error) {
    console.error("Error removing item from cart:", error);
    throw error;
  }
};