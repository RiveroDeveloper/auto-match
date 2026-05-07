from django.core.management.base import BaseCommand
from core.models import Vehicle


class Command(BaseCommand):
    help = "Clear all vehicles from database"

    def handle(self, *args, **options):
        count = Vehicle.objects.count()
        Vehicle.objects.all().delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {count} vehicles'))

