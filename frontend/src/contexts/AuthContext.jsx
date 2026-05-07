import React, { createContext, useContext, useState, useEffect } from 'react';
import { isAuthenticated, logout } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token al cargar la app
    const checkAuth = () => {
      const hasToken = isAuthenticated();
      setIsAuth(hasToken);
      
      // Si hay token, intentar obtener info del usuario
      if (hasToken) {
        const email = localStorage.getItem('userEmail');
        setUser({ email });
      }
      
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setIsAuth(true);
    setUser(userData);
    localStorage.setItem('userEmail', userData.email);
  };

  const logoutUser = () => {
    logout();
    setIsAuth(false);
    setUser(null);
    localStorage.removeItem('userEmail');
  };

  const value = {
    isAuthenticated: isAuth,
    user,
    loading,
    login,
    logout: logoutUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};