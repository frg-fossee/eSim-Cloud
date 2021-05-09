import django_filters
from django.db.models import Q
from libAPI.serializers import LibrarySerializer, LibraryComponentSerializer, LibrarySetSerializer
from libAPI.models import Library, LibraryComponent, LibrarySet
from rest_framework import viewsets
import logging
from django_filters import rest_framework as filters
logger = logging.getLogger(__name__)


class LibraryFilterSet(django_filters.FilterSet):
    class Meta:
        model = Library
        fields = {
            'library_name': ['exact'],
        }


class LibraryViewSet(viewsets.ReadOnlyModelViewSet):
    """
     Listing All Library Details
    """
    queryset = Library.objects.all()
    serializer_class = LibrarySerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = LibraryFilterSet

    def get_queryset(self):
        if self.request.GET.get('library_set', None) is not None:
            print("Here")
            library_set = LibrarySet.objects.get(pk=self.request.GET.get('library_set'))
            if library_set.user == self.request.user or library_set.default == True:
                return Library.objects.filter(library_set=library_set)
            elif not self.request.user.is_authenticated:
                return Library.objects.none()
        else:
            default_library_set = LibrarySet.objects.get(default=True)
            return Library.objects.filter(library_set=default_library_set)


class LibraryComponentFilterSet(django_filters.FilterSet):
    class Meta:
        model = LibraryComponent
        fields = {
            'name': ['icontains'],
            'keyword': ['icontains'],
            'description': ['icontains'],
            'component_library__library_name': ['icontains'],
            'component_library': ['exact'],
            'symbol_prefix': ['exact'],
        }


class LibraryComponentViewSet(viewsets.ReadOnlyModelViewSet):
    """
     Listing All Library Details
    """
    queryset = LibraryComponent.objects.all()
    serializer_class = LibraryComponentSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = LibraryComponentFilterSet


class LibrarySetViewSet(viewsets.ModelViewSet):
    """
    Listing Library Sets available to a user
    """
    serializer_class = LibrarySetSerializer

    def get_queryset(self):
        if self.request.user.is_authenticated:
            queryset = LibrarySet.objects.filter(Q(user=self.request.user) | Q(default=True))
        else:
            queryset = LibrarySet.objects.filter(default=True)
        return queryset

    def create(self, request, *args, **kwargs):
        return
