from rest_framework import serializers
from saveAPI.models import StateSave


class StateSaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = StateSave
        fields = ('save_time', 'save_id', 'data_dump')
