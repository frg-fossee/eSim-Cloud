from saveAPI.serializers import StateSaveSerializer
from rest_framework.permissions import AllowAny
from rest_framework.parsers import FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError
from drf_yasg.utils import swagger_auto_schema
from django.shortcuts import get_object_or_404
from saveAPI.models import StateSave
import uuid
import logging

logger = logging.getLogger(__name__)


class StateSaveView(APIView):
    '''
    API to save the state of project to db which can be loaded or shared later
    THIS WILL ESCAPE DOUBLE QUOTES
    '''
    permission_classes = (AllowAny,)
    parser_classes = (FormParser,)

    @swagger_auto_schema(request_body=StateSaveSerializer)
    def post(self, request, *args, **kwargs):
        logger.info('Got POST for state save ')
        logger.info(request.data)
        serializer = StateSaveSerializer(
            data=request.data, context={'view': self})
        if serializer.is_valid():
            serializer.save()
            save_id = serializer.data['save_id']
            return Response({'status': 'ok', 'save': str(save_id)})

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StateFetchView(APIView):
    """
    Returns Saved data for given save id ,
    THIS WILL ESCAPE DOUBLE QUOTES

    """
    permission_classes = (AllowAny,)
    methods = ['GET']

    @swagger_auto_schema(responses={200: StateSaveSerializer()})
    def get(self, request, save_id):

        if isinstance(save_id, uuid.UUID):
            # Check for permissions and sharing settings here
            saved_state = get_object_or_404(
                StateSave, save_id=save_id)
            try:
                serialized = StateSaveSerializer(saved_state)
                return Response(serialized.data)
            except Exception:
                return Response(serialized.error)
        else:
            raise ValidationError('Invalid uuid format')
