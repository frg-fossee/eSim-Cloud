import os
from django.core.management.base import BaseCommand
import logging
logger = logging.getLogger(__name__)
import xml.etree.ElementTree as ET
from xCosAPI.models import Categories, Blocks


class Command(BaseCommand):
    help = "seed xCos symbols"

    def add_arguments(self, parser):
        parser.add_argument('--clear', action='store_true',
                            help="Clear all xCos symbols from DB")
        parser.add_argument('--location', type=self.dir_path,
                            help="Directory containing xCos symbols")

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
    """Deletes xCos categories and blocks"""
    Categories.objects.all().delete()
    Blocks.objects.all().delete()
    logger.info("Deleted all categories and blocks of xCos")


def seed_libraries(self, location):
    logger.info(f"Seeding xCos symbols from {location}")

    tree = ET.parse(os.path.join(location, 'palettes.xml'))
    root = tree.getroot()
    categories = []

    logger.info("fetching categories")
    #Fetch categories from xml
    for node in root.findall("./node/node"):
        categories.append(node.attrib["name"])
        logger.info(node.attrib["name"])


    #Fetch blocks for each category
    for cat in categories:
        category = Categories(
            library_name=cat,
        )
        category.save() # Save category in DB
        for node in root.findall("./node/node[@name='" + cat + "']/block"):
            file = location + '/' + node.attrib["name"] + '.svg'

            block = Blocks(
                name=node.attrib["name"],
                svg_path=file,
                thumbnail_path=file,
                component_library=category
            )
            block.save() # Save block in DB
