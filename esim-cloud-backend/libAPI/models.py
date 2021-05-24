from djongo import models
from django.utils.safestring import mark_safe
from django.contrib.auth import get_user_model
from libAPI.helper.main import generate_svg_and_save_to_folder
import os
import glob


class LibrarySet(models.Model):
    user = models.ForeignKey(to=get_user_model(), verbose_name="user",
                             on_delete=models.CASCADE)
    default = models.BooleanField(default=False)
    name = models.CharField(max_length=24, default="default")

    class Meta:
        unique_together = ('user', 'name')


class Library(models.Model):
    library_set = models.ForeignKey(
        LibrarySet, null=True,
        verbose_name="library_set",
        on_delete=models.CASCADE
    )
    library_name = models.CharField(max_length=200)
    saved_on = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.library_name


class LibraryComponent(models.Model):
    name = models.CharField(max_length=200)
    svg_path = models.CharField(max_length=400)
    thumbnail_path = models.CharField(max_length=400)
    description = models.CharField(max_length=400)
    data_link = models.URLField(max_length=200)
    full_name = models.CharField(max_length=200)
    keyword = models.CharField(max_length=200)
    symbol_prefix = models.CharField(max_length=10)
    component_library = models.ForeignKey(
        Library, on_delete=models.CASCADE, null=False, related_name='library')

    # For Django Admin Panel
    def image_tag(self):
        if self.svg_path:
            return mark_safe('<img src="/%s" style="width: 45px; height:45px;" />' % self.svg_path)  # noqa
        else:
            return 'No Image Found'
    image_tag.short_description = 'Image'

    def __str__(self):
        return self.name


class ComponentAlternate(models.Model):
    part = models.CharField(max_length=1)
    dmg = models.PositiveSmallIntegerField()
    full_name = models.CharField(max_length=200)
    svg_path = models.CharField(max_length=400)
    parent_component = models.ForeignKey(
        LibraryComponent,
        on_delete=models.CASCADE,
        null=False,
        related_name='alternate_component')

    # For Django Admin Panel
    def image_tag(self):
        if self.svg_path:
            return mark_safe('<img src="/%s" style="width: 45px; height:45px;" />' % self.svg_path)  # noqa
        else:
            return 'No Image Found'

    image_tag.short_description = 'Image'

    def __str__(self):
        return self.full_name


class FavouriteComponent(models.Model):
    owner = models.OneToOneField(to=get_user_model(),
                                 on_delete=models.CASCADE, null=False)
    component = models.ManyToManyField(to=LibraryComponent)
    last_change = models.DateTimeField(auto_now=True)


def handle_uploaded_file(f, filepath):
    with open(filepath, 'wb') as dest:
        for chunk in f.chunks():
            dest.write(chunk)


def delete_uploaded_files(files, path):
    for f in files:
        os.remove(path + '/' + f._name)


def save_libs(library_set, path, files):
    if not os.path.isdir(path):
        os.mkdir(path, mode=0o777)
    for f in files:
        handle_uploaded_file(f, path + '/' + f._name)
    for f in files:
        if '.dcm' in f._name:
            flag = 0
            for f1 in files:
                if f1._name[:-4] == f._name[:-4] and '.lib' in f1._name:
                    flag = 1
            if flag == 0:
                raise FileNotFoundError(
                    f'.lib file for {f._name} does not exist')
        if '.lib' in f._name:
            lib_output_location = os.path.join(path, 'symbol-svgs')
            lib_location = os.path.join(path, f._name)
            component_details = generate_svg_and_save_to_folder(
                lib_location,
                lib_output_location
            )
            try:
                library = Library.objects.get(
                    library_name=f._name, library_set=library_set)
            except Library.DoesNotExist:
                library = Library(
                    library_name=f._name,
                    library_set=library_set
                )
                library.save()

            library_svg_folder = os.path.join(
                lib_output_location, f._name[:-4])
            thumbnails = glob.glob(library_svg_folder + '/*_thumbnail.svg')

            for component_svg in glob.glob(library_svg_folder + '/*-1-A.svg'):
                thumbnail_path = component_svg[:-4] + '_thumbnail.svg'
                if thumbnail_path not in thumbnails:
                    raise FileNotFoundError(
                        f'Thumbnail does not exist for {component_svg}')

                # Get Component name
                component_svg = os.path.split(component_svg)[-1]

                # Get Corresponding Details
                svg_desc = component_details[component_svg[:-4]]

                # Seed DB
                try:
                    component = LibraryComponent.objects.get(
                        name=svg_desc['name'],
                        svg_path=os.path.join(
                            library_svg_folder, component_svg)[6:],
                        thumbnail_path=thumbnail_path,
                        symbol_prefix=svg_desc['symbol_prefix'],
                        full_name=svg_desc['full_name'],
                        keyword=svg_desc['keyword'],
                        description=svg_desc['description'],
                        data_link=svg_desc['data_link'],
                        component_library=library
                    )
                except LibraryComponent.DoesNotExist:
                    component = LibraryComponent(
                        name=svg_desc['name'],
                        svg_path=os.path.join(
                            library_svg_folder, component_svg)[6:],
                        thumbnail_path=thumbnail_path,
                        symbol_prefix=svg_desc['symbol_prefix'],
                        full_name=svg_desc['full_name'],
                        keyword=svg_desc['keyword'],
                        description=svg_desc['description'],
                        data_link=svg_desc['data_link'],
                        component_library=library
                    )
                    component.save()

            # Seed Alternate Components
            for component_svg in glob.glob(library_svg_folder + '/*[B-Z].svg'):
                component_svg = os.path.split(component_svg)[-1]
                svg_desc = component_details[component_svg[:-4]]
                try:
                    alternate_component = ComponentAlternate.objects.get(
                        part=svg_desc['part'], dmg=svg_desc['dmg'],
                        full_name=svg_desc['full_name'],
                        svg_path=os.path.join(
                            library_svg_folder, component_svg)[6:],
                        parent_component=LibraryComponent.objects.get(
                            name=svg_desc['name'],
                            component_library=library
                        )
                    )
                except ComponentAlternate.DoesNotExist:
                    alternate_component = ComponentAlternate(
                        part=svg_desc['part'], dmg=svg_desc['dmg'],
                        full_name=svg_desc['full_name'],
                        svg_path=os.path.join(
                            library_svg_folder, component_svg)[6:],
                        parent_component=LibraryComponent.objects.get(
                            name=svg_desc['name'],
                            component_library=library
                        )
                    )
                    alternate_component.save()
