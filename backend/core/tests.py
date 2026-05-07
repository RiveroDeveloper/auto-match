from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from .models import Vehicle, Make, Category, Dealer, User

class VehicleAvailabilityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Crear datos de prueba
        self.make_toyota = Make.objects.create(name="Toyota")
        self.make_honda = Make.objects.create(name="Honda")
        
        self.category_suv = Category.objects.create(name="SUV")
        self.category_sedan = Category.objects.create(name="Sedan")
        
        # Crear usuario y dealer para asignar como vendedor
        self.user = User.objects.create_user(username='dealer', password='password')
        self.dealer = Dealer.objects.create(user=self.user, name="Test Dealer")
        
        # Vehículo disponible (Toyota SUV)
        self.vehicle_available = Vehicle.objects.create(
            model="RAV4",
            year=2022,
            color="Blue",
            price=30000.00,
            make=self.make_toyota,
            category=self.category_suv,
            seller=self.dealer,
            is_available=True
        )
        
        # Vehículo NO disponible (Honda Sedan)
        self.vehicle_unavailable = Vehicle.objects.create(
            model="Civic",
            year=2021,
            color="Red",
            price=25000.00,
            make=self.make_honda,
            category=self.category_sedan,
            seller=self.dealer,
            is_available=False
        )
        
        # Otro vehículo disponible (Honda SUV)
        self.vehicle_available_2 = Vehicle.objects.create(
            model="CR-V",
            year=2023,
            color="White",
            price=35000.00,
            make=self.make_honda,
            category=self.category_suv,
            seller=self.dealer,
            is_available=True
        )

    def test_get_available_vehicles(self):
        """Prueba que solo se retornen vehículos con is_available=True"""
        response = self.client.get('/car-store/api/v1/vehicles/available/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Deberían ser 2 vehículos disponibles
        self.assertEqual(len(response.data), 2)
        
        # Verificar IDs
        ids = [v['id'] for v in response.data]
        self.assertIn(self.vehicle_available.id, ids)
        self.assertIn(self.vehicle_available_2.id, ids)
        self.assertNotIn(self.vehicle_unavailable.id, ids)
        
        # Verificar campos extra
        self.assertIn('vehicle_url', response.data[0])
        self.assertIn('make_name', response.data[0])

    def test_filter_by_make(self):
        """Prueba filtrado por marca"""
        response = self.client.get('/car-store/api/v1/vehicles/available/?make=Toyota')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.vehicle_available.id)

    def test_filter_by_category(self):
        """Prueba filtrado por categoría"""
        response = self.client.get('/car-store/api/v1/vehicles/available/?category=SUV')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_filter_by_price(self):
        """Prueba filtrado por rango de precios"""
        # Precio entre 28000 y 32000 (debería incluir solo el RAV4 de 30000)
        response = self.client.get('/car-store/api/v1/vehicles/available/?min_price=28000&max_price=32000')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['id'], self.vehicle_available.id)

from unittest.mock import patch, Mock
from .services.exchange_rate_service import ExchangeRateService

class ExchangeRateServiceTests(TestCase):
    @patch('core.services.exchange_rate_service.requests.get')
    def test_get_exchange_rates_success(self, mock_get):
        # Configurar el mock
        mock_response = Mock()
        expected_data = {'base': 'USD', 'rates': {'EUR': 0.85, 'COP': 4000}}
        mock_response.json.return_value = expected_data
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        # Llamar al servicio
        rates = ExchangeRateService.get_exchange_rates('USD')

        # Verificar resultados
        self.assertEqual(rates, expected_data)
        mock_get.assert_called_once()

    @patch('core.services.exchange_rate_service.requests.get')
    def test_get_exchange_rates_cache(self, mock_get):
        # Limpiar caché
        from django.core.cache import cache
        cache.clear()

        # Configurar mock
        mock_response = Mock()
        expected_data = {'base': 'USD', 'rates': {'EUR': 0.85}}
        mock_response.json.return_value = expected_data
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        # Primera llamada (debe ir a la API)
        ExchangeRateService.get_exchange_rates('USD')
        mock_get.assert_called_once()

        # Segunda llamada (debe ir al caché)
        ExchangeRateService.get_exchange_rates('USD')
        # El número de llamadas no debe aumentar
        mock_get.assert_called_once()
