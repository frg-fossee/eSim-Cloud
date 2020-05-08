from djongo import models


class LibraryComponent(models.Model):
    component_name = models.CharField(max_length=200)
    svg_path = models.FilePathField()
    component_type = models.CharField(max_length=20)

    class Meta:
        abstract = True

    def __str__(self):
        return self.component_name


class Library(models.Model):
    library_name = models.CharField(max_length=200)
    library_type = models.CharField(max_length=20)
    saved_on = models.DateTimeField(auto_now=True)
    components = models.ArrayField(
        model_container=LibraryComponent,
    )

    def __str__(self):
        return self.library_name
