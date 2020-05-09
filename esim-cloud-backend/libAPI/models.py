from djongo import models


class Library(models.Model):
    library_name = models.CharField(max_length=200)
    library_type = models.CharField(max_length=20)
    saved_on = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.library_name


class LibraryComponent(models.Model):
    component_name = models.CharField(max_length=200)
    svg_path = models.FilePathField()
    component_type = models.CharField(max_length=20)
    component_library = models.ForeignKey(
        Library, on_delete=models.CASCADE, null=False)

    def __str__(self):
        return self.component_name
