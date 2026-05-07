from django.shortcuts import render
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from .services import VehicleSearch
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework.authentication import SessionAuthentication
from rest_framework import status
# Importar funciones de traducción para i18n
from django.utils.translation import gettext as _
from django.utils.translation import get_language, activate
# Esto de abajo es para importar los datos serializados y mostrarlos en la vista
from .serializer import (
    MakeSerializer, CategorySerializer, VehicleSerializer, 
    UserSerializer, RoleSerializer, BuyerSerializer, 
    ExpertSerializer, ReviewSerializer, CartSerializer, CartItemSerializer
)
from .models import Make, Category, Vehicle, User, Role, Buyer, Expert, Review, Cart, CartItem

from rest_framework import status
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from rest_framework.permissions import AllowAny
from django.http import HttpResponse
from .services.report_service import VehicleReportService

User = get_user_model()

class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MakeViewSet(viewsets.ModelViewSet):
    queryset = Make.objects.all()
    serializer_class = MakeSerializer
    permission_classes = [AllowAny]  # Público para listar marcas
    authentication_classes = []  # No requiere autenticación

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]  # Público para listar categorías
    authentication_classes = []  # No requiere autenticación

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class BuyerViewSet(viewsets.ModelViewSet):
    queryset = Buyer.objects.all()
    serializer_class = BuyerSerializer

class ExpertViewSet(viewsets.ModelViewSet):
    queryset = Expert.objects.all()
    serializer_class = ExpertSerializer

