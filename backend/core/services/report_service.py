from core.interfaces.report_generator import IVehicleReportGenerator

class VehicleReportService:
    """
    Servicio de alto nivel que coordina la generación de reportes.
    Depende de la abstracción IVehicleReportGenerator, no de implementaciones concretas.
    """
    def __init__(self, generator: IVehicleReportGenerator):
        """
        Inyección de dependencia a través del constructor.
        
        Args:
            generator: Una implementación concreta de IVehicleReportGenerator
        """
        self.generator = generator

    def generate_vehicle_report(self, vehicle) -> bytes:
        """
        Delega la generación del reporte al generador inyectado.
        """
        return self.generator.generate_report(vehicle)
