import logging
from rest_framework import serializers
from .models import Categories, Blocks

logger = logging.getLogger(__name__)


class CategoriesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categories
        fields = ('library_name', 'saved_on', 'id')


class BlocksSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Blocks
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
            'keyword'
        )
