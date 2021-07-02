from libAPI.helper.main import generate_svg_and_save_to_folder
from libAPI.models import Library, LibraryComponent, ComponentAlternate
import os
import glob


def save_uploaded_files(files, path):
    for f in files:
        filepath = os.path.join(path, f._name)
        with open(filepath, 'wb') as dest:
            for chunk in f.chunks():
                dest.write(chunk)


def handle_uploaded_libs(library_set, path, files):
    if not os.path.isdir(path):
        os.mkdir(path)
    save_uploaded_files(files, path)
    filenames = []
    for f in files:
        filenames.append(f._name)
    save_libs(filenames, path, path, library_set)
    for f in files:
        os.remove(path + '/' + f._name)


def save_libs(files, path, out_path, library_set):
    for f in files:
        if '.dcm' in f:
            flag = 0
            for f1 in files:
                if f1[:-4] == f[:-4] and '.lib' in f1:
                    flag = 1
            if flag == 0:
                raise FileNotFoundError(
                    f'.lib file for {f} does not exist')
        if '.lib' in f:
            lib_output_location = os.path.join(out_path, 'symbol-svgs')
            lib_location = os.path.join(path, f)
            component_details = generate_svg_and_save_to_folder(
                lib_location,
                lib_output_location
            )
            library = Library.objects.filter(
                library_name=f, library_set=library_set).first()
            if not library:
                library = Library(
                    library_name=f,
                    library_set=library_set
                )
            library.save()

            library_svg_folder = os.path.join(
                lib_output_location, f[:-4])
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
                component = LibraryComponent.objects.filter(
                    name=svg_desc['name'],
                    svg_path=os.path.join(
                        library_svg_folder, component_svg),
                    thumbnail_path=thumbnail_path,
                    symbol_prefix=svg_desc['symbol_prefix'],
                    full_name=svg_desc['full_name'],
                    keyword=svg_desc['keyword'],
                    description=svg_desc['description'],
                    data_link=svg_desc['data_link'],
                    component_library=library
                ).first()
                if not component:
                    component = LibraryComponent(
                        name=svg_desc['name'],
                        svg_path=os.path.join(
                            library_svg_folder, component_svg),
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
                alternate_component = ComponentAlternate.objects.filter(
                    part=svg_desc['part'], dmg=svg_desc['dmg'],
                    full_name=svg_desc['full_name'],
                    svg_path=os.path.join(
                        library_svg_folder, component_svg),
                    parent_component=component
                ).first()
                if not alternate_component:
                    alternate_component = ComponentAlternate(
                        part=svg_desc['part'], dmg=svg_desc['dmg'],
                        full_name=svg_desc['full_name'],
                        svg_path=os.path.join(
                            library_svg_folder, component_svg),
                        parent_component=component
                    )
                alternate_component.save()
