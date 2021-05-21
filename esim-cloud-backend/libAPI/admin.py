from django.contrib import admin
from libAPI.models import LibraryComponent, Library, FavouriteComponent


@admin.register(LibraryComponent)
class LibraryComponentAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'image_tag', 'svg_path', 'keyword',
                    'description')
    list_filter = ('symbol_prefix', 'component_library__library_name')
    search_fields = ('keyword', 'name')


class ComponentInline(admin.TabularInline):
    model = LibraryComponent
    extra = 1


@admin.register(Library)
class LibraryAdmin(admin.ModelAdmin):
    inlines = (ComponentInline, )


@admin.register(FavouriteComponent)
class FavouriteComponentAdmin(admin.ModelAdmin):
    list_display = ('owner', 'last_change')
    search_fields = ('owner', 'component')
