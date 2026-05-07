from django.contrib import admin
from .models import (
    Role, User, Dealer, Expert, Buyer, 
    Make, Category, Vehicle, VehicleSpecification, 
    Review, Cart, CartItem
)


# Register your models here.
admin.site.register(Role)
admin.site.register(Dealer)
admin.site.register(Expert)
admin.site.register(Buyer)
admin.site.register(Make)
admin.site.register(Category)
admin.site.register(Vehicle)
admin.site.register(VehicleSpecification)
admin.site.register(Review)
admin.site.register(Cart)
admin.site.register(CartItem)