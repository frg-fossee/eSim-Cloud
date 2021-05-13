from django.http import request
import django_filters
from django.db.models import Q
from libAPI.serializers import LibrarySerializer, LibraryComponentSerializer, LibrarySetSerializer
from libAPI.models import Library, LibraryComponent, LibrarySet, save_libs
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, IsAuthenticated
from rest_framework.parsers import MultiPartParser
import logging
from django_filters import rest_framework as filters
import os
from esimCloud import settings
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


class IsComponentOwner(BasePermission):

    def has_object_permission(self, request, view, obj):
        print("HOLA")
        if obj.component_library.library_set.default == True:
            return True
        if request.user.is_authenticated:
            if obj.component_library.library_set.user == request.user:
                return True
        return False


class LibraryComponentViewSet(viewsets.ReadOnlyModelViewSet):
    """
     Listing All Library Details
    """
    permission_classes = (IsComponentOwner,)
    queryset = LibraryComponent.objects.all()
    serializer_class = LibraryComponentSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = LibraryComponentFilterSet
    
    def get_queryset(self):
        if self.request.user.is_authenticated:
            library_set = LibrarySet.objects.filter(
                Q(user=self.request.user) | Q(default=True)
            )
            libraries = Library.objects.filter(library_set__in=library_set)
            components = LibraryComponent.objects.filter(component_library__in=libraries)
            return components
        else:
            library_set = LibrarySet.objects.filter(default=True)
            libraries = Library.objects.filter(library_set__in=library_set)
            components = LibraryComponent.objects.filter(component_library__in=libraries)
            return components


class LibrarySetViewSet(viewsets.ModelViewSet):
    """
    Listing Library Sets available to a user
    """
    serializer_class = LibrarySetSerializer
    parser_class = (MultiPartParser,)
    permission_classes = (IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.is_authenticated:
            queryset = LibrarySet.objects.filter(
                Q(user=self.request.user) | Q(default=True))
        else:
            queryset = LibrarySet.objects.filter(default=True)
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            library_set = LibrarySet.objects.get(user=request.user)
        except LibrarySet.DoesNotExist:
            library_set = LibrarySet(
                name=request.user.username,
                default=False,
                user=request.user
            )
            library_set.save()
        except LibrarySet.MultipleObjectsReturned:
            return Response(status=status.HTTP_409_CONFLICT)
        
        files = request.FILES.getlist('files')
        if len(files) != 0:
            path = os.path.join(
                settings.BASE_DIR,
                'kicad-symbols',
                library_set.user.username + '-' + library_set.name)
            try:
                save_libs(library_set, path, files) # defined in ./models.py
                return Response(status=status.HTTP_201_CREATED)
            except:
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response(status=status.HTTP_204_NO_CONTENT)

