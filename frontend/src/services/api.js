import axios from '../api/axiosGlobalInstance'

const AUTH_BASE_URL = (import.meta.env.VITE_API_URL?.replace('/api/v1/', '') || 'http://localhost:8000/car-store').replace(/\/+$/, '');

// Signup
export const signup = async (userData) => {
  // Signup endpoint está en /api/signup/, no en /api/v1/signup/
  const response = await axios.post(`${AUTH_BASE_URL}/api/signup/`, userData);
  return response.data;
};

// Login
export const login = async (username, password) => {
  // Token endpoint está en /api/token/, no en /api/v1/token/
  const response = await axios.post(`${AUTH_BASE_URL}/api/token/`, { username, password });
  const { access, refresh } = response.data;

  localStorage.setItem("accessToken", access);
  localStorage.setItem("refreshToken", refresh);

  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

