from django.contrib import admin
from publishAPI.models import Circuit, CircuitTag, Publish


@admin.register(CircuitTag)
class CircuitTagAdmin(admin.ModelAdmin):
    list_display = ('tag', 'description')
    search_fields = ('tag', 'description')


@admin.register(Circuit)
class CircuitAdmin(admin.ModelAdmin):
    pass


@admin.register(Publish)
class PublishAdmin(admin.ModelAdmin):
    list_display = ('circuit_title', 'image_tag', 'published', 'reviewed_by')
