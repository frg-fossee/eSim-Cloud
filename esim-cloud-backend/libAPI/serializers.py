import logging
from rest_framework import serializers
from libAPI.models import Library, LibraryComponent

logger = logging.getLogger(__name__)


class LibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Library
        fields = '__all__'


class LibraryComponentSerializer(serializers.ModelSerializer):

    class Meta:
        model = LibraryComponent
        fields = ('component_name', 'svg_path', 'component_type',
                  'component_library')
