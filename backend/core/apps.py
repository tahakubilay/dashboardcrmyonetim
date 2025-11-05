from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'core'
    verbose_name = 'Kurumsal Yönetim'

    def ready(self):
        """Import signals when app is ready"""
        import core.signals