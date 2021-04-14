from rest_framework import permissions
from publishAPI.serializers import CircuitTagSerializer, CircuitSerializer  # noqa
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, AllowAny, DjangoModelPermissions  # noqa
from rest_framework.parsers import JSONParser, MultiPartParser
from publishAPI.models import  CircuitTag, Circuit
from publishAPI.serializers import CircuitTagSerializer, CircuitSerializer  # noqa
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

class CircuitViewSet(APIView):
    parser_classes = (FormParser,JSONParser)
    permission_classes = (IsAuthenticated,)
    serializer_class = CircuitSerializer
    def get(self,request,circuit_id):
        try:
            queryset = Circuit.objects.get(circuit_id=circuit_id)
        except:
            return Response({'error': 'No circuit there'}, status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = CircuitSerializer(queryset)
            return Response(serialized.data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def post(self,request,circuit_id):
        try:
            save_state = StateSave.objects.get(save_id=circuit_id)
        except:
            return Response({'Error':'No State found'},status=status.status.HTTP_404_NOT_FOUND)
        circuit = Circuit(title=save_state.name,author=save_state.owner,is_arduino=save_state.is_arduino)
        circuit.save()
        save_state.circuit = circuit
        save_state.shared = True
        save_state.save()
        serialized = CircuitSerializer(circuit)
        return Response(serialized.data)
# class PublishViewSet(viewsets.ModelViewSet):
#     """
#      Publishing CRUD Operations
#     """
#     permission_classes = (DjangoModelPermissions,)
#     queryset = Publish.objects.all()
#     serializer_class = PublishSerializer



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
        try:
            queryset = Circuit.objects.filter(is_arduino=False, state__public=True)
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = CircuitSerializer(queryset, many=True)
            return Response(serialized.data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
