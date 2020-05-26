from saveAPI.serializers import StateSaveSerializer
from rest_framework.permissions import AllowAny
from rest_framework.parsers import FormParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from saveAPI.models import StateSave
import uuid
import logging
from django.contrib.auth.models import AnonymousUser
logger = logging.getLogger(__name__)


class StateSaveView(APIView):
    '''
    API to save the state of project to db which can be loaded or shared later
    Note: this is different from SnapshotSave which stores images
    THIS WILL ESCAPE DOUBLE QUOTES
    '''

    # Permissions should be validated here
    permission_classes = (AllowAny,)
    parser_classes = (FormParser,)

    @swagger_auto_schema(request_body=StateSaveSerializer)
    def post(self, request, *args, **kwargs):
        logger.info('Got POST for state save ')
        logger.info(request.data)
        serializer = StateSaveSerializer(
            data=request.data, context={'request': self.request})
        if serializer.is_valid():

            # If unauthenticated save user as null
            if type(self.request.user) == AnonymousUser:
                serializer.save()
            else:
                # If authenticated set user field as request user
                serializer.save(owner=self.request.user)
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StateFetchView(APIView):
    """
    Returns Saved data for given save id ,
    Only user who saved the state can access it
    THIS WILL ESCAPE DOUBLE QUOTES

    """
    permission_classes = (AllowAny,)
    methods = ['GET']

    @swagger_auto_schema(responses={200: StateSaveSerializer})
    def get(self, request, save_id):

        if isinstance(save_id, uuid.UUID):
            # Check for permissions and sharing settings here
            try:
                saved_state = StateSave.objects.get(save_id=save_id)
            except StateSave.DoesNotExist:
                return Response({'error': 'Does not Exist'},
                                status=status.HTTP_404_NOT_FOUND)

            # Verifies owner
            if self.request.user != saved_state.owner and not saved_state.shared:  # noqa
                return Response({'error': 'not the owner and not shared'},
                                status=status.HTTP_401_UNAUTHORIZED)
            try:
                serialized = StateSaveSerializer(saved_state)
                return Response(serialized.data)
            except Exception:
                return Response(serialized.error)
        else:
            return Response({'error': 'Invalid sharing state'},
                            status=status.HTTP_400_BAD_REQUEST)


class StateShareView(APIView):
    """
    Enables sharing for the given saved state
    Note: Only authorized user can do this

    """
    permission_classes = (AllowAny,)
    methods = ['GET']

    @swagger_auto_schema(responses={200: StateSaveSerializer})
    def post(self, request, save_id, sharing):

        if isinstance(save_id, uuid.UUID):
            # Check for permissions and sharing settings here
            try:
                saved_state = StateSave.objects.get(save_id=save_id)
            except StateSave.DoesNotExist:
                return Response({'error': 'Does not Exist'},
                                status=status.HTTP_404_NOT_FOUND)

            # Verifies owner
            if self.request.user != saved_state.owner:  # noqa
                return Response({'error': 'Not the owner'},
                                status=status.HTTP_401_UNAUTHORIZED)
            try:
                if sharing == 'on':
                    saved_state.shared = True
                elif sharing == 'off':
                    saved_state.shared = False
                else:
                    return Response({'error': 'Invalid sharing state'},
                                    status=status.HTTP_400_BAD_REQUEST)
                saved_state.save()
                serialized = StateSaveSerializer(saved_state)
                return Response(serialized.data)
            except Exception:
                return Response(serialized.error)
        else:
            return Response({'error': 'Invalid sharing state'},
                            status=status.HTTP_400_BAD_REQUEST)
