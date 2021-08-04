# from django.apps import AppConfig
# from django.db.models.signals import post_migrate, m2m_changed
# from django.contrib.auth import get_user_model


# class PublishapiConfig(AppConfig):
#     name = 'publishAPI'

#     def ready(self):
#         from .signals import populate_models, add_staff_status
#         post_migrate.connect(populate_models, sender=self)
#         m2m_changed.connect(
#             add_staff_status, sender=get_user_model().groups.through)
