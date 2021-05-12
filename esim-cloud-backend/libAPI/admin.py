from django import forms
from django.contrib import admin
from libAPI.models import LibraryComponent, Library, LibrarySet, save_libs
from .forms import LibrarySetForm
from esimCloud import settings
import os


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


class LibraryInline(admin.TabularInline):
    model = Library


class LibrarySetAdmin(admin.ModelAdmin):
    model = LibrarySet
    list_display = ('name', 'user', 'default')
    inlines = (LibraryInline, )

    def get_form(self, request, obj=None, **kwargs):
        return LibrarySetForm

    def save_model(self, request, obj, form, change):
        # For new library set instance
        if obj.pk is None:
            obj = LibrarySet(
                user=request.user,
                default=True if request.POST.get('default') else False,
                name=request.POST.get('name', '')
            )
            obj.save()

        # If the library set is being changed
        else:
            obj.save()

        files = request.FILES.getlist('files')
        if len(files) != 0:
            path = os.path.join(
                settings.BASE_DIR,
                'kicad-symbols',
                request.user.username + '-' + request.POST.get('name', ''))
            
            save_libs(obj, path, files) # defined in ./models.py


admin.site.register(LibrarySet, LibrarySetAdmin)
