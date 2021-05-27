import django_filters
from django_filters import rest_framework as filters
from saveAPI.serializers import StateSaveSerializer, SaveListSerializer
from saveAPI.serializers import Base64ImageField
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, JSONParser
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from saveAPI.models import StateSave
from rest_framework import viewsets
import uuid
from django.contrib.auth import get_user_model
import logging
import traceback
import json
logger = logging.getLogger(__name__)


class StateSaveView(APIView):
    '''
    API to save the state of project to db which can be loaded or shared later
    Note: this is different from SnapshotSave which stores images
    THIS WILL ESCAPE DOUBLE QUOTES
    '''

    # Permissions should be validated here
    permission_classes = (IsAuthenticated,)
    # parser_classes = (FormParser,)

    @swagger_auto_schema(request_body=StateSaveSerializer)
    def post(self, request, *args, **kwargs):
        logger.info('Got POST for state save ')
        esim_libraries = json.loads(request.data.get('esim_libraries'))
        img = Base64ImageField(max_length=None, use_url=True)
        filename, content = img.update(request.data['base64_image'])
        state_save = StateSave(
            data_dump=request.data.get('data_dump'),
            description=request.data.get('descirption'),
            name=request.data.get('name'),
            owner=request.user
        )
        state_save.base64_image.save(filename, content)
        print(state_save)
        state_save.esim_libraries.set(esim_libraries)
        try:
            state_save.save()
            return Response(StateSaveSerializer(state_save).data)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class StateFetchUpdateView(APIView):
    """
    Returns Saved data for given save id ,
    Only user who saved the state can access / update it
    THIS WILL ESCAPE DOUBLE QUOTES

    """
    permission_classes = (AllowAny,)
    parser_classes = (FormParser, JSONParser)
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
                serialized = StateSaveSerializer(
                    saved_state, context={'request': request})
                User = get_user_model()
                owner_name = User.objects.get(
                    id=serialized.data.get('owner'))
                data = {}
                data.update(serialized.data)
                data['owner'] = owner_name.username
                return Response(data)
            except Exception:
                traceback.print_exc()
                return Response({'error': 'Not Able To Serialize'},
                                status=status.HTTP_400_BAD_REQUEST)
        else:
            return Response({'error': 'Invalid sharing state'},
                            status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(responses={200: StateSaveSerializer})
    def post(self, request, save_id):
        if isinstance(save_id, uuid.UUID):
            # Check for permissions and sharing settings here
            try:
                saved_state = StateSave.objects.get(save_id=save_id)
            except StateSave.DoesNotExist:
                return Response({'error': 'Does not Exist'},
                                status=status.HTTP_404_NOT_FOUND)

            # Verifies owner
            if self.request.user != saved_state.owner:  # noqa
                return Response({'error': 'not the owner and not shared'},
                                status=status.HTTP_401_UNAUTHORIZED)

            if not request.data['data_dump'] and not request.data['shared']:
                return Response({'error': 'not a valid PUT request'},
                                status=status.HTTP_406_NOT_ACCEPTABLE)

            try:
                # if data dump, shared,name and description needs to be updated
                if 'data_dump' in request.data:
                    saved_state.data_dump = request.data['data_dump']
                if 'shared' in request.data:
                    saved_state.shared = bool(request.data['shared'])
                if 'name' in request.data:
                    saved_state.name = request.data['name']
                if 'description' in request.data:
                    saved_state.description = request.data['description']
                # if thumbnail needs to be updated
                if 'base64_image' in request.data:
                    img = Base64ImageField(max_length=None, use_url=True)
                    filename, content = img.update(
                        request.data['base64_image'])
                    saved_state.base64_image.save(filename, content)
                if 'esim_libraries' in request.data:
                    esim_libraries = json.loads(
                        request.data.get('esim_libraries'))
                    saved_state.esim_libraries.set(esim_libraries)
                saved_state.save()
                serialized = SaveListSerializer(saved_state)
                return Response(serialized.data)
            except Exception:
                return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            return Response({'error': 'Invalid sharing state'},
                            status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(responses={200: StateSaveSerializer})
    def delete(self, request, save_id):
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
                saved_state.delete()
                return Response({'done': True})
            except Exception:
                return Response({'done': False})
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


class UserSavesView(APIView):
    """
    Returns Saved data for given username,
    Only user who saved the state can access it
    THIS WILL ESCAPE DOUBLE QUOTES

    """
    permission_classes = (IsAuthenticated,)
    parser_classes = (FormParser, JSONParser)
    methods = ['GET']

    @swagger_auto_schema(responses={200: StateSaveSerializer})
    def get(self, request):
        saved_state = StateSave.objects.filter(
            owner=self.request.user, is_arduino=False).order_by('-save_time')
        # try:
        serialized = StateSaveSerializer(saved_state, many=True)
        return Response(serialized.data)
        # except Exception:
        return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ArduinoSaveList(APIView):
    """
    List of Arduino Projects
    """
    permission_classes = (IsAuthenticated,)
    parser_classes = (FormParser, JSONParser)
    methods = ['GET']

    @swagger_auto_schema(responses={200: StateSaveSerializer})
    def get(self, request):
        saved_state = StateSave.objects.filter(
            owner=self.request.user, is_arduino=True).order_by('-save_time')
        try:
            serialized = SaveListSerializer(
                saved_state, many=True, context={'request': request})
            return Response(serialized.data)
        except Exception:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SaveSearchFilterSet(django_filters.FilterSet):
    class Meta:
        model = StateSave
        fields = {
            'name': ['icontains'],
            'description': ['icontains'],
            'save_time': ['icontains'],
            'create_time': ['icontains'],
            'is_arduino': ['exact']
        }


class SaveSearchViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Search Project
    """
    def get_queryset(self):
        queryset = StateSave.objects.filter(
            owner=self.request.user).order_by('-save_time')
        return queryset
    serializer_class = SaveListSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = SaveSearchFilterSet
