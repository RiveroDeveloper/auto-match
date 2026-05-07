from rest_framework import serializers
from .models import Make, Category, Vehicle, User, Role, Buyer, Expert, Review, Cart, CartItem
from django.contrib.auth import get_user_model

# Serializamos todos los datos para convertirlos en json para pasarlos por la Api
class MakeSerializer(serializers.ModelSerializer):
        class Meta:
                model = Make
                fields = '__all__'
                
class CategorySerializer(serializers.ModelSerializer):
        class Meta:
                model = Category
                fields = '__all__'

class SimpleVehicleSerializer(serializers.ModelSerializer):
    make_name = serializers.CharField(source='make.name', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicle
        fields = ['id', 'model', 'year', 'color', 'price', 'image', 'image_url', 'make', 'make_name', 'category', 'category_name']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            try:
                url = obj.image.url
            except Exception:
                return None
            return request.build_absolute_uri(url) if request else url
        return None
                
class VehicleSerializer(serializers.ModelSerializer):
        make_name = serializers.CharField(source='make.name', read_only=True)
        category_name = serializers.CharField(source="category.name", read_only=True)
        price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
        image_url = serializers.SerializerMethodField()
        
        class Meta:
                model = Vehicle
                fields = ['id', 'model', 'year', 'color', 'price', 'image', 'image_url', 'make', 'make_name', 'category', 'category_name']
        
        def get_image_url(self, obj):
            if obj.image:
                request = self.context.get('request')
                try:
                    url = obj.image.url
                except Exception:
                    return None
                if request:
                    # Usar el host del request, pero asegurar que use el protocolo correcto
                    return request.build_absolute_uri(url)
                # Fallback: construir URL manualmente si no hay request
                from django.conf import settings
                base_url = getattr(settings, 'BASE_URL', 'http://localhost:8000')
                return f"{base_url}{url}"
            return None

class AvailableVehicleSerializer(serializers.ModelSerializer):
    make_name = serializers.CharField(source='make.name', read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)
    image_url = serializers.SerializerMethodField()
    vehicle_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicle
        fields = ['id', 'model', 'year', 'color', 'price', 'image_url', 'make_name', 'category_name', 'vehicle_url']
    
    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            try:
                url = obj.image.url
            except Exception:
                return None
            return request.build_absolute_uri(url) if request else url
        return None

    def get_vehicle_url(self, obj):
        # Retorna la URL del frontend para visualizar el vehículo
        # Asumimos que el frontend corre en el puerto 3000 por defecto
        return f"http://localhost:3000/vehicles/{obj.id}"

class RoleSerializer(serializers.ModelSerializer):
        class Meta:
                model = Role
                fields = '__all__'


User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'email', 'date_of_birth']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data.get('email'),
            date_of_birth=validated_data.get('date_of_birth')
        )
        user.set_password(validated_data['password'])
        user.save()

        # Asignar rol por defecto "Buyer"
        try:
            role = Role.objects.get(name="Buyer")
            user.roles.add(role)
        except Role.DoesNotExist:
            pass  # Si no existe el rol, no asigna nada
        
        return user

class BuyerSerializer(serializers.ModelSerializer):
        user = UserSerializer(read_only=True)
        class Meta:
                model = Buyer
                fields = ['user', 'usageProfile', 'preferences']

class ExpertSerializer(serializers.ModelSerializer):
        user = UserSerializer(read_only=True)
        class Meta:
                model = Expert
                fields = ['user', 'specialty']

class ReviewSerializer(serializers.ModelSerializer):
        vehicle_name = serializers.CharField(source='vehicle.__str__', read_only=True)
        author_name = serializers.CharField(source='author.user.username', read_only=True)
        author_specialty = serializers.CharField(source='author.specialty', read_only=True)
        def validate_rating(self, value):
            if value < 1 or value > 5:
                raise serializers.ValidationError("La calificación debe estar entre 1 y 5.")
            return value

        class Meta:
            model = Review
            fields = ['id', 'vehicle', 'vehicle_name', 'author', 'author_name', 'author_specialty', 'title', 'content', 'rating', 'created_at']

class CartItemSerializer(serializers.ModelSerializer):
    vehicle = SimpleVehicleSerializer(read_only=True)
    class Meta:
        model = CartItem
        fields = ['id', 'vehicle', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'buyer', 'created_at', 'items', 'total_price']

    def get_total_price(self, cart_obj):
        items_with_vehicles = cart_obj.items.select_related('vehicle')
        total = sum(float(item.vehicle.price) * item.quantity for item in items_with_vehicles)
        return total