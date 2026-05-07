from django.db.models import Q
from ..models import Vehicle, Make, Category

class VehicleSearch:
    def __init__(self, filters=None):
        # El constructor recibe un diccionario de filtros, como request.GET
        self.filters = filters if filters is not None else {}
        self.queryset = Vehicle.objects.select_related('make', 'category').all()

    def execute(self):
        # Verificar si hay algún filtro activo
        has_filters = any([
            self.filters.get('search'),
            self.filters.get('price_min'),
            self.filters.get('price_max'),
            self.filters.get('year_from'),
            self.filters.get('year_to'),
            self.filters.getlist('brands'),
            self.filters.get('color'),
            self.filters.get('category_id'),
        ])
        
        if not has_filters:
            print("No hay filtros activos, devolviendo todos los vehículos")
            return self.queryset.order_by('-year', 'make__name')
        
        # Aplicar filtros solo si hay alguno activo
        self._filter_by_search()
        self._filter_by_brands()
        self._filter_by_make()
        self._filter_by_category()
        self._filter_by_year()
        self._filter_by_price()
        self._filter_by_color()
        self._order_results()
        
        return self.queryset

    def _filter_by_search(self):
        """Búsqueda inteligente por texto en modelo, marca y categoría"""
        search = self.filters.get('search', '').strip()
        if search:
            # Búsqueda más inteligente que incluye marca, modelo y categoría
            self.queryset = self.queryset.filter(
                Q(model__icontains=search) |
                Q(make__name__icontains=search) |
                Q(category__name__icontains=search) |
                Q(color__icontains=search)
            )
    
    def _filter_by_brands(self):
        """Filtro por nombres de marcas"""
        brands = self.filters.getlist('brands')
        print(f"Filtro por marcas - brands recibido: {brands}, tipo: {type(brands)}")
        print(f"Todas las marcas disponibles: {list(self.queryset.values_list('make__name', flat=True).distinct())}")
        
        if brands and len(brands) > 0:
            print(f"Filtrando por marcas: {brands}")
            # Verificar coincidencias exactas (case-insensitive)
            self.queryset = self.queryset.filter(make__name__in=brands)
            print(f"QuerySet después del filtro de marcas: {self.queryset.count()}")
            
            # Si no hay resultados, probar con coincidencia parcial
            if self.queryset.count() == 0:
                print("No hay coincidencias exactas, probando coincidencia parcial...")
                # Resetear queryset
                self.queryset = Vehicle.objects.select_related('make', 'category').all()
                # Aplicar filtros anteriores (esto es una simplificación)
                from django.db.models import Q
                brand_filter = Q()
                for brand in brands:
                    brand_filter |= Q(make__name__icontains=brand)
                self.queryset = self.queryset.filter(brand_filter)
                print(f"QuerySet después del filtro parcial: {self.queryset.count()}")

    def _filter_by_make(self):
        """Filtro por marca específica"""
        make_id = self.filters.get('make_id')
        if make_id:
            self.queryset = self.queryset.filter(make_id=make_id)

    def _filter_by_category(self):
        """Filtro por categoría específica"""
        category_id = self.filters.get('category_id')
        if category_id:
            self.queryset = self.queryset.filter(category_id=category_id)

    def _filter_by_year(self):
        """Filtro por rango de años"""
        year_from = self.filters.get('year_from')
        year_to = self.filters.get('year_to')
        
        if year_from:
            self.queryset = self.queryset.filter(year__gte=year_from)
        
        if year_to:
            self.queryset = self.queryset.filter(year__lte=year_to)

    def _filter_by_price(self):
        """Filtro por rango de precios"""
        price_min = self.filters.get('price_min')
        price_max = self.filters.get('price_max')
        
        print(f"Filtro por precio - price_min: {price_min}, price_max: {price_max}")
        print(f"Tipos - price_min: {type(price_min)}, price_max: {type(price_max)}")
        
        if price_min:
            print(f"Aplicando filtro price__gte={price_min}")
            self.queryset = self.queryset.filter(price__gte=price_min)
            print(f"QuerySet después de price_min: {self.queryset.count()}")
            
        if price_max:
            print(f"Aplicando filtro price__lte={price_max}")
            self.queryset = self.queryset.filter(price__lte=price_max)
            print(f"QuerySet después de price_max: {self.queryset.count()}")

    def _filter_by_color(self):
        """Filtro por color"""
        color = self.filters.get('color', '').strip()
        print(f"Filtro por color - color recibido: '{color}'")
        if color:
            print(f"Filtrando por color: {color}")
            self.queryset = self.queryset.filter(color__icontains=color)
            print(f"QuerySet después del filtro de color: {self.queryset.count()}")
            # Mostrar algunos colores disponibles para debug
            available_colors = list(self.queryset.values_list('color', flat=True).distinct())
            print(f"Colores disponibles: {available_colors}")

    def _order_results(self):
        """Ordenar resultados por relevancia y año"""
        search = self.filters.get('search', '').strip()
        if search:
            # Si hay búsqueda, ordenar por relevancia (coincidencias exactas primero)
            self.queryset = self.queryset.extra(
                select={
                    'relevance': """
                        CASE 
                            WHEN LOWER(model) = LOWER(%s) THEN 1
                            WHEN LOWER(make_id) = LOWER(%s) THEN 2
                            WHEN LOWER(model) LIKE LOWER(%s) THEN 3
                            WHEN LOWER(make_id) LIKE LOWER(%s) THEN 4
                            ELSE 5
                        END
                    """
                },
                select_params=[search, search, f'%{search}%', f'%{search}%'],
                order_by=['relevance', '-year', 'make__name']
            )
        else:
            # Sin búsqueda, ordenar por año descendente y marca
            self.queryset = self.queryset.order_by('-year', 'make__name')
