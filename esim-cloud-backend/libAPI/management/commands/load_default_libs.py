from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from libAPI.lib_utils import save_libs
from libAPI.models import LibrarySet
import os
import logging
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Load default libraries if not already present."

    def add_arguments(self, parser):
        parser.add_argument(
            '--username',
            help='input a user\'s username', type=str
        )
        parser.add_argument(
            '--location', type=self.dir_path,
            help="Directory containing kicad library files"
        )

    def dir_path(self, path):
        if os.path.isdir(path):
            return path
        else:
            raise Exception(f"{path} is not a valid path")

    def handle(self, *args, **options):
        User = get_user_model()
        if options['username']:
            user = User.objects.get(username=options['username'])
        else:
            raise Exception("Enter a superuser to associate libs")
        library_set = LibrarySet.objects.filter(
            user=user, default=True
        ).first()
        if not library_set:
            library_set = LibrarySet(
                user=user,
                default=True,
                name="esim-default"
            )
            library_set.save()

        logger.info(f"Reading libraries from {options['location']}")

        if not os.path.isdir(
                os.path.join(options['location'], 'esim-default')):
            os.mkdir(os.path.join(options['location'], 'esim-default'))
        save_libs(
            os.listdir(options['location']),
            options['location'],
            os.path.join(options['location'], 'esim-default'),
            library_set
        )
