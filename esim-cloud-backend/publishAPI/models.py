from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.deletion import CASCADE, SET_NULL
from django.contrib.postgres.fields import ArrayField
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


class Field(models.Model):
    name = models.CharField(
        max_length=40, blank=False)
    text = models.CharField(max_length=400, null=True)


class Project(models.Model):
    project_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)

    # Circuit Details
    title = models.CharField(
        max_length=200, blank=False)  # Search
    description = models.CharField(max_length=1000, null=True)
    fields = models.ManyToManyField(to=Field)
    state = models.ForeignKey(State, on_delete=CASCADE, default=1)
    author = models.ForeignKey(
        get_user_model(), null=True, on_delete=models.CASCADE)
    is_arduino = models.BooleanField(default=False, null=False)
    is_reported = models.BooleanField(default=False, null=True)
    active_branch = models.CharField(max_length=20, null=True)
    active_version = models.CharField(max_length=20, null=True)

    def __str__(self):
        return self.title


class TransitionHistory(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(
        Project, editable=False, on_delete=models.CASCADE, null=True)
    transition_author = models.ForeignKey(
        get_user_model(), on_delete=models.CASCADE)
    from_state = models.ForeignKey(
        State, related_name='historyfromtransitions', on_delete=CASCADE)
    to_state = models.ForeignKey(
        State, related_name='historytotransitions', on_delete=CASCADE)
    transition_time = models.DateTimeField(auto_now_add=True)
    reviewer_notes = models.CharField(max_length=500, blank=True)
    is_done_by_reviewer = models.BooleanField(default=False, null=True)

    class Meta:
        verbose_name_plural = 'Transition Histories'


class Report(models.Model):
    id = models.AutoField(primary_key=True)
    project = models.ForeignKey(
        Project, editable=False, on_delete=models.CASCADE, null=True)
    report_open = models.BooleanField(default=True, null=False)
    resolver = models.ForeignKey(
        get_user_model(), on_delete=models.CASCADE, null=True, related_name='resolver')  # noqa
    report_time = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=500, null=False)
    reporter = models.ForeignKey(
        get_user_model(), on_delete=models.CASCADE, related_name='reporter', null=True)  # noqa
    approved = models.BooleanField(default=None, null=True)
