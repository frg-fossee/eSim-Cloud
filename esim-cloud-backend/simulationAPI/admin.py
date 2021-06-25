from django.contrib import admin
from .models import simulation, spiceFile, Task
# Register your models here.


class taskAdmin(admin.ModelAdmin):
    list_display = ['task_time', 'task_id']


class spiceFileAdmin(admin.ModelAdmin):
    list_display = ['file_id', 'file', 'upload_time', 'task']


class outputAdmin(admin.ModelAdmin):
    list_display = ['simulation_type', 'task_id', 'owner']


admin.site.register(Task, taskAdmin)
admin.site.register(spiceFile, spiceFileAdmin)
admin.site.register(simulation, outputAdmin)
