
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from django.contrib.auth.models import Group

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def save_profile(sender, instance, created, **kwargs):
    if created:
        g1 = Group.objects.get(name='Contributor [E-Sim]')
        g2 = Group.objects.get(name='Contributor [Arduino]')
        instance.groups.add(g1)
        instance.groups.add(g2)