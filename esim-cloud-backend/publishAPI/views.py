from rest_framework import viewsets
from publishAPI.models import Publish, CircuitTag, Circuit
from publishAPI.serializers import CircuitTagSerializer
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly
import logging
logger = logging.getLogger(__name__)


class TagsViewSet(viewsets.ModelViewSet):
    """
     Listing All Library Details
    """
    permission_classes = (DjangoModelPermissionsOrAnonReadOnly,)
    queryset = CircuitTag.objects.all()
    serializer_class = CircuitTagSerializer
