from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import Buyer

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a test user for development'

    def handle(self, *args, **options):
        # Crear usuario de prueba
        test_user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'is_active': True
            }
        )
        
        if created:
            test_user.set_password('testpass123')
            test_user.save()
            self.stdout.write(
                self.style.SUCCESS('Created test user: testuser/testpass123')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Test user already exists')
            )

        # Crear Buyer para el usuario de prueba
        buyer, created = Buyer.objects.get_or_create(
            user=test_user,
            defaults={'usageProfile': 'General', 'preferences': []}
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('Created test buyer')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Test buyer already exists')
            )
