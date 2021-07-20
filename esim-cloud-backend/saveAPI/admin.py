from django.contrib import admin
from saveAPI.models import Gallery, StateSave
from django.forms import TextInput, Textarea
from django.db import models


@admin.register(StateSave)
class UserCircuits(admin.ModelAdmin):
    list_display = ('name', 'is_arduino', 'base64_image',
                    'save_time', 'create_time', "version")
    list_filter = ('version', 'save_id',)


@admin.register(Gallery)
class GalleryCircuits(admin.ModelAdmin):
    list_display = ('name', 'image_tag', 'description', 'shared', 'is_arduino')
    list_filter = ('save_time', 'is_arduino')
    search_fields = ('name', 'description')
    formfield_overrides = {
        models.CharField: {'widget': TextInput(attrs={'size': '50'})},
        models.TextField: {'widget': Textarea(attrs={'rows': 20, 'cols': 50})},
    }
