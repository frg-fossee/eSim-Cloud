from django import forms
from django.contrib import admin
from libAPI.models import ComponentAlternate, LibraryComponent, Library, LibrarySet, save_libs
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
        if obj is None:
            return LibrarySetForm
        else:
            return super(LibrarySetAdmin, self).get_form(request, obj, **kwargs)

    def save_model(self, request, obj, form, change):
        # For new library set instance
        if obj.pk is None:
            library_set = LibrarySet(
                user=request.user,
                default=True if request.POST.get('default') else False,
                name=request.POST.get('name', '')
            )
            library_set.save()
            path = os.path.join(
                settings.BASE_DIR,
                'kicad-symbols',
                request.user.username + '-' + request.POST.get('name', ''))
            files = request.FILES.getlist('files')
            save_libs(library_set, path, files)

        # If the library set is being changed
        else:
            if obj.default == True:
                lib_sets = LibrarySet.objects.filter(default=True)
                if len(lib_sets) != 0:
                    raise forms.ValidationError("Another Library Set is set as default change it to save it as the default set.")
            obj.save()

admin.site.register(LibrarySet, LibrarySetAdmin)
