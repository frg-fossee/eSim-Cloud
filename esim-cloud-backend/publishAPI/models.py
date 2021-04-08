from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.deletion import CASCADE, SET_NULL
from django.utils.safestring import mark_safe
from django.core.files.storage import FileSystemStorage
from django.conf import settings
import uuid
from workflowAPI.models import State


# For handling file uploads to a permenant direcrory
file_storage = FileSystemStorage(
    location=settings.FILE_STORAGE_ROOT, base_url=settings.FILE_STORAGE_URL)


class CircuitTag(models.Model):

    tag = models.CharField(null=False, max_length=100,
                           blank=False, unique=True)
    description = models.CharField(max_length=200, blank=False)

    # For Django Admin
    def __str__(self):
        return self.tag


class Circuit(models.Model):
    circuit_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)

    # Circuit Details
    title = models.CharField(
        max_length=200, blank=False, unique=True)  # Search

    state = models.ForeignKey(State,on_delete=CASCADE,default=1)
    
    author = models.ForeignKey(
        get_user_model(), null=True, on_delete=models.CASCADE)

    # Meta Data
    is_arduino = models.BooleanField(default=False, null=False) 
    def __str__(self):
        return self.title
