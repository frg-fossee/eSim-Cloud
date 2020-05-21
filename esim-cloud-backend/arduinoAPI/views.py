from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from arduinoAPI.tasks import compile_sketch_task
import uuid


class CompileSketch(APIView):
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
                'task_id': task_id
            }, task_id=str(task_id))
        # Return Status
        return Response({
            'state': task.state,
            'uuid': str(task_id)
        })
