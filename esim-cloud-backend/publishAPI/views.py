from publishAPI.serializers import CircuitTagSerializer, PublishSerializer, CircuitSerializer  # noqa
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, AllowAny, DjangoModelPermissions  # noqa
from rest_framework.parsers import JSONParser, MultiPartParser
from publishAPI.models import Publish, CircuitTag, Circuit
from publishAPI.serializers import CircuitTagSerializer, PublishSerializer, CircuitSerializer  # noqa
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, IsAuthenticated, AllowAny, \
    DjangoModelPermissions  # noqa
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)


class TagsViewSet(viewsets.ModelViewSet):
    """
     CRUD for Tags
    """
    permission_classes = (DjangoModelPermissionsOrAnonReadOnly,)
    queryset = CircuitTag.objects.all()
    serializer_class = CircuitTagSerializer


class PublishViewSet(viewsets.ModelViewSet):
    """
     Publishing CRUD Operations
    """
    permission_classes = (DjangoModelPermissions,)
    queryset = Publish.objects.all()
    serializer_class = PublishSerializer



class MyCircuitViewSet(viewsets.ModelViewSet):
    """
     List users circuits ( Permission Groups )
    """
    parser_classes = (FormParser, JSONParser)
    permission_classes = (IsAuthenticated,)
    serializer_class = CircuitSerializer

    @swagger_auto_schema(response={200: CircuitSerializer})
    def list(self, request):
        try:
            print(self.request.user)
            queryset = Circuit.objects.filter(author=self.request.user, is_arduino=False)
        except:
            return Response({'error': 'No circuit there'}, status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = CircuitSerializer(queryset, many=True)
            return Response(serialized.data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicCircuitViewSet(viewsets.ModelViewSet):
    """
     List published circuits
    """
    parser_classes = (FormParser, JSONParser)
    permission_classes = (IsAuthenticated,)
    serializer_class = CircuitSerializer

    @swagger_auto_schema(response={200: CircuitSerializer})
    def list(self, request):
        print("Public baazi")
        try:
            queryset = Circuit.objects.filter(is_arduino=False, state__public=True)
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = CircuitSerializer(queryset, many=True)
            return Response(serialized.data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
