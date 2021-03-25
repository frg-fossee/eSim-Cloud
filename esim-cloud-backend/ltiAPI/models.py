from django.db import models
from saveAPI.models import StateSave


# Create your models here.
class lticonsumer(models.Model):
    consumer_key = models.CharField(max_length=50, null=False, unique=True)
    secret_key = models.CharField(max_length=50, null=False)
    save_id = models.CharField(max_length=100, null=False)