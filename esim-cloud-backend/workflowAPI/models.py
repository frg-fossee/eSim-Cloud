from django.db import models
from django.contrib.auth.models import Group
from django.db.models.deletion import CASCADE, SET_NULL
from django.contrib.auth import get_user_model


# State model which has been linked to circuits in publishAPI
class State(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, null=False)
    description = models.CharField(null=True, max_length=200)
    public = models.BooleanField(default=False)

    def __str__(self):
        return self.name

# Extending the Django users to implement arduino and e-sim specific roles
class CustomGroup(models.Model):
    def __str__(self):
        return "{}".format(self.group.name)

    group = models.OneToOneField(Group, unique=True, on_delete=CASCADE)
    accessible_states = models.ManyToManyField(State, related_name='accessible_states',verbose_name="Other circuits accesible states")
    is_arduino = models.BooleanField(default=False)

# Transition models to handle switching of states.
class Transition(models.Model):
    name = models.CharField(null=True, max_length=100)
    role = models.ManyToManyField(Group, related_name='role')
    from_state = models.ForeignKey(State, null=True, related_name='fromtransitions', on_delete=SET_NULL)
    to_state = models.ForeignKey(State, null=True, related_name='totransitions', on_delete=SET_NULL)
    allowed_for_creator = models.BooleanField(default=True, null=False)

    def __str__(self):
        return self.name

# Model to log all the transitions done by all types of users
class TransitionHistory(models.Model):
    id = models.AutoField(primary_key=True)
    circuit = models.ForeignKey('publishAPI.Circuit', editable=False, on_delete=models.CASCADE)
    transition_author = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    from_state = models.ForeignKey(State, related_name='historyfromtransitions', on_delete=CASCADE)
    to_state = models.ForeignKey(State, related_name='historytotransitions', on_delete=CASCADE)
    transition_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Transition Histories'
