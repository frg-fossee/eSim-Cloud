from django.db import models
from django.contrib.auth.models import Group
from django.db.models.deletion import CASCADE, SET_NULL
from django.contrib.auth import get_user_model


# State model which has been linked to circuits in publishAPI
class State(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, null=False,unique=True)
    description = models.CharField(null=True, max_length=200)
    public = models.BooleanField(default=False)
    report = models.BooleanField(default=False)
    def __str__(self):
        return self.name

# Extending the Django users to implement arduino and e-sim specific roles
class CustomGroup(models.Model):
    def __str__(self):
        return "{}".format(self.group.name)

    group = models.OneToOneField(Group, unique=True, on_delete=CASCADE)
    is_arduino = models.BooleanField(default=False)
    is_type_reviewer = models.BooleanField(default=False)

class Permission(models.Model):
    role=models.ForeignKey(to=Group,related_name='permission_role',on_delete=CASCADE)
    view_own_states = models.ManyToManyField(State,related_name="view_own_states",verbose_name='Can View own Project',blank=True)
    view_other_states = models.ManyToManyField(State,related_name="view_other_states",verbose_name='Can View other Project',blank=True)
    edit_own_states = models.ManyToManyField(State,related_name="edit_own_states",verbose_name='Can Edit Details and Status own Project',blank=True)
    del_own_states = models.ManyToManyField(State,related_name="del_own_states",verbose_name='Can Delete own Project',blank=True)
    def __str__(self):
        return self.role.name + " Permissions"

# Transition models to handle switching of states.
class Transition(models.Model):
    name = models.CharField(null=True, max_length=100)
    role = models.ManyToManyField(Group, related_name='role')
    from_state = models.ForeignKey(State, null=True, related_name='fromtransitions', on_delete=SET_NULL)
    to_state = models.ForeignKey(State, null=True, related_name='totransitions', on_delete=SET_NULL)
    restricted_for_creator = models.BooleanField(default=True, null=False,verbose_name="Transition allowed for all users of specified roles except creator")
    only_for_creator = models.BooleanField(default=False,null=False,verbose_name="Transition that ONLY the creator should be able to do it.")
    def __str__(self):
        return self.name


