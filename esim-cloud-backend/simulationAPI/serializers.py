import os
import logging
from rest_framework import serializers
from simulationAPI.models import spiceFile, Task

logger = logging.getLogger(__name__)

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = spiceFile
        fields = ('file', 'upload_time','file_id','task')



class TaskSerializer(serializers.HyperlinkedModelSerializer):
    # User details for auth to be stored along with task.
    # user = serializers.ReadOnlyField(source='user.username')
    files_set = FileSerializer( many=True, read_only=True)

    class Meta:
        model = Task
        fields = ('task_id','task_time','files_set')

    def create(self, validated_data):
        files_data = self.context.get('view').request.FILES.getlist("file")
        logger.debug('Task Create', self.context.get('view').request.FILES)
        task = Task.objects.create()
        print('task: ', task)
        for file_data in files_data:
            spiceFile.objects.create(task=task, file=file_data)
            logger.info('Created Object for:', file_data.name)
        return task
