import django_filters
from .serializers import CategoriesSerializer, BlocksSerializer
from .models import Categories, Blocks
from rest_framework import viewsets
import logging
from django_filters import rest_framework as filters
logger = logging.getLogger(__name__)


class CategoriesFilterSet(django_filters.FilterSet):
    class Meta:
        model = Categories
        fields = {
            'library_name': ['exact'],
        }


class CategoriesViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Categories.objects.all()
    serializer_class = CategoriesSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = CategoriesFilterSet


class BlocksFilterSet(django_filters.FilterSet):
    class Meta:
        model = Blocks
        fields = {
            'name': ['icontains'],
            'keyword': ['icontains'],
            'description': ['icontains'],
            'component_library__library_name': ['icontains'],
            'component_library': ['exact'],
            'symbol_prefix': ['exact'],
        }


class BlocksViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Blocks.objects.all()
    serializer_class = BlocksSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = BlocksFilterSet
