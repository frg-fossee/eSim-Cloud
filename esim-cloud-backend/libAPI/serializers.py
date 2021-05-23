import logging
from rest_framework import serializers
from libAPI.models import Library, \
    LibraryComponent, \
    ComponentAlternate, \
    FavouriteComponent

logger = logging.getLogger(__name__)


class LibrarySerializer(serializers.ModelSerializer):
    class Meta:
        model = Library
        fields = ('library_name', 'saved_on', 'id')


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


class FavouriteComponentSerializer(serializers.ModelSerializer):
    component = LibraryComponentSerializer(many=True)

    class Meta:
        model = FavouriteComponent
        fields = ("component",)
