from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from arduinoAPI.tasks import compile_sketch_task
import uuid
from celery.result import AsyncResult


class CompileSketchINO(APIView):
    def post(self, request):
        """
        Compile list of Arduino Sketch File

        body: {<Arduino ID>:<source code>}
        example: { "1":"void setup(){}void loop(){}"}
        """
        # Create Task ID (Used for getting Response)
        task_id = uuid.uuid4()
        # Queue Task
        task = compile_sketch_task.apply_async(
            kwargs={
                'data': request.data,
                'task_id': task_id,
                'langIndex': 0
            }, task_id=str(task_id))
        # Return Status
        return Response({
            'state': task.state,
            'uuid': str(task_id)
        })


class CompileSketchInlineAssembly(APIView):
    def post(self, request):
        """
        Compile list of Arduino C Inline assembly File

        body: {<Arduino ID>:<source code>}
        example: { "1":"#include <avr/io.h>#include <util/delay.h>"}
        """
        # Create Task ID (Used for getting Response)
        task_id = uuid.uuid4()
        # Queue Task
        task = compile_sketch_task.apply_async(
            kwargs={
                'data': request.data,
                'task_id': task_id,
                'langIndex': 1
            }, task_id=str(task_id))
        # Return Status
        return Response({
            'state': task.state,
            'uuid': str(task_id)
        })

class CompilationStatus(APIView):
    """
    Returns Compilation Status
    """

    def get(self, request):
        # GET task id from Query
        task_id = request.GET.get("task_id", -1)
        if task_id == -1:
            return Response({})

        # Get Celery Result
        celery_result = AsyncResult(str(task_id))
        # return Result with status
        response_data = {
            'state': celery_result.state,
            'details': celery_result.info
        }
        return Response(response_data)
