import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import VehicleForm from '../../components/VehicleForm';
import VehicleList from '../../components/VehicleList';
import './Admin.css';

const Admin = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('add');
  const [refresh, setRefresh] = useState(false);

  const handleVehicleCreated = () => {
    setRefresh(!refresh);
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <h1>{t('admin.title')}</h1>
        
        <div className="admin-tabs">
          <button 
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            {t('admin.addVehicle')}
          </button>
          <button 
            className={`tab-button ${activeTab === 'manage' ? 'active' : ''}`}
            onClick={() => setActiveTab('manage')}
          >
            {t('admin.manageVehicles')}
          </button>
        </div>

        <div className="admin-content">
          {activeTab === 'add' && (
            <div className="admin-section">
              <h2>{t('admin.addNewVehicle')}</h2>
              <VehicleForm vehicleCreated={handleVehicleCreated} />
            </div>
          )}
          
          {activeTab === 'manage' && (
            <div className="admin-section">
              <h2>{t('admin.registeredVehicles')}</h2>
              <VehicleList key={refresh} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;