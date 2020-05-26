from djongo import models
import uuid


class esimSave(models.Model):

    save_time = models.DateTimeField(auto_now=True, db_index=True)
    save_id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    xml_dump = models.TextField()

    def save(self, *args, **kwargs):
        super(esimSave, self).save(*args, **kwargs)
