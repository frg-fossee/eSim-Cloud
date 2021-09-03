from django.contrib.auth import get_user_model
from django.db.models import Q
from django.core.management.base import BaseCommand
import logging
logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "Create default admin user if not already present."

    def add_arguments(self, parser):
        parser.add_argument(
            '--username', type=str,
            help="username of admin account"
        )
        parser.add_argument(
            '--password', type=str,
            help="password of the admin account"
        )

    def handle(self, *args, **options):
        if options['username'] and options['password']:
            User = get_user_model()
            user = User.objects.filter(username=options['username'])
            if user.count() > 0:
                raise Exception(f"User with same username exists")
            user = User.objects.create_superuser(
                username=options['username'],
                email='', password=options['password']
            )
            logger.info(
                f"Creating user {options['user']}"
                " with password {options['password']}")
            user.save()
        else:
            raise Exception("Username or Password not present")
