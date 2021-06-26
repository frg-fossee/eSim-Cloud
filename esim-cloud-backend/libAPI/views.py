from libAPI.lib_utils import handle_uploaded_libs
import django_filters
from django.db.models import Q
from django.contrib.auth import get_user_model
from libAPI.serializers import LibrarySerializer, \
    LibraryComponentSerializer, \
    LibrarySetSerializer, \
    FavouriteComponentSerializer
from libAPI.models import Library, \
    LibraryComponent, \
    LibrarySet, \
    FavouriteComponent
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import BasePermission,\
    IsAuthenticated,\
    SAFE_METHODS
from rest_framework.parsers import MultiPartParser
import logging
from django_filters import rest_framework as filters
from drf_yasg.utils import swagger_auto_schema
import os
from esimCloud import settings
from rest_framework.views import APIView
logger = logging.getLogger(__name__)


class IsLibraryOwner(BasePermission):

    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        if request.user.is_authenticated:
            if obj.library_set.user == request.user:
                return True
            elif request.user.is_superuser:
                return True
        return False


class LibraryFilterSet(django_filters.FilterSet):
    class Meta:
        model = Library
        fields = {
            'library_name': ['exact'],
        }


class LibraryViewSet(viewsets.ModelViewSet):
    """
     Listing All Library Details
    """
    serializer_class = LibrarySerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = LibraryFilterSet
    permission_classes = (IsLibraryOwner,)

    # All Libraries available for user (custom+default)
    def get_queryset(self):
        User = get_user_model()
        superusers = User.objects.filter(is_superuser=True)
        if self.request.user.is_authenticated:
            return Library.objects.filter(
                Q(library_set__user=self.request.user)
                | Q(library_set__user__in=superusers)
                | Q(library_set__default=True)
            ).order_by('-library_set__default')
        else:
            return Library.objects.filter(
                Q(library_set__default=True)
                | Q(library_set__user__in=superusers)
            )

    # Custom libraries uploaded by the user
    @action(
        detail=False,
        methods=['GET'],
        name='All custom libraries for user'
    )
    def get_custom_libraries(self, request):
        if request.user.is_authenticated:
            lib_sets = LibrarySet.objects.filter(
                Q(user=request.user) & Q(default=False))
            queryset = Library.objects.filter(library_set__in=lib_sets)
            return Response(LibrarySerializer(queryset, many=True).data)
        return Response()

    # Default Libraries
    @action(detail=False, methods=['GET'], name="All Default Libraries")
    def default(self, request):
        return Response(LibrarySerializer(
            Library.objects.filter(
                Q(library_set__default=True)), many=True).data
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
        if request.method in SAFE_METHODS:
            return True
        elif request.user.is_authenticated:
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
        User = get_user_model()
        superusers = User.objects.filter(is_superuser=True)
        if self.request.user.is_authenticated:
            library_set = LibrarySet.objects.filter(
                Q(user=self.request.user) |
                Q(default=True) | Q(user__in=superusers)
            )
            libraries = Library.objects.filter(library_set__in=library_set)
            components = LibraryComponent.objects.filter(
                component_library__in=libraries)
            return components
        else:
            library_set = LibrarySet.objects.filter(
                Q(default=True) | Q(user__in=superusers))
            libraries = Library.objects.filter(library_set__in=library_set)
            components = LibraryComponent.objects.filter(
                component_library__in=libraries)
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
                name=request.user.username[0:24],
                default=False,
                user=request.user
            )
            library_set.save()
        except LibrarySet.MultipleObjectsReturned:
            library_set = LibrarySet.objects.filter(user=request.user).first()

        files = request.FILES.getlist('files')
        if len(files) != 0:
            path = os.path.join(
                settings.BASE_DIR[6:],
                'kicad-symbols',
                library_set.user.username + '-' + library_set.name)
            try:
                # defined in ./lib_utils.py
                handle_uploaded_libs(library_set, path, files)
                return Response(status=status.HTTP_201_CREATED)
            except Exception:
                return Response(status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response(status=status.HTTP_204_NO_CONTENT)


class FavouriteComponentView(APIView):
    permission_classes = (IsAuthenticated,)
    serializer_class = FavouriteComponentSerializer

    @swagger_auto_schema(responses={200: FavouriteComponentSerializer})
    def get(self, request):
        try:
            queryset = FavouriteComponent.objects.get(
                owner=self.request.user)
            response_serializer = self.serializer_class(
                queryset, context={'request': request})
            return Response(response_serializer.data,
                            status=status.HTTP_200_OK)
        except FavouriteComponent.DoesNotExist:
            return Response(data={}, status=status.HTTP_200_OK)

    @swagger_auto_schema(responses={200: FavouriteComponentSerializer},
                         request_body=FavouriteComponentSerializer)
    def post(self, request):
        newComponent = request.data.get("component")
        try:
            queryset = LibraryComponent.objects.get(id=newComponent[0])
        except LibraryComponent.DoesNotExist:
            return Response(data={"error": "Given Component does not Exist"},
                            status=status.HTTP_400_BAD_REQUEST)
        try:
            existingFavourites = FavouriteComponent.objects.get(
                owner=self.request.user)
            for singleComponent in newComponent:
                existingFavourites.component.add(singleComponent)
            existingFavourites.save()
            serializer = FavouriteComponentSerializer(
                instance=existingFavourites, context={'request': request})
            return Response(data=serializer.data, status=status.HTTP_200_OK)
        except FavouriteComponent.DoesNotExist:
            newFavList = FavouriteComponent.objects.create(
                owner=self.request.user)
            for singleComponent in newComponent:
                newFavList.component.add(singleComponent)
            newFavList.save()
            serialized = FavouriteComponentSerializer(
                instance=newFavList, context={'request': request})
            return Response(data=serialized.data, status=status.HTTP_200_OK)


class DeleteFavouriteComponent(APIView):
    permission_classes = (IsAuthenticated,)

    @swagger_auto_schema(responses={200: FavouriteComponentSerializer})
    def delete(self, request, id):
        try:
            queryset = FavouriteComponent.objects.get(
                owner=self.request.user, component=id)
            queryset.component.remove(id)
            serialized = FavouriteComponentSerializer(
                instance=queryset, context={'request': request})
            return Response(data=serialized.data, status=status.HTTP_200_OK)
        except FavouriteComponent.DoesNotExist:
            return Response(
                data={
                    "error":
                    "Your favourites doesn't have this component"
                },
                status=status.HTTP_400_BAD_REQUEST)
