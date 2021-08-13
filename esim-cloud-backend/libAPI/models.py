import os
import shutil
from djongo import models
from django.utils.safestring import mark_safe
from django.contrib.auth import get_user_model
from django.dispatch import receiver
from django.db.models.signals import post_delete


class LibrarySet(models.Model):
    user = models.ForeignKey(to=get_user_model(), verbose_name="user",
                             on_delete=models.CASCADE)
    default = models.BooleanField(default=False)
    name = models.CharField(max_length=24, default="default")

    class Meta:
        unique_together = ('user', 'name')


@receiver(post_delete, sender=LibrarySet)
def library_set_post_delete_receiver(sender, instance: LibrarySet, **kwargs):
    try:
        shutil.rmtree(
            os.path.join(
                "kicad-symbols/",
                instance.user.username + '-' + instance.name
            ))
    except Exception:
        pass


class Library(models.Model):
    library_set = models.ForeignKey(
        LibrarySet, null=True,
        verbose_name="library_set",
        on_delete=models.CASCADE
    )
    library_name = models.CharField(max_length=200)
    saved_on = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.library_name

    def delete(self, *args, **kwargs):
        try:
            shutil.rmtree(
                os.path.join(
                    "./kicad-symbols/",
                    self.library_set.user.username + "-"
                    + self.library_set.name,
                    "symbol-svgs", self.library_name[:-4]
                ))
        except Exception:
            pass
        super(Library, self).delete(*args, **kwargs)


@receiver(post_delete, sender=Library)
def library_post_delete_receiver(sender, instance: Library, **kwargs):
    try:
        shutil.rmtree(
            os.path.join(
                "kicad-symbols/",
                instance.library_set.user.username + "-"
                + instance.library_set.name,
                "symbol-svgs", instance.library_name[:4], "/"
            ))
    except Exception:
        pass


class LibraryComponent(models.Model):
    name = models.CharField(max_length=200)
    svg_path = models.CharField(max_length=400)
    thumbnail_path = models.CharField(max_length=400)
    description = models.CharField(max_length=400)
    data_link = models.URLField(max_length=200)
    full_name = models.CharField(max_length=200)
    keyword = models.CharField(max_length=200)
    symbol_prefix = models.CharField(max_length=10)
    component_library = models.ForeignKey(
        Library, on_delete=models.CASCADE, null=False, related_name='library')

    # For Django Admin Panel
    def image_tag(self):
        if self.svg_path:
            return mark_safe('<img src="/%s" style="width: 45px; height:45px;" />' % self.svg_path)  # noqa
        else:
            return 'No Image Found'
    image_tag.short_description = 'Image'

    def __str__(self):
        return self.name

    def delete(self, *args, **kwargs):
        try:
            os.remove(self.thumbnail_path)
            os.remove(self.svg_path)
        except Exception:
            pass
        super(LibraryComponent, self).delete(*args, **kwargs)


@receiver(post_delete, sender=LibraryComponent)
def component_post_delete_receiver(
        sender, instance: LibraryComponent, **kwargs):
    try:
        os.remove(instance.thumbnail_path)
        os.remove(instance.svg_path)
    except Exception:
        pass


class ComponentAlternate(models.Model):
    part = models.CharField(max_length=1)
    dmg = models.PositiveSmallIntegerField()
    full_name = models.CharField(max_length=200)
    svg_path = models.CharField(max_length=400)
    parent_component = models.ForeignKey(
        LibraryComponent,
        on_delete=models.CASCADE,
        null=False,
        related_name='alternate_component')

    # For Django Admin Panel
    def image_tag(self):
        if self.svg_path:
            return mark_safe('<img src="/%s" style="width: 45px; height:45px;" />' % self.svg_path)  # noqa
        else:
            return 'No Image Found'

    image_tag.short_description = 'Image'

    def __str__(self):
        return self.full_name

    def delete(self, *args, **kwargs):
        try:
            os.remove(self.svg_path)
        except Exception:
            pass
        super(ComponentAlternate, self).delete(*args, **kwargs)


@receiver(post_delete, sender=ComponentAlternate)
def alt_component_post_delete_receiver(
        sender, instance: ComponentAlternate, **kwargs):
    try:
        os.remove(instance.svg_path)
    except Exception:
        pass


class FavouriteComponent(models.Model):
    owner = models.OneToOneField(to=get_user_model(),
                                 on_delete=models.CASCADE, null=False)
    component = models.ManyToManyField(to=LibraryComponent)
    last_change = models.DateTimeField(auto_now=True)
