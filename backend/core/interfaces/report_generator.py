from abc import ABC, abstractmethod
from typing import Any

class IVehicleReportGenerator(ABC):
    """
    Interfaz (Abstracción) para generadores de reportes de vehículos.
    Define el contrato que deben seguir las implementaciones concretas.
    """
    @abstractmethod
    def generate_report(self, vehicle: Any) -> bytes:
        """
        Genera un reporte para el vehículo dado.
        
        Args:
            vehicle: Instancia del modelo Vehicle
            
        Returns:
            bytes: Contenido del reporte generado
        """
        pass
