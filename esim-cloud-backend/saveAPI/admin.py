from django.contrib import admin
from saveAPI.models import StateSave


@admin.register(StateSave)
class UserCircuits(admin.ModelAdmin):
    list_display = ('name', 'is_arduino', 'base64_image',
                    'save_time', 'create_time', "version")
