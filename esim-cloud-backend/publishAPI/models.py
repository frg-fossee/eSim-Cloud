from django.db import models
from django.contrib.auth import get_user_model

import uuid


class CircuitTag(models.Model):

    tag = models.CharField(null=False, max_length=100,
                           required=True, unique=True)
    description = models.CharField(max_length=200, required=True)


class Circuit(models.Model):

    circuit_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)

    # Circuit Details
    title = models.CharField(max_length=200, required=True)  # Search

    sub_title = models.CharField(max_length=200, required=False)  # Search

    data_dump = models.TextField(required=True)

    base64_image = models.TextField(required=True)

    author = models.ForeignKey(
        get_user_model(), null=False, on_delete=models.SET_NULL)

    # Meta Data

    description = models.TextField()

    tags = models.ManyToManyField(CircuitTag)  # Filter

    last_updated = models.DateTimeField(auto_now=True)

    publish_request_time = models.DateTimeField(auto_now_add=True)

    publish_time = models.DateTimeField(auto_now=False, null=True)

    # Review Mechanism

    published = models.BooleanField(default=False)

    reviewed_by = models.ForeignKey(
        get_user_model(), null=True, on_delete=models.SET_NULL)
