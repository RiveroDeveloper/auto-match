from django.core.management.base import BaseCommand
from core.models import Vehicle, Dealer, User

class Command(BaseCommand):
    help = 'Arregla vehículos existentes asignando un dealer por defecto'

    def handle(self, *args, **options):
        # Crear dealer por defecto si no existe
        dealer, created = Dealer.objects.get_or_create(
            defaults={
                'name': 'Dealer por Defecto',
                'phone_number': '123456789',
                'address': 'Dirección por defecto',
                'is_verified': True
            }
        )
        
        if created:
            # Crear usuario para el dealer si no existe
            user, user_created = User.objects.get_or_create(
                username='dealer_default',
                defaults={
                    'email': 'dealer@default.com',
                    'is_staff': False
                }
            )
            if user_created:
                user.set_password('dealer123')
                user.save()
            
            dealer.user = user
            dealer.save()
            
            self.stdout.write(
                self.style.SUCCESS('Dealer por defecto creado')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('Dealer por defecto ya existe')
            )

        # Actualizar vehículos sin seller
        vehicles_without_seller = Vehicle.objects.filter(seller__isnull=True)
        count = vehicles_without_seller.count()
        
        if count > 0:
            vehicles_without_seller.update(seller=dealer)
            self.stdout.write(
                self.style.SUCCESS(f'Actualizados {count} vehículos con dealer por defecto')
            )
        else:
            self.stdout.write(
                self.style.SUCCESS('Todos los vehículos ya tienen dealer asignado')
            )
