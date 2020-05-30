from rest_framework import viewsets
from publishAPI.models import Publish, CircuitTag, Circuit
from publishAPI.serializers import CircuitTagSerializer, PublishSerializer, CircuitSerializer  # noqa
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, AllowAny, DjangoModelPermissions  # noqa
from rest_framework.parsers import JSONParser, MultiPartParser
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


class CircuitViewSet(viewsets.ModelViewSet):
    """
     CRUD  for viewing unpublished / published circuits ( Permission Groups )
    """
    parser_classes = (MultiPartParser, JSONParser)
    permission_classes = (DjangoModelPermissions,)
    queryset = Circuit.objects.all()
    serializer_class = CircuitSerializer


class PublicCircuitViewSet(viewsets.ReadOnlyModelViewSet):
    """
     Listing Published Circuits
    """
    permission_classes = (AllowAny,)
    queryset = Circuit.objects.filter(circuit__published=True)
    serializer_class = CircuitSerializer
