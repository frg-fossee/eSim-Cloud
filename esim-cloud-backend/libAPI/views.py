import django_filters
from django.db.models import Q
from libAPI.serializers import LibrarySerializer, LibraryComponentSerializer, LibrarySetSerializer
from libAPI.models import Library, LibraryComponent, LibrarySet
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
import logging
from django_filters import rest_framework as filters
logger = logging.getLogger(__name__)


class IsLibraryOwner(BasePermission):

    def has_object_permission(self, request, view, obj):
        if obj.library_set.default == True:
            return True
        if request.user.is_authenticated:
            print(obj.library_set.user)
            print(obj.library_set.user)
            if obj.library_set.user == request.user:
                return True
        return False


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
    serializer_class = LibrarySerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = LibraryFilterSet
    permission_classes = (IsLibraryOwner,)

    # All Libraries available for user (custom+default)
    def get_queryset(self):
        if self.request.user.is_authenticated:
            return Library.objects.filter(
                Q(library_set__user=self.request.user)
                | Q(library_set__default=True)
            )
        else:
            return Library.objects.filter(library_set__default=True)

    # Custom libraries uploaded by the user
    @action(detail=False, methods=['GET', ], name='All custom libraries for user')
    def get_custom_libraries(self, request):
        if request.user.is_authenticated:
            lib_sets = LibrarySet.objects.filter(
                Q(user=request.user) & Q(default=False))
            lib_sets_id = []
            for set in lib_sets:
                lib_sets_id.append(set.id)
            queryset = Library.objects.filter(library_set__in=lib_sets_id)
            return Response(LibrarySerializer(queryset, many=True).data)
        return Response()

    # Default Libraries
    @action(detail=False, methods=['GET', ], name="All Default Libraries")
    def default(self, request):
        return Response(LibrarySerializer(
            Library.objects.filter(library_set__default=True),
            many=True).data
        )


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
            queryset = LibrarySet.objects.filter(
                Q(user=self.request.user) | Q(default=True))
        else:
            queryset = LibrarySet.objects.filter(default=True)
        return queryset

    def create(self, request, *args, **kwargs):
        return
