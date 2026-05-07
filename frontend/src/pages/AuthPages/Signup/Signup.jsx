import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../Auth.css';
import { useServices } from '../../../contexts/ServicesContext';
import { useAuth } from '../../../contexts/AuthContext';

const Signup = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { auth: authService } = useServices();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { login: setAuth } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const username = (email || '').trim().toLowerCase();
      await authService.signup({ username, email, password });
      // Auto login para habilitar inmediatamente el carrito
      const loginResponse = await authService.login({ username, password });
      console.log('Login response:', loginResponse);
      console.log('Auto-login tokens saved:', !!localStorage.getItem('accessToken'));
      setAuth({ email });
      setSuccess(true);
      setTimeout(() => {
        if (onNavigate) {
          onNavigate('home');
        }
      }, 1000);
    } catch (err) {
      const apiErr = err?.response?.data;
      if (apiErr) {
        // Mostrar errores específicos del backend si existen
        const firstKey = Object.keys(apiErr)[0];
        const msg = Array.isArray(apiErr[firstKey]) ? apiErr[firstKey][0] : (apiErr.detail || 'Error al crear la cuenta.');
        setError(String(msg));
      } else {
        setError(t('auth.createAccountError'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <section className="auth-page">
        <div className="auth-container">
          <h1 className="auth-title">{t('auth.accountCreated')}</h1>
          <div className="success-message">
            <p>{t('auth.accountCreatedSuccess')}</p>
            <p>{t('auth.redirectingToLogin')}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">{t('auth.createAccount')}</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>{t('auth.fullName')}</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder={t('auth.fullNamePlaceholder')}
              required 
            />
          </div>
          
          <div className="form-field">
            <label>{t('auth.email')}</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder={t('auth.emailPlaceholder')}
              required 
            />
          </div>
          
          <div className="form-field">
            <label>{t('auth.password')}</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder={t('auth.passwordPlaceholder')}
              required 
            />
          </div>
          
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? t('auth.creating') : t('auth.createAccount')}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>{t('auth.hasAccount')} 
            <button 
              className="link-button" 
              onClick={() => onNavigate && onNavigate('login')}
            >
              {t('auth.loginHere')}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Signup;


