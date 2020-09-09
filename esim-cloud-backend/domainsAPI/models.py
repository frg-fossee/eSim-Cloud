from django.db import models

class Domains(models.Model):
    name = models.CharField(max_length=200)
    logo_path = models.CharField(max_length=400)
    title = models.CharField(max_length=200)
    message = models.CharField(max_length=200)

    def __str__(self):
        return self.name
