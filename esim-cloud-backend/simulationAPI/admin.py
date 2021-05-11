from django.contrib import admin
from .models import Task, spiceFile, outputFile


# Register your models here.
@admin.register(spiceFile)
class FileAdmin(admin.ModelAdmin):
    list_display = ('file_id', 'file', 'upload_time',)


@admin.register(outputFile)
class FileAdmin(admin.ModelAdmin):
    list_display = ('file_id', 'file', 'upload_time',)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('task_time', 'task_id',)
