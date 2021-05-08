import django_filters
from libAPI.serializers import LibrarySerializer, LibraryComponentSerializer, FavouriteComponentSerializer
from libAPI.models import Library, LibraryComponent, FavouriteComponent
from rest_framework import viewsets, status
from rest_framework.response import Response
import logging
from django_filters import rest_framework as filters
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from rest_framework.views import APIView
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
            return Response(response_serializer.data, status=status.HTTP_200_OK)
        except FavouriteComponent.DoesNotExist:
            return Response(data={}, status=status.HTTP_200_OK)

    @swagger_auto_schema(responses={200: FavouriteComponentSerializer}, request_body=FavouriteComponentSerializer)
    def post(self, request):
        newComponent = request.data.get("component")
        try:
            queryset = LibraryComponent.objects.get(id=newComponent[0])
        except LibraryComponent.DoesNotExist:
            return Response(data={"error": "Given Component does not Exist"}, status=status.HTTP_400_BAD_REQUEST)
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
    permission_classes=(IsAuthenticated,)
    @swagger_auto_schema(responses={200: FavouriteComponentSerializer})
    def delete(self,request,id):
        try:
            queryset=FavouriteComponent.objects.get(owner=self.request.user,component=id)
            queryset.component.remove(id)
            serialized=FavouriteComponentSerializer(instance=queryset,context={'request': request})
            return Response(data=serialized.data,status=status.HTTP_200_OK)
        except FavouriteComponent.DoesNotExist:
            return Response(data={"error":"given component id doesn't exist in your favourites"},status=status.HTTP_400_BAD_REQUEST)