class VehicleViewSet(viewsets.ModelViewSet):
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    permission_classes = [AllowAny]  # Público para listar y ver vehículos
    authentication_classes = []  # No requiere autenticación
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    # Acción básica: filtrar por marca (sin servicio)
    @action(detail=False, methods=['get'])
    def by_make(self, request):
        make_id = request.query_params.get('make_id')
        if make_id:
            vehicles = Vehicle.objects.filter(make_id=make_id)
            serializer = self.get_serializer(vehicles, many=True)
            return Response(serializer.data)
        return Response([])
    
    # Acción básica: filtrar por categoría (sin servicio)
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        category_id = request.query_params.get('category_id')
        if category_id:
            vehicles = Vehicle.objects.filter(category_id=category_id)
            serializer = self.get_serializer(vehicles, many=True)
            return Response(serializer.data)
        return Response([])
    
    # Acción avanzada: búsqueda inteligente (USANDO TU SERVICIO)
    @action(detail=False, methods=['get'])
    def search(self, request):
        # Debug: imprimir parámetros recibidos
        print("=== BÚSQUEDA INTELIGENTE ===")
        print("Parámetros recibidos:", dict(request.GET))
        print("QueryDict completo:", request.GET)
        print("Brands específicamente:", request.GET.getlist('brands'))
        
        # Verificar si hay algún parámetro de búsqueda
        has_params = any([
            request.GET.get('search'),
            request.GET.get('price_min'),
            request.GET.get('price_max'),
            request.GET.get('year_from'),
            request.GET.get('year_to'),
            request.GET.getlist('brands'),
        ])
        
        print(f"¿Hay parámetros de búsqueda? {has_params}")
        
        # Usar el servicio de búsqueda inteligente
        search_service = VehicleSearch(request.GET)
        vehicles = search_service.execute()
        
        print(f"Vehículos encontrados: {vehicles.count()}")
        print("Primeros 3 vehículos:")
        for v in vehicles[:3]:
            print(f"  - {v.year} {v.make.name} {v.model}")
        print("=== FIN BÚSQUEDA ===")
        
        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def available(self, request):
        """
        Retorna lista de vehículos disponibles (is_available=True).
        Soporta filtros: make, category, min_price, max_price.
        """
        from .serializer import AvailableVehicleSerializer
        
        queryset = self.get_queryset().filter(is_available=True)
        
        # Filtros
        make = request.query_params.get('make')
        if make:
            queryset = queryset.filter(make__name__icontains=make)
            
        category = request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__name__icontains=category)
            
        min_price = request.query_params.get('min_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
            
        max_price = request.query_params.get('max_price')
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
            
        serializer = AvailableVehicleSerializer(queryset, many=True, context={'request': request})
        return Response(serializer.data)
    
    # Acción para obtener sugerencias de búsqueda
    @action(detail=False, methods=['get'])
    def suggestions(self, request):
        """Obtener sugerencias para autocompletado"""
        query = request.GET.get('q', '').strip()
        suggestions = []
        
        if len(query) >= 2:
            # Buscar en modelos
            models = Vehicle.objects.filter(
                model__icontains=query
            ).values_list('model', flat=True).distinct()[:5]
            
            # Buscar en marcas
            makes = Make.objects.filter(
                name__icontains=query
            ).values_list('name', flat=True).distinct()[:5]
            
            # Buscar en categorías
            categories = Category.objects.filter(
                name__icontains=query
            ).values_list('name', flat=True).distinct()[:5]
            
            suggestions = {
                'models': list(models),
                'makes': list(makes),
                'categories': list(categories)
            }
        
        return Response(suggestions)
    
    # Acción para debug - verificar datos
    @action(detail=False, methods=['get'])
    def debug(self, request):
        """Endpoint para debug - verificar qué datos tenemos"""
        debug_info = {
            'total_vehicles': Vehicle.objects.count(),
            'total_makes': Make.objects.count(),
            'total_categories': Category.objects.count(),
            'makes': list(Make.objects.values('id', 'name')),
            'categories': list(Category.objects.values('id', 'name')),
            'vehicles_sample': list(Vehicle.objects.select_related('make', 'category').values(
                'id', 'model', 'make__name', 'category__name', 'year', 'price'
            )[:5])
        }
        return Response(debug_info)
    
    # Acción para descargar reporte del vehículo (PDF o Excel)
    @action(detail=True, methods=['get'])
    def download_report(self, request, pk=None):
        """
        Genera y descarga un reporte del vehículo en formato PDF o Excel.
        Demuestra el Principio de Inversión de Dependencias (DIP).
        
        Parámetros de query:
        - format: 'pdf' (default) o 'excel'
        """
        vehicle = self.get_object()
        
        # Obtener formato solicitado (default: PDF)
        report_format = request.query_params.get('format', 'pdf').lower()
        
        # Inyección de Dependencias (Manual)
        # El servicio (Alto Nivel) recibe la implementación concreta (Bajo Nivel)
        # pero depende solo de la abstracción (Interfaz).
        # Esto demuestra el Principio de Inversión de Dependencias (DIP):
        # - Alto nivel (VehicleReportService) depende de la abstracción (IVehicleReportGenerator)
        # - Bajo nivel (PdfReportGenerator, ExcelReportGenerator) implementa la abstracción
        if report_format == 'excel':
            from .services.report_generators.excel_generator import ExcelReportGenerator
            generator = ExcelReportGenerator()
            content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            extension = 'xlsx'
        else:
            from .services.report_generators.pdf_generator import PdfReportGenerator
            generator = PdfReportGenerator()
            content_type = 'application/pdf'
            extension = 'pdf'
        
        service = VehicleReportService(generator)
        report_content = service.generate_vehicle_report(vehicle)
        
        response = HttpResponse(report_content, content_type=content_type)
        filename = f"reporte_{vehicle.make.name}_{vehicle.model}.{extension}".replace(" ", "_")
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    
    # Acción básica: reseñas por vehículo
    @action(detail=False, methods=['get'])
    def by_vehicle(self, request):
        vehicle_id = request.query_params.get('vehicle_id')
        if vehicle_id:
            reviews = Review.objects.filter(vehicle_id=vehicle_id)
            serializer = self.get_serializer(reviews, many=True)
            return Response(serializer.data)
        return Response([])
    
    # Acción básica: reseñas por experto
    @action(detail=False, methods=['get'])
    def by_expert(self, request):
        expert_id = request.query_params.get('expert_id')
        if expert_id:
            reviews = Review.objects.filter(author_id=expert_id)
            serializer = self.get_serializer(reviews, many=True)
            return Response(serializer.data)
        return Response([])

    
class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartSerializer
    permission_classes = [AllowAny]  # Temporalmente para pruebas - permite tanto usuarios autenticados como anónimos

    def get_queryset(self):
        # Cada usuario solo puede ver su propio carrito
        print(f"=== CART GET_QUERYSET ===")
        print(f"User authenticated: {self.request.user.is_authenticated}")
        print(f"User: {self.request.user}")
        print(f"Auth header: {self.request.headers.get('Authorization', 'Not found')}")
        
        try:
            # Usar el usuario autenticado si existe, sino usar usuario de prueba
            if self.request.user.is_authenticated:
                user = self.request.user
                print(f"Using authenticated user: {user.username}")
            else:
                user = User.objects.first()  # Usar el primer usuario como prueba
                print(f"Using first user for testing: {user.username if user else 'No users found'}")
            
            if user:
                buyer, created = Buyer.objects.get_or_create(
                    user=user,
                    defaults={'usageProfile': 'General', 'preferences': []}
                )
                print(f"Buyer {'created' if created else 'found'}: {buyer}")
                cart, created = Cart.objects.get_or_create(buyer=buyer)
                print(f"Cart {'created' if created else 'found'}: {cart.id}")
                queryset = Cart.objects.filter(buyer=buyer)
                print(f"Queryset count: {queryset.count()}")
                return queryset
            
            print("No user found")
            return Cart.objects.none()
        except Exception as e:
            print(f"Error en get_queryset: {e}")
            import traceback
            traceback.print_exc()
            return Cart.objects.none()

    def list(self, request, *args, **kwargs):
        """Override list to return array directly instead of paginated response"""
        print(f"=== CART LIST METHOD ===")
        queryset = self.get_queryset()
        print(f"Queryset from get_queryset: {queryset.count()} items")
        serializer = self.get_serializer(queryset, many=True)
        print(f"Serialized data: {len(serializer.data)} items")
        print(f"Serialized content: {serializer.data}")
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """Agregar un vehículo al carrito del usuario actual sin requerir pk del carrito."""
        print(f"=== CART ADD ITEM ===")
        print(f"User authenticated: {request.user.is_authenticated}")
        print(f"User: {request.user}")
        print(f"Request data: {request.data}")
        
        try:
            # Determinar usuario (autenticado o primer usuario para pruebas)
            if request.user.is_authenticated:
                user = request.user
                print(f"Using authenticated user: {user.username}")
            else:
                user = User.objects.first()
                print(f"Using first user for testing: {user.username if user else 'No users found'}")

            if not user:
                print("ERROR: No hay usuarios en la base de datos")
                return Response({'error': 'No hay usuario disponible para crear carrito. Por favor, crea una cuenta primero.'}, status=status.HTTP_400_BAD_REQUEST)

            buyer, created_buyer = Buyer.objects.get_or_create(
                user=user,
                defaults={'usageProfile': 'General', 'preferences': []}
            )
            print(f"Buyer {'created' if created_buyer else 'found'}: {buyer}")
            
            cart, created_cart = Cart.objects.get_or_create(buyer=buyer)
            print(f"Cart {'created' if created_cart else 'found'}: {cart}")

            vehicle_id = request.data.get('vehicle_id')
            if not vehicle_id:
                return Response({'error': 'Vehicle ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

            try:
                vehicle = Vehicle.objects.get(id=vehicle_id)
                print(f"Vehicle found: {vehicle}")
            except Vehicle.DoesNotExist:
                print(f"ERROR: Vehicle {vehicle_id} not found")
                return Response({'error': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)

            cart_item, created = CartItem.objects.get_or_create(cart=cart, vehicle=vehicle)
            print(f"CartItem {'created' if created else 'found'}: {cart_item}")
            
            serializer = CartSerializer(cart)
            print(f"=== CART ADD SUCCESS ===")
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
        except Exception as e:
            print(f"ERROR in add_item: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'])
    def add_item(self, request, pk=None):
        cart = self.get_object() # Obtiene el carrito del usuario
        vehicle_id = request.data.get('vehicle_id')

        if not vehicle_id:
            return Response({'error': 'Vehicle ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            vehicle = Vehicle.objects.get(id=vehicle_id)
        except Vehicle.DoesNotExist:
            return Response({'error': 'Vehicle not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Crea o encuentra el item. 'defaults' solo se usa si se crea uno nuevo.
        # Gracias a unique_together, esto no creará duplicados.
        cart_item, created = CartItem.objects.get_or_create(cart=cart, vehicle=vehicle)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    @action(detail=True, methods=['post'])
    def remove_item(self, request, pk=None):
        cart = self.get_object()
        item_id = request.data.get('item_id')

        if not item_id:
            return Response({'error': 'CartItem ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            item = CartItem.objects.get(id=item_id, cart=cart)
            item.delete()
        except CartItem.DoesNotExist:
            return Response({'error': 'Item not found in your cart.'}, status=status.HTTP_404_NOT_FOUND)
        
        return Response(status=status.HTTP_204_NO_CONTENT)


# ViewSet para demostrar internacionalización
class LanguageViewSet(viewsets.ViewSet):
    """
    ViewSet para cambiar idioma y obtener mensajes traducidos.
    Demuestra el uso de i18n en Django.
    """
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'])
    def welcome(self, request):
        """
        Endpoint de ejemplo que retorna un mensaje de bienvenida traducido.
        Usa el idioma detectado automáticamente por LocaleMiddleware.
        
        El idioma se detecta en este orden:
        1. Header Accept-Language
        2. Cookie django_language
        3. Sesión django_language
        4. LANGUAGE_CODE en settings (por defecto: es)
        """
        current_language = get_language()
        
        # Debug: ver de dónde viene el idioma
        accept_language = request.headers.get('Accept-Language', 'Not set')
        cookie_language = request.COOKIES.get('django_language', 'Not set')
        session_language = request.session.get('django_language', 'Not set')
        
        print(f"=== LANGUAGE DEBUG ===")
        print(f"Current language: {current_language}")
        print(f"Accept-Language header: {accept_language}")
        print(f"Cookie django_language: {cookie_language}")
        print(f"Session django_language: {session_language}")
        
        message = _("Welcome to Car Store")
        
        return Response({
            'message': message,
            'language': current_language,
            'debug': {
                'accept_language_header': accept_language,
                'cookie': cookie_language,
                'session': session_language
            }
        })
    
    @action(detail=False, methods=['post'])
    def set_language(self, request):
        """
        Cambia el idioma de la sesión.
        Parámetros: language (es o en)
        
        Para usar el idioma en futuras requests, incluye el header:
        Accept-Language: es (o en)
        """
        language_code = request.data.get('language', 'es')
        
        if language_code not in ['es', 'en']:
            return Response(
                {'error': _("Language not supported")},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Activar el idioma para esta request
        activate(language_code)
        
        # Guardar en la sesión para futuras requests
        request.session['django_language'] = language_code
        
        # Crear respuesta con el mensaje traducido
        response = Response({
            'message': _("Language changed successfully"),
            'language': language_code,
            'instructions': 'Para futuras requests, usa el header Accept-Language: ' + language_code
        })
        
        # Establecer cookie de idioma (alternativa a sesión)
        response.set_cookie(
            key='django_language',
            value=language_code,
            max_age=365 * 24 * 60 * 60,  # 1 año
            httponly=False,
            samesite='Lax'
        )
        
        return response

class ExchangeRateViewSet(viewsets.ViewSet):
    """
    ViewSet para obtener tasas de cambio actuales y convertir precios.
    Endpoints:
    - GET /api/v1/exchange-rates/ - Obtener tasas de cambio
    - POST /api/v1/exchange-rates/convert/ - Convertir precio entre monedas
    """
    permission_classes = [AllowAny]
    authentication_classes = []  # No requiere autenticación

    def list(self, request):
        """
        Obtiene las tasas de cambio para una moneda base.
        Query params:
        - base: Código de moneda base (default: 'USD')
        """
        import importlib.util
        import os
        # Importar desde el directorio services/ evitando conflicto con services.py
        services_dir = os.path.join(os.path.dirname(__file__), 'services')
        exchange_rate_path = os.path.join(services_dir, 'exchange_rate_service.py')
        spec = importlib.util.spec_from_file_location("exchange_rate_service", exchange_rate_path)
        exchange_rate_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(exchange_rate_module)
        ExchangeRateService = exchange_rate_module.ExchangeRateService
        
        base_currency = request.query_params.get('base', 'USD')
        rates = ExchangeRateService.get_exchange_rates(base_currency)
        
        if "error" in rates:
            return Response(rates, status=status.HTTP_503_SERVICE_UNAVAILABLE)
            
        return Response(rates)

    @action(detail=False, methods=['post'])
    def convert(self, request):
        """
        Convierte un precio de una moneda a otra.
        Body params:
        - amount: Cantidad a convertir (float)
        - from_currency: Moneda origen (string, ej: 'COP')
        - to_currency: Moneda destino (string, ej: 'USD', 'EUR')
        """
        import importlib.util
        import os
        # Importar desde el directorio services/ evitando conflicto con services.py
        services_dir = os.path.join(os.path.dirname(__file__), 'services')
        exchange_rate_path = os.path.join(services_dir, 'exchange_rate_service.py')
        spec = importlib.util.spec_from_file_location("exchange_rate_service", exchange_rate_path)
        exchange_rate_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(exchange_rate_module)
        ExchangeRateService = exchange_rate_module.ExchangeRateService
        
        amount = request.data.get('amount')
        from_currency = request.data.get('from_currency', 'COP')
        to_currency = request.data.get('to_currency', 'USD')
        
        if amount is None:
            return Response(
                {"error": "Missing required parameter", "details": "amount is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return Response(
                {"error": "Invalid amount", "details": "amount must be a valid number"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        result = ExchangeRateService.convert_price(amount, from_currency, to_currency)
        
        if "error" in result:
            return Response(result, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(result)
