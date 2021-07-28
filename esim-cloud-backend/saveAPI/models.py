from djongo import models
from django.contrib.auth import get_user_model
from django.core.files.storage import FileSystemStorage
from django.conf import settings
import uuid
from libAPI.models import Library
from publishAPI.models import Project
from django.utils.safestring import mark_safe

# For handling file uploads to a permenant direcrory
file_storage = FileSystemStorage(
    location=settings.FILE_STORAGE_ROOT, base_url=settings.FILE_STORAGE_URL)


class StateSave(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=200, null=True)
    description = models.CharField(max_length=400, null=True)
    save_time = models.DateTimeField(auto_now=True, db_index=True)
    create_time = models.DateTimeField(auto_now_add=True)
    save_id = models.UUIDField(default=uuid.uuid4)
    data_dump = models.TextField(null=False)
    shared = models.BooleanField(default=False)
    owner = models.ForeignKey(
        get_user_model(), null=True, on_delete=models.CASCADE)
    base64_image = models.ImageField(
        upload_to='circuit_images', storage=file_storage, null=True)
    version = models.CharField(max_length=20, null=False)
    branch = models.CharField(max_length=20, null=False)
    is_arduino = models.BooleanField(default=False, null=False)
    esim_libraries = models.ManyToManyField(Library)
    project = models.ForeignKey(to=Project, on_delete=models.SET_NULL,
                                null=True)

    def save(self, *args, **kwargs):
        super(StateSave, self).save(*args, **kwargs)

    def __str__(self):
        return self.name


class Gallery(models.Model):
    id = models.AutoField(primary_key=True)
    save_id = models.CharField(unique=True, max_length=500, null=False)
    data_dump = models.TextField(null=False)
    name = models.CharField(max_length=100, default="Untitled")
    description = models.CharField(max_length=1000)
    media = models.ImageField(
        upload_to='circuit_images_esim', storage=file_storage, null=True)
    shared = models.BooleanField(default=True)
    save_time = models.DateTimeField(auto_now=True)
    is_arduino = models.BooleanField(default=False, null=False)
    esim_libraries = models.ManyToManyField(Library)

    # For Django Admin Panel
    def image_tag(self):
        print(file_storage)
        if self.media:
            return mark_safe('<img src="%s" style="width: 45px; height:45px;" />' % self.media.url)  # noqa
        else:
            return 'No Image Found'
    image_tag.short_description = 'Image'

    def __str__(self):
        return self.name
