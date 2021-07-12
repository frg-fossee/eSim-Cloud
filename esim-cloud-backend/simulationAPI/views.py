from simulationAPI.serializers import TaskSerializer, \
    simulationSerializer, simulationSaveSerializer
from simulationAPI.tasks import process_task
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import os
from rest_framework.exceptions import ValidationError
from celery.result import AsyncResult
from .models import simulation
from saveAPI.models import StateSave
import uuid
from django.conf import settings
import os
import logging
from .models import runtimeStat, Limit, simulation
from saveAPI.models import StateSave
import celery.signals
from celery import current_task
import time
import math

logger = logging.getLogger(__name__)


def saveNetlistDB(task_id, filepath, request):
    current_dir = settings.FILE_STORAGE_ROOT
    filepath = filepath.split('/')[-1]
    os.chdir(current_dir)
    f = open(filepath, "r")
    temp = f.read()
    if request.user.is_authenticated:
        owner = request.user.id
    else:
        owner = None
    if request.data.get('simulationType', None):
        simulation_type = request.data['simulationType']
    else:
        simulation_type = "NgSpiceSimulator"
    if request.data.get('save_id', None):
        if 'gallery' in request.data.get('save_id'):
            save_id = None
        else:
            save_id = request.data['save_id']
    else:
        save_id = None
    serialized = simulationSaveSerializer(
        data={"task": task_id, "netlist": temp, "owner": owner,
              "simulation_type": simulation_type, "schematic": save_id})
    if serialized.is_valid(raise_exception=True):
        serialized.save()
        return
    else:
        return Response(serialized.errors)


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

        limits = Limit.objects.all()
        TIME_LIMIT = 0
        if limits.exists():
            TIME_LIMIT = Limit.objects.all()[0].timeLimit
        # if timeLimit.objects.count() != 0:
        #     TIME_LIMIT = timeLimit.objects.all()[0]
        #     print('NOT NONE')
        # else:
        #     print('NONE')
        if serializer.is_valid():
            serializer.save()
            saveNetlistDB(
                serializer.data['task_id'], serializer.data['file'][0]['file'],
                request)
            task_id = serializer.data['task_id']
            if(TIME_LIMIT == 0):
                celery_task = process_task.apply_async(
                    kwargs={'task_id': str(task_id)}, task_id=str(task_id)
                )
            else:
                celery_task = process_task.apply_async(
                    kwargs={'task_id': str(task_id)}, task_id=str(task_id),
                    soft_time_limit=TIME_LIMIT)

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
            Output = simulation.objects.get(task__task_id=task_id)
            Output.result = celery_result.info
            Output.save()
            return Response(response_data)
        else:
            raise ValidationError('Invalid uuid format')


class SimulationResults(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, save_id, sim):
        if sim == None:
            sims = simulation.objects.filter(
                owner=self.request.user, schematic=save_id)
        else:
            sims = simulation.objects.filter(
                owner=self.request.user, schematic=save_id
            )
        serialized = simulationSerializer(sims, many=True)
        return Response(serialized.data, status=status.HTTP_200_OK)


class SimulationResultsFromSimulator(APIView):
    permission_classes = (IsAuthenticated, )

    def get(self, request, sim):
        sims = simulation.objects.filter(
            owner=self.request.user, simulation_type=sim)
        serialized = simulationSerializer(sims, many=True)
        return Response(serialized.data, status=status.HTTP_200_OK)


@celery.signals.task_prerun.connect
def statsd_task_prerun(task_id, **kwargs):
    current_task.start_time = time.time()


@celery.signals.task_postrun.connect
def statsd_task_postrun(task_id, **kwargs):
    runtime = time.time() - current_task.start_time
    runtime = math.ceil(runtime)
    statObj, created = runtimeStat.objects.get_or_create(exec_time=runtime)
    statObj.qty += 1
    statObj.save()
