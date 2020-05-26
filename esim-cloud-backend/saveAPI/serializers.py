from rest_framework import serializers
from saveAPI.models import esimSave


class esimSaveSerializer(serializers.ModelSerializer):
    class Meta:
        model = esimSave
        fields = ('save_time', 'save_id', 'xml_dump')
