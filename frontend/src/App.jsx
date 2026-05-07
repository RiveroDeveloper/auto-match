import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Differentiator from './components/Differentiator';
import SearchResults from './pages/SearchResults/SearchResults';
import VehicleDetails from './pages/VehicleDetails/VehicleDetails';
import VehicleComparison from './pages/VehicleComparison/VehicleComparison';
import Features from './pages/Features/Features';
import Signup from './pages/AuthPages/Signup/Signup';
import Login from './pages/AuthPages/Login/Login';
import CartPage from './pages/CartPage/CartPage';
import Admin from './pages/Admin/Admin';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ComparisonProvider } from './contexts/ComparisonContext';
import { ServicesProvider } from './contexts/ServicesContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import './App.css';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchFilters, setSearchFilters] = useState(null);
  const { isAuthenticated, user } = useAuth();

  const handleSearch = (searchData) => {
    console.log('Hero search data received:', searchData);
    setSearchFilters(searchData);
    setCurrentPage('search');
  };

  const handleViewDetails = (vehicleId) => {
    setSelectedVehicle(vehicleId);
    setCurrentPage('details');
  };

  const handleBackToSearch = () => {
    setCurrentPage('search');
    setSelectedVehicle(null);
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
    setSelectedVehicle(null);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'cart':
        return <CartPage onViewDetails={handleViewDetails} />;
      case 'search':
        return <SearchResults onViewDetails={handleViewDetails} initialFilters={searchFilters} />;
      case 'details':
        return <VehicleDetails vehicleId={selectedVehicle} onBack={handleBackToSearch} />;
      case 'comparison':
        return <VehicleComparison onBack={handleBackToHome} />;
      case 'features':
        return <Features />;
      case 'signup':
        return <Signup onNavigate={setCurrentPage} />;
      case 'login':
        return <Login onNavigate={setCurrentPage} />;
      case 'admin':
        return <Admin />;
      case 'home':
      default:
        return (
          <>
            <Hero onSearch={handleSearch} />
            <Differentiator />
          </>
        );
    }
  };

  return (
    <div className="App">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ServicesProvider>
        <AuthProvider>
          <CurrencyProvider>
            <ComparisonProvider>
              <AppContent />
            </ComparisonProvider>
          </CurrencyProvider>
        </AuthProvider>
      </ServicesProvider>
    </ErrorBoundary>
  );
}

export default App;
