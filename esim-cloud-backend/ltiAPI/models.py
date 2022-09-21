from pyexpat import model
from django.db import models
from saveAPI.models import ArduinoModelSimulationData, StateSave
from django.contrib.postgres.fields import ArrayField
from django.contrib.auth import get_user_model
from simulationAPI.models import simulation
import uuid


# Create your models here.
class lticonsumer(models.Model):
    id = models.UUIDField(default=uuid.uuid4, editable=False,
                          unique=True, primary_key=True)
    consumer_key = models.CharField(max_length=50, null=False)
    secret_key = models.CharField(max_length=50, null=False)
    model_schematic = models.ForeignKey(to=StateSave, on_delete=models.CASCADE,
                                        related_name="model_schematic")
    score = models.FloatField(null=True, blank=True)
    initial_schematic = models.ForeignKey(to=StateSave,
                                          on_delete=models.SET_NULL,
                                          null=True,
                                          related_name="initial_schematic")
    test_case = models.ForeignKey(
        to=simulation, on_delete=models.CASCADE, null=True, blank=True)
    sim_params = ArrayField(
        models.CharField(max_length=20), blank=True, null=True)
    scored = models.BooleanField(null=False)

    def __str__(self):
        return self.consumer_key


class ArduinLTIConsumer(models.Model):
    id = models.UUIDField(default=uuid.uuid4, editable=False,
                          unique=True, primary_key=True)
    consumer_key = models.CharField(max_length=50, null=False)
    secret_key = models.CharField(max_length=50, null=False)
    model_schematic = models.ForeignKey(to=StateSave, on_delete=models.CASCADE,
                                        related_name="arduino_model_schematic")
    score = models.FloatField(null=True, blank=True)
    con_weightage = models.FloatField(null=False, default=60)
    initial_schematic = models.ForeignKey(
        to=StateSave,
        on_delete=models.SET_NULL,
        null=True,
        related_name="arduino_initial_schematic")
    test_case = models.ForeignKey(
        to=ArduinoModelSimulationData, on_delete=models.CASCADE, null=True,
        blank=True)
    scored = models.BooleanField(null=False)
    view_code = models.BooleanField(null=False)

    def __str__(self):
        return self.consumer_key


class ltiSession(models.Model):
    user_id = models.CharField(max_length=200, null=True)
    lti_consumer = models.ForeignKey(to=lticonsumer,
                                     on_delete=models.CASCADE, null=True)
    lis_result_sourcedid = models.CharField(max_length=300, null=True)
    lis_outcome_service_url = models.CharField(max_length=300, null=True)
    oauth_nonce = models.CharField(max_length=300)
    oauth_timestamp = models.CharField(max_length=300)
    oauth_consumer_key = models.CharField(max_length=300)
    oauth_signature_method = models.CharField(max_length=300)
    oauth_version = models.CharField(max_length=300)
    oauth_signature = models.CharField(max_length=300)
    simulations = models.ManyToManyField(to=simulation)


class ArduinoLTISession(models.Model):
    user_id = models.CharField(max_length=200, null=True)
    lti_consumer = models.ForeignKey(to=ArduinLTIConsumer,
                                     on_delete=models.CASCADE, null=True)
    lis_result_sourcedid = models.CharField(max_length=300, null=True)
    lis_outcome_service_url = models.CharField(max_length=300, null=True)
    oauth_nonce = models.CharField(max_length=300)
    oauth_timestamp = models.CharField(max_length=300)
    oauth_consumer_key = models.CharField(max_length=300)
    oauth_signature_method = models.CharField(max_length=300)
    oauth_version = models.CharField(max_length=300)
    oauth_signature = models.CharField(max_length=300)
    simulations = models.ManyToManyField(to=ArduinoModelSimulationData)


class Submission(models.Model):
    project = models.ForeignKey(to=lticonsumer, on_delete=models.CASCADE)
    student = models.ForeignKey(
        to=get_user_model(), blank=True, null=True, on_delete=models.CASCADE)
    score = models.FloatField()
    ltisession = models.ForeignKey(
        to=ltiSession, on_delete=models.CASCADE, null=True)
    schematic = models.ForeignKey(to=StateSave, on_delete=models.CASCADE)
    student_simulation = models.ForeignKey(to=simulation,
                                           on_delete=models.CASCADE, null=True)
    lms_success = models.BooleanField(null=True)

    def __str__(self):
        return "Submitted" if self.lms_success else "Not submitted"


class ArduinoLTISimData(models.Model):
    session_id = models.ForeignKey(ArduinoLTISession, to_field='id',
                                   on_delete=models.CASCADE)
    circuit_id = models.ForeignKey(StateSave,  to_field='id',
                                   on_delete=models.CASCADE)
    result = models.TextField()

    def save(self, *args, **kwargs):
        super(ArduinoLTISimData, self).save(*args, **kwargs)

    def __str__(self):
        return self.result


class ArduinoSubmission(models.Model):
    project = models.ForeignKey(to=ArduinLTIConsumer, on_delete=models.CASCADE)
    student = models.ForeignKey(
        to=get_user_model(), blank=True, null=True, on_delete=models.CASCADE)
    score = models.FloatField()
    ltisession = models.ForeignKey(
        to=ArduinoLTISession, on_delete=models.CASCADE, null=True)
    schematic = models.ForeignKey(to=StateSave, on_delete=models.CASCADE)
    student_simulation = models.ForeignKey(to=ArduinoLTISimData,
                                           on_delete=models.CASCADE, null=True)
    lms_success = models.BooleanField(null=True)

    def __str__(self):
        return "Submitted" if self.lms_success else "Not submitted"
