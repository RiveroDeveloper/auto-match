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

// When auth is disabled (demo mode), visitors are treated as a logged-in demo
// user so every feature works without signing in. Set VITE_AUTH_DISABLED to
// false (or remove it) to restore the normal login flow.
const AUTH_DISABLED = (import.meta.env.VITE_AUTH_DISABLED ?? 'false') === 'true';

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(AUTH_DISABLED);
  const [user, setUser] = useState(AUTH_DISABLED ? { email: 'demo@automatch.local' } : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay token al cargar la app
    const checkAuth = () => {
      if (AUTH_DISABLED) {
        setLoading(false);
        return;
      }
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