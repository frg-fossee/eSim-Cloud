from django.contrib import admin
from .models import Categories, Blocks


@admin.register(Blocks)
class BlocksAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'image_tag', 'svg_path', 'keyword',
                    'description')
    list_filter = ('symbol_prefix', 'component_library__library_name')
    search_fields = ('keyword', 'name')


class ComponentInline(admin.TabularInline):
    model = Blocks
    extra = 1


@admin.register(Categories)
class CategoriesAdmin(admin.ModelAdmin):
    inlines = (ComponentInline, )
