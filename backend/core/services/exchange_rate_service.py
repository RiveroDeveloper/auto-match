import requests
from django.core.cache import cache
from django.conf import settings
from datetime import datetime
from typing import Dict, Optional

class ExchangeRateService:
    API_URL = "https://api.exchangerate-api.com/v4/latest/"
    CACHE_TIMEOUT = 86400  # 24 horas en segundos
    CACHE_KEY_PREFIX = "exchange_rates_"
    REQUEST_TIMEOUT = 10  # Timeout en segundos para requests HTTP

    @classmethod
    def get_exchange_rates(cls, base_currency='USD') -> Dict:
        """
        Obtiene las tasas de cambio para una moneda base.
        Primero intenta obtenerlas del caché, si no existen, consulta la API externa.
        
        Args:
            base_currency: Código de moneda base (default: 'USD')
            
        Returns:
            Dict con las tasas de cambio o error estructurado
        """
        cache_key = f"{cls.CACHE_KEY_PREFIX}{base_currency}"
        cached_data = cache.get(cache_key)

        if cached_data:
            return cached_data

        try:
            response = requests.get(
                f"{cls.API_URL}{base_currency}",
                timeout=cls.REQUEST_TIMEOUT
            )
            response.raise_for_status()
            data = response.json()
            
            # Agregar timestamp de última actualización
            data['last_updated'] = datetime.utcnow().isoformat()
            data['base_currency'] = base_currency
            
            # Guardar en caché
            cache.set(cache_key, data, cls.CACHE_TIMEOUT)
            return data
            
        except requests.Timeout:
            # Intentar retornar datos antiguos del caché si existen
            stale_data = cache.get(cache_key)
            if stale_data:
                stale_data['stale'] = True
                stale_data['error'] = 'Timeout fetching fresh rates, using cached data'
                return stale_data
            return {
                "error": "Request timeout",
                "details": f"Could not fetch exchange rates within {cls.REQUEST_TIMEOUT} seconds",
                "base_currency": base_currency
            }
            
        except requests.RequestException as e:
            # Intentar retornar datos antiguos del caché si existen
            stale_data = cache.get(cache_key)
            if stale_data:
                stale_data['stale'] = True
                stale_data['error'] = 'Error fetching fresh rates, using cached data'
                return stale_data
            return {
                "error": "Could not fetch exchange rates",
                "details": str(e),
                "base_currency": base_currency
            }

    @classmethod
    def convert_price(cls, amount: float, from_currency: str, to_currency: str) -> Dict:
        """
        Convierte un precio de una moneda a otra.
        
        Args:
            amount: Cantidad a convertir
            from_currency: Moneda origen (ej: 'COP')
            to_currency: Moneda destino (ej: 'USD', 'EUR')
            
        Returns:
            Dict con el precio convertido o error
        """
        if amount < 0:
            return {
                "error": "Invalid amount",
                "details": "Amount must be positive"
            }
        
        if from_currency == to_currency:
            return {
                "original_amount": amount,
                "converted_amount": amount,
                "from_currency": from_currency,
                "to_currency": to_currency,
                "rate": 1.0
            }
        
        # Obtener tasas de cambio (usando USD como base común)
        rates_data = cls.get_exchange_rates('USD')
        
        if "error" in rates_data:
            return rates_data
        
        rates = rates_data.get('rates', {})
        
        # Si la moneda origen es USD, usar tasa directa
        if from_currency == 'USD':
            if to_currency not in rates:
                return {
                    "error": "Currency not supported",
                    "details": f"Currency {to_currency} not found in exchange rates"
                }
            rate = rates[to_currency]
            converted = amount * rate
        # Si la moneda destino es USD, usar inversa
        elif to_currency == 'USD':
            if from_currency not in rates:
                return {
                    "error": "Currency not supported",
                    "details": f"Currency {from_currency} not found in exchange rates"
                }
            rate = 1 / rates[from_currency]
            converted = amount * rate
        # Conversión entre dos monedas no-USD
        else:
            if from_currency not in rates or to_currency not in rates:
                return {
                    "error": "Currency not supported",
                    "details": f"One or both currencies ({from_currency}, {to_currency}) not found in exchange rates"
                }
            # Convertir: origen -> USD -> destino
            from_rate = rates[from_currency]
            to_rate = rates[to_currency]
            rate = to_rate / from_rate
            converted = amount * rate
        
        return {
            "original_amount": amount,
            "converted_amount": round(converted, 2),
            "from_currency": from_currency,
            "to_currency": to_currency,
            "rate": rate,  # Mantener precisión completa del rate para cálculos precisos
            "last_updated": rates_data.get('last_updated')
        }
