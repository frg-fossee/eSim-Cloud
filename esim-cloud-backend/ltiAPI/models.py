from django.db import models
from saveAPI.models import StateSave
from django.contrib.auth import get_user_model
import uuid


# Create your models here.
class lticonsumer(models.Model):
    consumer_key = models.CharField(max_length=50, null=False, unique=True)
    secret_key = models.CharField(max_length=50, null=False)
    save_id = models.ForeignKey(to=StateSave, on_delete=models.CASCADE)
    score = models.FloatField()


class ltiSession(models.Model):
    user_id = models.CharField(max_length=100)
    lis_result_sourcedid = models.CharField(max_length=100, null=True)
    lis_outcome_service_url = models.CharField(max_length=100)
    oauth_nonce = models.CharField(max_length=100)
    oauth_timestamp = models.CharField(max_length=100)
    oauth_consumer_key = models.CharField(max_length=100)
    oauth_signature_method = models.CharField(max_length=100)
    oauth_version = models.CharField(max_length=100)
    oauth_signature = models.CharField(max_length=100)


class Submission(models.Model):
    project = models.ForeignKey(to=lticonsumer, on_delete=models.CASCADE)
    student = models.ForeignKey(to=get_user_model(), blank=True, null=True, on_delete=models.CASCADE)
    score = models.FloatField()
    ltisession = models.ForeignKey(to=ltiSession, on_delete=models.CASCADE, null=True)
    schematic = models.ForeignKey(to=StateSave, on_delete=models.CASCADE)
    lms_success = models.BooleanField(null=True)
