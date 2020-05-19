import logging
from rest_framework import serializers
from libAPI.models import Library, LibraryComponent

logger = logging.getLogger(__name__)


class LibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Library
        fields = ('library_name', 'saved_on')


class LibraryComponentSerializer(serializers.ModelSerializer):

    class Meta:
        model = LibraryComponent
        fields = (
            'name',
            'svg_path',
            'symbol_prefix',
            'component_library',
            'description',
            'data_link',
            'full_name',
            'keyword',
            'part',
            'dmg'
             )
