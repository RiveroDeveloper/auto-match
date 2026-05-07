import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import axiosGlobalInstance from '../../api/axiosGlobalInstance';
import { translateColor } from '../../i18n/translateVehicleData';
import './CartPage.css';

const CartPage = ({ onViewDetails }) => {
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();
  console.log('CartPage component rendering');
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    console.log('CartPage useEffect - isAuthenticated:', isAuthenticated);
    console.log('CartPage useEffect - user:', user);
    if (isAuthenticated) {
      fetchCartItems();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Forzar re-render cuando cambia el idioma
  useEffect(() => {
    // Este efecto asegura que el componente se actualice cuando cambia el idioma
  }, [i18n.language]);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      console.log('=== FETCHING CART ITEMS ===');
      const response = await axiosGlobalInstance.get('/cart/');
      console.log('Cart response:', response.data);
      
      if (response.data && response.data.length > 0) {
        const cart = response.data[0];
        console.log('Cart object:', cart);
        console.log('Cart items:', cart.items);
        setCartItems(cart.items || []);
      } else {
        console.log('No cart data found');
        setCartItems([]);
      }
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError(t('cart.empty'));
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      console.log('Removing item from cart:', itemId);
      // Primero obtener el cart_id
      const cartResponse = await axiosGlobalInstance.get('/cart/');
      if (cartResponse.data && cartResponse.data.length > 0) {
        const cartId = cartResponse.data[0].id;
        // Usar el endpoint correcto para remover item
        await axiosGlobalInstance.post(`/cart/${cartId}/remove_item/`, { item_id: itemId });
        // Actualizar la lista local
        setCartItems(cartItems.filter(item => item.id !== itemId));
      }
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1>{t('cart.title')}</h1>
          <div className="error-message">
            {t('cart.empty')}
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-page">
        <div className="cart-container">
          <h1>{t('cart.title')}</h1>
          <div className="loading">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <h1>{t('cart.title')}</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <h2>{t('cart.empty')}</h2>
            <p>{t('cart.continueShopping')}</p>
          </div>
        ) : (
          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="item-image">
                  <img 
                    src={(item.vehicle.image_url) || (item.vehicle.image ? `http://localhost:8000${item.vehicle.image}` : '/images/default-car.jpg')} 
                    alt={item.vehicle.model}
                  />
                </div>
                <div className="item-details">
                  <h3>{item.vehicle.year} {item.vehicle.make.name} {item.vehicle.model}</h3>
                  <p>{t('vehicle.category')}: {item.vehicle.category.name}</p>
                  <p>{t('vehicle.color')}: {translateColor(item.vehicle.color, t)}</p>
                  <p className="price">{formatPrice(item.vehicle.price)}</p>
                </div>
                <div className="item-actions">
                  <button 
                    className="btn-secondary"
                    onClick={() => onViewDetails && onViewDetails(item.vehicle.id)}
                  >
                    {t('vehicle.viewDetails')}
                  </button>
                  <button 
                    className="btn-danger"
                    onClick={() => removeFromCart(item.id)}
                  >
                    {t('cart.remove')}
                  </button>
                </div>
              </div>
            ))}
            
            <div className="cart-summary">
              <h3>{t('cart.title')}</h3>
              <p>{t('cart.itemsCount', { count: cartItems.length })}</p>
              <p>{t('cart.total')}: {formatPrice(cartItems.reduce((sum, item) => sum + item.vehicle.price, 0))}</p>
              <button className="btn-primary btn-checkout">
                {t('cart.checkout')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;