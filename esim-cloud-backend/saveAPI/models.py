from djongo import models
from django.contrib.auth import get_user_model
from django.core.files.storage import FileSystemStorage
from django.conf import settings
import uuid

# For handling file uploads to a permenant direcrory
file_storage = FileSystemStorage(
    location=settings.FILE_STORAGE_ROOT, base_url=settings.FILE_STORAGE_URL)


class StateSave(models.Model):

    save_time = models.DateTimeField(auto_now=True, db_index=True)
    save_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4)
    data_dump = models.TextField(null=False)
    shared = models.BooleanField(default=False)
    owner = models.ForeignKey(
        get_user_model(), null=True, on_delete=models.CASCADE)
    base64_image = models.ImageField(
        upload_to='circuit_images', storage=file_storage, null=True)

    def save(self, *args, **kwargs):
        super(StateSave, self).save(*args, **kwargs)
