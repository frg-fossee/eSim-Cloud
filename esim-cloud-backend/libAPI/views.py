import django_filters
from libAPI.serializers import LibrarySerializer, LibraryComponentSerializer
from libAPI.models import Library, LibraryComponent
from rest_framework import viewsets
import logging
from django_filters import rest_framework as filters
logger = logging.getLogger(__name__)


class LibraryViewSet(viewsets.ReadOnlyModelViewSet):
    """
     Listing All Library Details
    """
    queryset = Library.objects.all()
    serializer_class = LibrarySerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_fields = ('library_type', 'library_name')


class LibraryComponentFilterSet(django_filters.FilterSet):
    class Meta:
        model = LibraryComponent
        fields = {
            'component_name': ['contains'],
            'component_library__library_name': ['contains'],
            'component_library': ['exact'],
            'component_type': ['exact'],
        }


class LibraryComponentViewSet(viewsets.ReadOnlyModelViewSet):
    """
     Listing All Library Details
    """
    queryset = LibraryComponent.objects.all()
    serializer_class = LibraryComponentSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = LibraryComponentFilterSet

