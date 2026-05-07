from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator

class Role(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    # Ya no usamos un CharField. Ahora un usuario puede tener MUCHOS roles.
    roles = models.ManyToManyField(Role, related_name="users")
    date_of_birth = models.DateField(null=True, blank=True)

class Dealer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    name = models.CharField(max_length=200) # Nombre del concesionario o vendedor
    phone_number = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    is_verified = models.BooleanField(default=False) # Para administradores que verifiquen concesionarios

    def __str__(self):
        return self.name

class Expert(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    specialty = models.CharField(max_length=100)

    def __str__(self):
        return self.user.username

class Buyer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True)
    usageProfile = models.CharField(max_length=255)
    preferences = models.JSONField(default=list)

    def __str__(self):
        return self.user.username

class Make(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Category"
        verbose_name_plural = "Categories"

class Vehicle(models.Model):
    model = models.CharField(max_length=100)
    year = models.PositiveIntegerField()
    color = models.CharField(max_length=50)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)

    seller = models.ForeignKey(Dealer, on_delete=models.CASCADE, related_name='vehicles_for_sale', null=True, blank=True)

    make = models.ForeignKey(Make, on_delete=models.PROTECT, related_name='vehicles')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='vehicles')

    image = models.ImageField(upload_to='vehicles/', null=True, blank=True)

    def __str__(self):
        return f"{self.make} {self.model} ({self.year})"

    class Meta:
        # Opcional: define un orden por defecto para los vehículos
        ordering = ['-year', 'make']

class VehicleSpecification(models.Model):
    # La clave: conectamos cada hoja de especificaciones a un único vehículo.
    # Si se borra el vehículo, se borran sus especificaciones.
    vehicle = models.OneToOneField(
        Vehicle, 
        on_delete=models.CASCADE, 
        primary_key=True,
        related_name='specifications'
    )

    # --- Motor y Rendimiento ---
    engine_type = models.CharField(max_length=100, blank=True, help_text="Ej: V6, Eléctrico, Híbrido")
    transmission = models.CharField(max_length=100, blank=True, help_text="Ej: Automática, Manual")
    power_hp = models.PositiveIntegerField(blank=True, null=True, help_text="Potencia en caballos de fuerza (HP)")
    torque_nm = models.PositiveIntegerField(blank=True, null=True, help_text="Torque en Newton-metro (Nm)")
    
    # --- Dimensiones y Peso ---
    length_mm = models.PositiveIntegerField(blank=True, null=True, help_text="Longitud en milímetros")
    width_mm = models.PositiveIntegerField(blank=True, null=True, help_text="Ancho en milímetros")
    height_mm = models.PositiveIntegerField(blank=True, null=True, help_text="Altura en milímetros")
    curb_weight_kg = models.PositiveIntegerField(blank=True, null=True, help_text="Peso en kilogramos")
    
    # --- Consumo y Emisiones ---
    fuel_consumption_city = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, help_text="Consumo en ciudad (L/100km)")
    fuel_consumption_highway = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True, help_text="Consumo en carretera (L/100km)")

    def __str__(self):
        return f"Specifications for {self.vehicle}"

class Review(models.Model):
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='reviews')
    
    # La clave está aquí: ForeignKey a Expert, no a User.
    author = models.ForeignKey(Expert, on_delete=models.CASCADE, related_name='reviews')
    
    title = models.CharField(max_length=200)
    content = models.TextField()
    rating = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Review for {self.vehicle} by {self.author}'
    
class Cart(models.Model):
    # Cada comprador tiene un único carrito de compras.
    # Usamos Buyer porque es el perfil específico que realiza compras.
    buyer = models.OneToOneField(Buyer, on_delete=models.CASCADE, related_name='cart')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart for {self.buyer.user.username}"
    
class CartItem(models.Model):
    # El carrito al que pertenece este artículo.
    cart = models.ForeignKey(Cart, on_delete=models.CASCADE, related_name='items')
    
    # El vehículo que se está agregando.
    vehicle = models.ForeignKey(Vehicle, on_delete=models.CASCADE, related_name='cart_items')
    
    # Aunque para carros la cantidad casi siempre será 1, es una buena práctica incluirla.
    quantity = models.PositiveIntegerField(default=1)

    def __str__(self):
        return f"{self.quantity} of {self.vehicle} in {self.cart}"

    class Meta:
        # Regla clave: No se puede tener el mismo vehículo dos veces en el mismo carrito.
        # Si el usuario lo agrega de nuevo, deberíamos actualizar la cantidad (aunque aquí no aplique mucho).
        unique_together = ('cart', 'vehicle')