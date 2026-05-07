import axios from 'axios';

// Base URL para endpoints de autenticación (están fuera de /api/v1/)
const AUTH_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1/', '') || 'http://localhost:8000/car-store';

export async function login({ username, password }) {
  // Token endpoint está en /api/token/, no en /api/v1/token/
  const url = `${AUTH_BASE_URL}/api/token/`;
  const { data } = await axios.post(url, { username, password });
  localStorage.setItem('accessToken', data.access);
  localStorage.setItem('refreshToken', data.refresh);
  return data;
}

export async function refreshToken() {
  const refresh = localStorage.getItem('refreshToken');
  if (!refresh) return null;
  // Token refresh endpoint está en /api/token/refresh/, no en /api/v1/
  const url = `${AUTH_BASE_URL}/api/token/refresh/`;
  const { data } = await axios.post(url, { refresh });
  localStorage.setItem('accessToken', data.access);
  return data;
}

export async function signup({ username, email, password }) {
  // Signup endpoint está en /api/signup/, no en /api/v1/signup/
  const url = `${AUTH_BASE_URL}/api/signup/`;
  console.log('Signup - URL:', url);
  console.log('Signup - Data:', { username, email, password: '***' });
  try {
    const { data } = await axios.post(url, { username, email, password });
    console.log('Signup - Success:', data);
    return data;
  } catch (error) {
    console.error('Signup - Error:', error);
    console.error('Signup - Error response:', error.response?.data);
    throw error;
  }
}

export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem('accessToken'));
}


