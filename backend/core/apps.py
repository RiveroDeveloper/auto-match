from django.apps import AppConfig
from django.db.models.signals import post_migrate

def create_permissions(sender, **kwargs):
    """
    Signal handler to create default permissions after migrations.
    This is useful for ensuring that the permissions are created
    when the app is first installed or when migrations are applied.
    """
    from django.contrib.auth.models import Permission
    from django.contrib.contenttypes.models import ContentType
    from .models import User, Role

class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
