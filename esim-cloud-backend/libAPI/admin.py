from django.contrib import admin
from libAPI.models import LibraryComponent, Library


@admin.register(LibraryComponent)
class LibraryComponentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'image_tag', 'svg_path', 'keyword',
                    'description')
    list_filter = ('symbol_prefix', 'component_library__library_name')
    search_fields = ('keyword', 'full_name')


class ComponentInline(admin.TabularInline):
    model = LibraryComponent
    extra = 1


@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    inlines = (ComponentInline, )
