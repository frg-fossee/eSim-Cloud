from simulationAPI.serializers import TaskSerializer
from simulationAPI.tasks import process_task
from rest_framework.permissions import AllowAny
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from celery.result import AsyncResult
import uuid
import logging

logger = logging.getLogger(__name__)


class NetlistUploader(APIView):
    '''
    API for NetlistUpload

    Requires a multipart/form-data  POST Request with netlist file in the
    'file' parameter
    '''
    permission_classes = (AllowAny,)
    parser_classes = (MultiPartParser, FormParser,)

    def post(self, request, *args, **kwargs):
        logger.info('Got POST for netlist upload: ')
        logger.info(request.data)
        serializer = TaskSerializer(data=request.data, context={'view': self})
        if serializer.is_valid():
            serializer.save()
            task_id = serializer.data['task_id']
            celery_task = process_task.apply_async(
                kwargs={'task_id': str(task_id)}, task_id=str(task_id))
            response_data = {
                'state': celery_task.state,
                'details': serializer.data,
            }
            return Response(response_data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CeleryResultView(APIView):
    """

    Returns Simulation results for 'task_id' provided after
    uploading the netlist
    /api/task/<uuid>

    """
    permission_classes = (AllowAny,)
    methods = ['GET']

    def get(self, request, task_id):

        if isinstance(task_id, uuid.UUID):
            celery_result = AsyncResult(str(task_id))
            response_data = {
                'state': celery_result.state,
                'details': celery_result.info
            }
            return Response(response_data)
        else:
            raise ValidationError('Invalid uuid format')


# class GraphView(APIView):
#     permission_classes = (IsAuthenticated,)
#
#     def post(self, request, task_id):
#         print("self.request.user:", self.request.user)
#         serializer = CsvFileSerializer(data={"file": request.FILES["output"], "task": task_id})
#         if serializer.is_valid():
#             serializer.save()
#             return Response(data=serializer.data, status=status.HTTP_200_OK)
#         return Response(data=serializer.errors, status=status.HTTP_400_BAD_REQUEST)
