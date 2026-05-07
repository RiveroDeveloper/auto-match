import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import SearchFilters from '../../components/SearchFilters';
import VehicleCard from '../../components/VehicleCard';
import { getVehicles, searchVehicles } from '../../services/vehicleService';
import { getMakes } from '../../services/makeService';
import { getCategories } from '../../services/categoryService';
import './SearchResults.css';

const SearchResults = ({ onViewDetails, initialFilters }) => {
  const { t } = useTranslation();
  console.log('SearchResults renderizado');
  console.log('Initial filters received:', initialFilters);
  
  const [filters, setFilters] = useState({
    search: '',
    priceMin: '',
    priceMax: '',
    brands: [],
    yearFrom: '',
    yearTo: '',
    color: '',
    category: ''
  });

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [sortedVehicles, setSortedVehicles] = useState([]);
  const [sortBy, setSortBy] = useState('bestMatch');
  const [loading, setLoading] = useState(true);
  const [makes, setMakes] = useState([]);
  const [categories, setCategories] = useState([]);

  // Aplicar filtros iniciales del hero
  useEffect(() => {
    if (initialFilters) {
      console.log('Applying initial filters:', initialFilters);
      const newFilters = { ...filters };
      
      // Mapear brand del hero a brands array
      if (initialFilters.brand) {
        console.log('Hero brand received:', initialFilters.brand);
        newFilters.brands = [initialFilters.brand];
        console.log('Brands array set to:', newFilters.brands);
      }
      
      // Mapear model del hero a search
      if (initialFilters.model) {
        newFilters.search = initialFilters.model;
      }
      
      // Mapear budget del hero a priceMin y priceMax
      if (initialFilters.budget) {
        console.log('Hero budget received:', initialFilters.budget);
        const [min, max] = initialFilters.budget.split('-');
        console.log('Split budget - min:', min, 'max:', max);
        
        if (min) {
          newFilters.priceMin = parseFloat(min);
          console.log('Price min set from hero:', newFilters.priceMin);
        }
        if (max) {
          if (max === '+') {
            // Para rangos con "+", solo establecer priceMin
            newFilters.priceMin = parseFloat(min);
            console.log('Price min set for + range:', newFilters.priceMin);
          } else {
            newFilters.priceMax = parseFloat(max);
            console.log('Price max set from hero:', newFilters.priceMax);
          }
        }
      }
      
      console.log('New filters after mapping:', newFilters);
      setFilters(newFilters);
      
      // Marcar que hay filtros activos para ejecutar búsqueda automáticamente
      setTimeout(() => {
        performSearch(newFilters);
      }, 100);
    }
  }, [initialFilters]);

  // Cargar datos iniciales del backend
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        
        // Cargar vehículos, marcas y categorías en paralelo
        const [vehiclesData, makesData, categoriesData] = await Promise.all([
          getVehicles(),
          getMakes(),
          getCategories()
        ]);
        
        console.log('=== DATOS RECIBIDOS DEL BACKEND ===');
        console.log('vehiclesData tipo:', typeof vehiclesData, 'es array?', Array.isArray(vehiclesData));
        console.log('vehiclesData:', vehiclesData);
        console.log('vehiclesData.length:', vehiclesData?.length);
        console.log('makesData:', makesData);
        console.log('categoriesData:', categoriesData);
        
        // Validar que vehiclesData sea un array
        if (!Array.isArray(vehiclesData)) {
          console.error('❌ ERROR: vehiclesData no es un array:', vehiclesData);
          console.error('Tipo recibido:', typeof vehiclesData);
          throw new Error(`Formato de datos inválido del backend. Tipo recibido: ${typeof vehiclesData}`);
        }
        
        if (vehiclesData.length === 0) {
          console.warn('⚠️ ADVERTENCIA: El backend devolvió un array vacío');
        }
        
        // Transformar datos del backend al formato esperado por el frontend
        const transformedVehicles = vehiclesData.map(vehicle => ({
          id: vehicle.id,
          image: vehicle.image_url || (vehicle.image ? `http://localhost:8000${vehicle.image}` : '/images/default-car.jpg'),
          brand: vehicle.make_name || vehicle.make?.name || t('vehicle.noBrand'),
          model: vehicle.model,
          year: vehicle.year,
          price: parseFloat(vehicle.price),
          color: vehicle.color,
          category: vehicle.category_name || vehicle.category?.name || t('vehicle.noCategory'),
          make_id: vehicle.make,
          category_id: vehicle.category,
          // Datos adicionales para compatibilidad visual
          rating: 4.5,
          specifications: [
            { icon: '⛽', value: 'Gasolina' },
            { icon: '🔄', value: 'Automática' },
            { icon: '👥', value: '5 pasajeros' }
          ],
          location: t('dealership.country'),
          isAvailable: true,
          isPromoted: false
        }));

        setVehicles(transformedVehicles);
        setFilteredVehicles(transformedVehicles);
        setSortedVehicles(transformedVehicles);
        setMakes(makesData);
        setCategories(categoriesData);
        
        console.log('Datos cargados:', {
          vehicles: transformedVehicles.length,
          makes: makesData.length,
          categories: categoriesData.length
        });
        console.log('Primeros 3 vehículos:', transformedVehicles.slice(0, 3));
      } catch (error) {
        console.error('❌ ERROR cargando datos iniciales:', error);
        console.error('Error completo:', {
          message: error.message,
          response: error.response,
          data: error.response?.data,
          status: error.response?.status,
          config: error.config
        });
        // No establecer arrays vacíos inmediatamente, mantener el estado anterior
        // para que el usuario vea que hubo un error
        setVehicles([]);
        setFilteredVehicles([]);
        setSortedVehicles([]);
        setMakes([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleSortChange = (sortType) => {
    setSortBy(sortType);
  };

  const handleViewDetails = (vehicleId) => {
    if (onViewDetails) {
      onViewDetails(vehicleId);
    }
  };

  const handleCompare = (vehicleId) => {
    console.log('Add to comparison:', vehicleId);
    // Agregar a la comparación
  };

  // Función para realizar búsqueda manual
  const performSearch = async (customFilters = null) => {
    console.log('=== PERFORM SEARCH CALLED ===');
    console.log('Custom filters:', customFilters);
    console.log('Current filters:', filters);
    try {
      setLoading(true);
      
      const filtersToUse = customFilters || filters;
      
      // Preparar parámetros para la búsqueda del backend
      const searchParams = {};
      
      if (filtersToUse.search) {
        searchParams.search = filtersToUse.search;
      }
      
      if (filtersToUse.priceMin) {
        searchParams.price_min = parseFloat(filtersToUse.priceMin);
        console.log('Price min set to:', searchParams.price_min);
      }
      
      if (filtersToUse.priceMax) {
        searchParams.price_max = parseFloat(filtersToUse.priceMax);
        console.log('Price max set to:', searchParams.price_max);
      }
      
      if (filtersToUse.yearFrom) {
        searchParams.year_from = parseInt(filtersToUse.yearFrom);
      }
      
      if (filtersToUse.yearTo) {
        searchParams.year_to = parseInt(filtersToUse.yearTo);
      }
      
      if (filtersToUse.brands && filtersToUse.brands.length > 0) {
        searchParams.brands = filtersToUse.brands;
      }
      
      if (filtersToUse.color) {
        searchParams.color = filtersToUse.color;
      }
      
      if (filtersToUse.category) {
        searchParams.category_id = filtersToUse.category;
      }
      
      console.log('Parámetros de búsqueda enviados:', searchParams);
      console.log('Filtros activos:', filtersToUse);
      
      // Verificar si hay algún filtro activo
      const hasActiveFilters = Object.keys(searchParams).length > 0;
      
      if (hasActiveFilters) {
        // Hay filtros activos, usar búsqueda del backend
        const results = await searchVehicles(searchParams);
        console.log('Resultados del backend:', results);
        
        // Adaptar resultados a la tarjeta
        const adapted = results.map(vehicle => ({
        id: vehicle.id,
        image: vehicle.image_url || (vehicle.image ? `http://localhost:8000${vehicle.image}` : '/images/default-car.jpg'),
        brand: vehicle.make_name || vehicle.make?.name || t('vehicle.noBrand'),
        model: vehicle.model,
        year: vehicle.year,
        price: parseFloat(vehicle.price),
        color: vehicle.color,
        category: vehicle.category_name || vehicle.category?.name || t('vehicle.noCategory'),
        make_id: vehicle.make,
        category_id: vehicle.category,
        rating: 4.5,
        specifications: [
          { icon: '⛽', value: 'Gasolina' },
          { icon: '🔄', value: 'Automática' },
          { icon: '👥', value: '5 pasajeros' }
        ],
        location: t('dealership.country'),
        isAvailable: true,
        isPromoted: false
        }));
        
        console.log('Vehículos adaptados:', adapted);
        setFilteredVehicles(adapted);
      } else {
        // No hay filtros activos, usar los vehículos ya cargados
        console.log('No hay filtros activos, mostrando todos los vehículos cargados');
        setFilteredVehicles(vehicles);
      }
    } catch (error) {
      console.error('Error en búsqueda del backend:', error);
      console.error('Detalles del error:', error.response?.data);
      
      // En caso de error, mostrar todos los vehículos
      setFilteredVehicles(vehicles);
      setSortedVehicles(vehicles);
    } finally {
      setLoading(false);
    }
  };

  // Ordenar vehículos
  useEffect(() => {
    let sorted = [...filteredVehicles];

    switch (sortBy) {
      case 'priceLow':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'priceHigh':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'yearNew':
        sorted.sort((a, b) => b.year - a.year);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default: // bestMatch
        // Mantener orden original
        break;
    }

    setSortedVehicles(sorted);
  }, [sortBy, filteredVehicles]);

  if (loading) {
    return (
      <div className="search-results-loading">
        <div className="loading-spinner"></div>
        <p>{t('common.loadingVehicles')}</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results-container">
        {/* Sidebar con filtros */}
        <aside className="search-sidebar">
          <SearchFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            makes={makes}
            categories={categories}
            onSearch={performSearch}
          />
        </aside>

        {/* Contenido principal */}
        <main className="search-main">
          {/* Header de resultados */}
          <div className="results-header">
            <div className="results-info">
              <h2 className="results-title">
                {t('search.showing', { count: sortedVehicles.length })}
              </h2>
              <p className="results-subtitle">
                {t('search.findPerfect')}
              </p>
            </div>
            
            <div className="results-controls">
              <div className="sort-control">
                <label htmlFor="sort-select">{t('search.sortBy')}</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  className="sort-select"
                >
                  <option value="bestMatch">{t('search.bestMatch')}</option>
                  <option value="priceLow">{t('search.priceLow')}</option>
                  <option value="priceHigh">{t('search.priceHigh')}</option>
                  <option value="yearNew">{t('search.yearNew')}</option>
                  <option value="rating">{t('search.rating')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid de vehículos */}
          <div className="vehicles-grid">
            {sortedVehicles.length > 0 ? (
              sortedVehicles.map(vehicle => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onViewDetails={handleViewDetails}
                  onCompare={handleCompare}
                />
              ))
            ) : (
              <div className="no-results">
                <div className="no-results-icon">🚗</div>
                <h3>{t('search.noResults')}</h3>
                <p>{t('search.noResultsDesc')}</p>
                <button 
                  className="btn-primary"
                  onClick={() => {
                    const resetFilters = {
                      search: '',
                      priceMin: '',
                      priceMax: '',
                      brands: [],
                      yearFrom: '',
                      yearTo: '',
                      color: '',
                      category: ''
                    };
                    setFilters(resetFilters);
                  }}
                >
                  {t('common.clearFilters')}
                </button>
              </div>
            )}
          </div>

          {/* Paginación */}
          {sortedVehicles.length > 0 && (
            <div className="pagination">
              <button className="pagination-btn" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                </svg>
                {t('common.previous')}
              </button>
              
              <div className="pagination-numbers">
                <button className="pagination-number active">1</button>
                <button className="pagination-number">2</button>
                <button className="pagination-number">3</button>
                <span className="pagination-dots">...</span>
                <button className="pagination-number">10</button>
              </div>
              
              <button className="pagination-btn">
                {t('common.next')}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                </svg>
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default SearchResults;
