import os
from libAPI.models import Library, LibraryComponent, ComponentAlternate
from django.core.management.base import BaseCommand
from libAPI.helper.main import generate_svg_and_save_to_folder
import logging
import glob
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "seed database for testing and development."

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true',
                            help="True to clear all libraries from DB")
        parser.add_argument('--location', type=self.dir_path,
                            help="Directory containing kicad library files")

    def dir_path(self, path):
        if os.path.isdir(path):
            return path
        else:
            raise Exception(f"{path} is not a valid path")

    def handle(self, *args, **options):
        self.stdout.write('seeding data...')
        if options['clear']:
            self.stdout.write('Deleting Objects')
            clear_data()
        if not options['location'] and not options['clear']:
            raise Exception('Argument location must be provided')
        elif not options['clear'] and options['location']:
            seed_libraries(self, options['location'])
        self.stdout.write('done.')


def clear_data():
    """Deletes all the table data"""
    Library.objects.all().delete()
    LibraryComponent.objects.all().delete()
    logger.info("Deleted All libraries and components")


def seed_libraries(self, location):
    logger.info(f"Reading libraries from {location}")
    for file in os.listdir(location):
        if '.lib' in file:
            self.stdout.write(f'Processing {file}')
            lib_location = os.path.join(location, file)
            lib_output_location = os.path.join(location, 'symbol_svgs')
            component_details = generate_svg_and_save_to_folder(
                lib_location,
                lib_output_location
            )
            library = Library(
                library_name=file[:-4],
            )
            library.save()
            logger.info('Created Library Object')
            library_svg_folder = os.path.join(lib_output_location, file[:-4])
            thumbnails = glob.glob(library_svg_folder+'/*_thumbnail.svg')

            # Seed Primary component
            for component_svg in glob.glob(library_svg_folder+'/*-1-A.svg'):
                thumbnail_path = component_svg[:-4]+'_thumbnail.svg'
                if thumbnail_path not in thumbnails:
                    raise FileNotFoundError(f'Thumbnail Does not exist for {component_svg}')  # noqa

                # Get Component name
                component_svg = os.path.split(component_svg)[-1]

                # Get Corresponding Details
                svg_desc = component_details[component_svg[:-4]]

                # Seed DB
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
                logger.info(f'Saved component {component_svg}')

            # Seed Alternate Components
            for component_svg in glob.glob(library_svg_folder+'/*[B-Z].svg'):  # noqa , EdgeCase here
                component_svg = os.path.split(component_svg)[-1]
                svg_desc = component_details[component_svg[:-4]]
                alternate_component = ComponentAlternate(
                    part=svg_desc['part'],
                    dmg=svg_desc['dmg'],
                    full_name=svg_desc['full_name'],
                    svg_path=os.path.join(
                        library_svg_folder, component_svg),
                    parent_component=LibraryComponent.objects.get(
                        name=svg_desc['name'],
                    )
                )
                alternate_component.save()
                logger.info(f'Saved alternate component {component_svg}')
