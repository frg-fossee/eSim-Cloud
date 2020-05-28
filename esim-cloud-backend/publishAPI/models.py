from django.db import models
from django.contrib.auth import get_user_model
import uuid


class CircuitTag(models.Model):

    tag = models.CharField(null=False, max_length=100,
                           blank=False, unique=True)
    description = models.CharField(max_length=200, blank=False)


class Circuit(models.Model):

    circuit_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)

    # Circuit Details
    title = models.CharField(
        max_length=200, blank=False, unique=True)  # Search

    sub_title = models.CharField(max_length=200, blank=True)  # Search

    data_dump = models.TextField(blank=False)

    base64_image = models.TextField(blank=False)

    author = models.ForeignKey(
        get_user_model(), null=True, on_delete=models.SET_NULL)

    # Meta Data

    description = models.TextField()

    last_updated = models.DateTimeField(auto_now=True)

    publish_request_time = models.DateTimeField(auto_now_add=True)

    # For Django Admin Panel
    def image_tag(self):
        if self.svg_path:
            return mark_safe('<img src="/%s" style="width: 45px; height:45px;" />' % self.base64_image)  # noqa
        else:
            return 'No Image Found'
    image_tag.short_description = 'Image'

    def __str__(self):
        return self.title


class Publish(models.Model):
    circuit_id = models.ForeignKey(
        Circuit, on_delete=models.CASCADE, null=False, blank=False)

    publish_time = models.DateTimeField(auto_now=False, null=True)

    published = models.BooleanField(default=False)

    tags = models.ManyToManyField(CircuitTag)  # Filter

    reviewed_by = models.ForeignKey(
        get_user_model(), null=True, on_delete=models.SET_NULL)

    # For Django Admin Panel
    def __str__(self):
        return 'Review - ' + self.circuit_id.title
