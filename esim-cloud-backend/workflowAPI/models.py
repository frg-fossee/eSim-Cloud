from django.db import models
from django.contrib.auth.models import Group, User
from django.db.models.base import Model
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
    accessible_states = models.ManyToManyField(State, related_name='accessible_states',verbose_name="Other circuits accesible states",null=True)
    is_arduino = models.BooleanField(default=False)
    is_type_reviewer = models.BooleanField(default=False)

# Transition models to handle switching of states.
class Transition(models.Model):
    name = models.CharField(null=True, max_length=100)
    role = models.ManyToManyField(Group, related_name='role')
    from_state = models.ForeignKey(State, null=True, related_name='fromtransitions', on_delete=SET_NULL)
    to_state = models.ForeignKey(State, null=True, related_name='totransitions', on_delete=SET_NULL)
    allowed_for_creator = models.BooleanField(default=True, null=False)
    only_for_creator = models.BooleanField(default=False,null=False)
    def __str__(self):
        return self.name

# Model to log all the transitions done by all types of users


#Model for Notifications
class Notification(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    text = models.CharField(max_length=500)
    date = models.DateTimeField(auto_now_add=True)
    shown = models.BooleanField(default=False,null=False)
    def __str__(self):
        return self.text

#Model for keeping track of all the reports for a circuit
