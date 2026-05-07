import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../Auth.css';
import { useServices } from '../../../contexts/ServicesContext';
import { useAuth } from '../../../contexts/AuthContext';

const Login = ({ onNavigate }) => {
  const { t } = useTranslation();
  const { auth: authService } = useServices();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login: authLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.login({ username: email, password });
      console.log('Login successful, tokens saved:', !!localStorage.getItem('accessToken'));
      authLogin({ email });
      // Redirigir al home después del login exitoso
      if (onNavigate) {
        onNavigate('home');
      }
    } catch (err) {
      setError(t('auth.invalidCredentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">{t('auth.login')}</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label>{t('auth.username')}</label>
            <input 
              type="text" 
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
            {loading ? t('auth.loggingIn') : t('auth.login')}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>{t('auth.noAccount')} 
            <button 
              className="link-button" 
              onClick={() => onNavigate && onNavigate('signup')}
            >
              {t('auth.signup')}
            </button>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Login;


