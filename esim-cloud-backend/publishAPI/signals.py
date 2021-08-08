# import logging
# logger = logging.getLogger(__name__)


# def add_staff_status(sender, instance, action, **kwargs):
#     logger.info('Group add/remove hook called')
#     if action == 'post_add':
#         instance.is_staff = True
#         instance.save()
#         logger.info('Added is_staff flag for ' + str(instance))
#     if action == 'post_remove':
#         instance.is_staff = False
#         instance.save()
#         logger.info('Removed is_staff flag for ' + str(instance))


# def populate_models(sender, **kwargs):
#     from django.contrib.auth.models import Group, Permission
#     from publishAPI import models

#     GROUPS_PERMISSIONS = {
#         'Reviewers': {
#             models.Publish: ['add', 'change', 'delete', 'view'],
#             models.Circuit: ['view', 'add', 'delete'],
#             models.CircuitTag: ['add', 'view', 'change', 'delete'],
#         },
#     }

#     for group_name in GROUPS_PERMISSIONS:

#         # Get or create group
#         group, created = Group.objects.get_or_create(name=group_name)

#         # Loop models in group
#         for model_cls in GROUPS_PERMISSIONS[group_name]:

#             # Loop permissions in group/model
#             for perm_index, perm_name in \
#                     enumerate(GROUPS_PERMISSIONS[group_name][model_cls]):
#                 # Generate permission name as Django would generate it
#                 codename = perm_name + "_" + model_cls._meta.model_name

#                 try:
#                     # Find permission object and add to group
#                     perm = Permission.objects.get(codename=codename)
#                     group.permissions.add(perm)
#                     logger.info(str(perm_index)
#                                 + " Adding "
#                                 + codename
#                                 + " to group "
#                                 + group.__str__())
#                 except Permission.DoesNotExist:
#                     logger.info(codename + " not found")
