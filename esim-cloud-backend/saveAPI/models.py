from djongo import models
import uuid


class StateSave(models.Model):

    save_time = models.DateTimeField(auto_now=True, db_index=True)
    save_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    data_dump = models.TextField()

    def save(self, *args, **kwargs):
        super(StateSave, self).save(*args, **kwargs)
