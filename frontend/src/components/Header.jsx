import React from 'react';
import { useTranslation } from 'react-i18next';
import './Header.css';
import logoImage from '../assets/Logo-automatch-sin-fondo.png';
import { useAuth } from '../contexts/AuthContext';
import CurrencySelector from './CurrencySelector';

const Header = ({ currentPage, onNavigate }) => {
  const { isAuthenticated, user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  
  const handleNavigation = (page) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <div 
          className="logo" 
          onClick={() => handleNavigation('home')}
          style={{ cursor: 'pointer' }}
        >
          <img 
            src={logoImage} 
            alt="AutoMatch Logo" 
            className="logo-image"
          />
          <span className="logo-text">AutoMatch</span>
        </div>

        {/* Navigation */}
        <nav className="nav">
          <button 
            className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavigation('home')}
          >
            {t('nav.home')}
          </button>

          <button 
            className={`nav-link ${currentPage === 'search' ? 'active' : ''}`}
            onClick={() => handleNavigation('search')}
          >
            {t('nav.vehicles')}
          </button>

          <button 
            className={`nav-link ${currentPage === 'comparison' ? 'active' : ''}`}
            onClick={() => handleNavigation('comparison')}
          >
            {t('nav.compare')}
          </button>
          <button 
            className={`nav-link ${currentPage === 'features' ? 'active' : ''}`}
            onClick={() => handleNavigation('features')}
          >
            {t('nav.features')}
          </button>
          <button 
            className={`nav-link ${currentPage === 'cart' ? 'active' : ''}`}
            onClick={() => handleNavigation('cart')}
          >
            {t('nav.cart')}
          </button>

          {isAuthenticated ? (
            <>
              <button 
                className={`nav-link ${currentPage === 'admin' ? 'active' : ''}`} 
                onClick={() => handleNavigation('admin')}
              >
                {t('nav.admin')}
              </button>
              <button 
                className="nav-link" 
                onClick={() => {
                  logout();
                  handleNavigation('home');
                }}
              >
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <button 
                className={`nav-link ${currentPage === 'signup' ? 'active' : ''}`} 
                onClick={() => handleNavigation('signup')}
              >
                {t('nav.signup')}
              </button>

              <button
                className={`nav-link ${currentPage === 'login' ? 'active' : ''}`} 
                onClick={() => handleNavigation('login')}
              >
                {t('nav.login')}
              </button>
            </>
          )}
        </nav>

        {/* Currency and Language Selectors */}
        <div className="header-controls">
          <CurrencySelector />
          <div className="language-selector">
            <button 
              className={`nav-link ${i18n.language === 'es' ? 'active' : ''}`}
              onClick={() => changeLanguage('es')}
              style={{ padding: '5px 10px', fontSize: '0.9em' }}
            >
              ES
            </button>
            <button 
              className={`nav-link ${i18n.language === 'en' ? 'active' : ''}`}
              onClick={() => changeLanguage('en')}
              style={{ padding: '5px 10px', fontSize: '0.9em' }}
            >
              EN
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};

export default Header;
