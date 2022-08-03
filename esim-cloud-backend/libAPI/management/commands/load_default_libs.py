from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from libAPI.lib_utils import save_libs
from libAPI.models import LibrarySet
from esimCloud import settings
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
        parser.add_argument(
            '--default', action='store_true',
            help="set if the library is default or not"
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
        name = 'esim-default' if options['default'] else 'esim-additional'
        library_set = LibrarySet.objects.filter(
            user=user,
            default=options['default'],
            name=name
        ).first()
        if not library_set:
            library_set = LibrarySet(
                user=user,
                default=True if options['default'] else False,
                name=name
            )
            library_set.save()

        out_location = os.path.join(
            "kicad-symbols/",
            library_set.user.username + "-" + name
        )

        logger.info(f"Reading libraries from {options['location']}")
        logger.info(f"Saving as " + name[5:])
        logger.info(f"Saving Libraries to {out_location}")

        if not os.path.isdir(out_location):
            os.mkdir(out_location)
        try:
            save_libs(
                os.listdir(options['location']),
                options['location'],
                out_location,
                library_set
            )
            logger.info("Finished without errors")
        except Exception:
            logger.error("Couldn't save all the libs")
