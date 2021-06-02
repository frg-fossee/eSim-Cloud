from django.contrib import admin
from .models import lticonsumer


# Register your models here.
class lticonsumeradmin(admin.ModelAdmin):
    list_display = ['consumer_key', 'secret_key', 'save_id', 'score']


admin.site.register(lticonsumer, lticonsumeradmin)
