from simulationAPI.serializers import TaskSerializer
from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.parsers import JSONParser,MultiPartParser, FormParser
from simulationAPI.models import Task
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import logging

logger = logging.getLogger(__name__)


class NetlistUploader(APIView):
    '''
    Rest API for NetlistUpload
    '''
    permission_classes = (AllowAny,)
    parser_classes = (MultiPartParser, FormParser,)

    def post(self, request, *args, **kwargs):
        logger.info('Got POST for netlist upload: ')
        logger.info(request.data)
        serializer = TaskSerializer(data=request.data, context={'view': self})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
