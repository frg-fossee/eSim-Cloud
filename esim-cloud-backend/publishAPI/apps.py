from django.apps import AppConfig
from django.db.models.signals import post_migrate


class PublishapiConfig(AppConfig):
    name = 'publishAPI'

    def ready(self):
        from .signals import populate_models
        post_migrate.connect(populate_models, sender=self)
