from rest_framework import permissions
from publishAPI.serializers import CircuitTagSerializer, PublicationSerializer  # noqa
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, AllowAny, DjangoModelPermissions  # noqa
from rest_framework.parsers import JSONParser, MultiPartParser
from publishAPI.models import  CircuitTag, Publication
from publishAPI.serializers import CircuitTagSerializer, PublicationSerializer  # noqa
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, IsAuthenticated, AllowAny, \
    DjangoModelPermissions  # noqa
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from saveAPI.models import StateSave
import logging

logger = logging.getLogger(__name__)


class TagsViewSet(viewsets.ModelViewSet):
    """
     CRUD for Tags
    """
    permission_classes = (DjangoModelPermissionsOrAnonReadOnly,)
    queryset = CircuitTag.objects.all()
    serializer_class = CircuitTagSerializer

class PublicationViewSet(APIView):
    parser_classes = (FormParser,JSONParser)
    permission_classes = (IsAuthenticated,)
    serializer_class = PublicationSerializer
    def get(self,request,circuit_id):
        try:
            queryset = Publication.objects.get(publication_id=circuit_id)
        except:
            return Response({'error': 'No circuit there'}, status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = PublicationSerializer(queryset)
            return Response(serialized.data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def post(self,request,circuit_id):
        try:
            save_state = StateSave.objects.get(save_id=circuit_id)
        except:
            return Response({'Error':'No State found'},status=status.status.HTTP_404_NOT_FOUND)
        publication = Publication(title=save_state.name,author=save_state.owner,is_arduino=save_state.is_arduino)
        publication.save()
        save_state.publication = publication
        save_state.shared = True
        save_state.save()
        serialized = PublicationSerializer(publication)
        return Response(serialized.data)
# class PublishViewSet(viewsets.ModelViewSet):
#     """
#      Publishing CRUD Operations
#     """
#     permission_classes = (DjangoModelPermissions,)
#     queryset = Publish.objects.all()
#     serializer_class = PublishSerializer



class MyPublicationViewSet(viewsets.ModelViewSet):
    """
     List users circuits ( Permission Groups )
    """
    parser_classes = (FormParser, JSONParser)
    permission_classes = (IsAuthenticated,)
    serializer_class = PublicationSerializer
    queryset = Publication.objects.none()
    @swagger_auto_schema(response={200: PublicationSerializer})
    def list(self, request):
        try:
            queryset = Publication.objects.filter(author=self.request.user, is_arduino=False)
        except:
            return Response({'error': 'No circuit there'}, status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = PublicationSerializer(queryset, many=True)
            return Response(serialized.data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicPublicationViewSet(viewsets.ModelViewSet):
    """
     List published circuits
    """
    parser_classes = (FormParser, JSONParser)
    permission_classes = (IsAuthenticated,)
    serializer_class = PublicationSerializer
    queryset = Publication.objects.none()

    @swagger_auto_schema(response={200: PublicationSerializer})
    def list(self, request):
        try:
            queryset = Publication.objects.filter(is_arduino=False, state__public=True)
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = PublicationSerializer(queryset, many=True)
            return Response(serialized.data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
