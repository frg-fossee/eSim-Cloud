import logging
from rest_framework import serializers
from libAPI.models import Library, LibraryComponent, ComponentAlternate, LibrarySet

logger = logging.getLogger(__name__)


class LibrarySerializer(serializers.ModelSerializer):
    default = serializers.SerializerMethodField('is_default')

    def is_default(self, obj):
        if obj.library_set.default == True:
            return True
        return False

    class Meta:
        model = Library
        fields = ('library_name', 'saved_on', 'id', 'default')


class ComponentAlternateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComponentAlternate
        fields = (
            'dmg',
            'part',
            'full_name',
            'svg_path',
            'id'
        )


class LibraryComponentSerializer(serializers.HyperlinkedModelSerializer):
    alternate_component = ComponentAlternateSerializer(
        read_only=True, many=True)

    class Meta:
        model = LibraryComponent
        fields = (
            'id',
            'name',
            'svg_path',
            'thumbnail_path',
            'symbol_prefix',
            'component_library',
            'description',
            'data_link',
            'full_name',
            'keyword',
            'alternate_component'
        )


class LibrarySetSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = LibrarySet
        fields = [
            'id',
            'default',
            'name',
        ]
