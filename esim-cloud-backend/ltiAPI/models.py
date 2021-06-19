from django.db import models
from saveAPI.models import StateSave
from django.contrib.auth import get_user_model
from simulationAPI.models import simulation


# Create your models here.
class lticonsumer(models.Model):
    consumer_key = models.CharField(max_length=50, null=False, unique=True)
    secret_key = models.CharField(max_length=50, null=False)
    model_schematic = models.ForeignKey(to=StateSave, on_delete=models.CASCADE,
                                        related_name="model_schematic")
    score = models.FloatField()
    initial_schematic = models.ForeignKey(to=StateSave, on_delete=models.SET_NULL,
                                          null=True, related_name="initial_schematic")
    test_case = models.ForeignKey(to=simulation, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.consumer_key


class ltiSession(models.Model):
    user_id = models.CharField(max_length=150)
    lis_result_sourcedid = models.CharField(max_length=150, null=True)
    lis_outcome_service_url = models.CharField(max_length=150)
    oauth_nonce = models.CharField(max_length=150)
    oauth_timestamp = models.CharField(max_length=150)
    oauth_consumer_key = models.CharField(max_length=150)
    oauth_signature_method = models.CharField(max_length=150)
    oauth_version = models.CharField(max_length=150)
    oauth_signature = models.CharField(max_length=150)


class Submission(models.Model):
    project = models.ForeignKey(to=lticonsumer, on_delete=models.CASCADE)
    student = models.ForeignKey(
        to=get_user_model(), blank=True, null=True, on_delete=models.CASCADE)
    score = models.FloatField()
    ltisession = models.ForeignKey(
        to=ltiSession, on_delete=models.CASCADE, null=True)
    schematic = models.ForeignKey(to=StateSave, on_delete=models.CASCADE)
    lms_success = models.BooleanField(null=True)

    def __str__(self):
        return "Submitted" if self.lms_success else "Not submitted"
