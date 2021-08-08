# from django.core.files.base import File
import django_filters
from django_filters import rest_framework as filters
from .serializers import StateSaveSerializer, SaveListSerializer, \
    GallerySerializer
from .serializers import Base64ImageField
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import FormParser, JSONParser
from rest_framework.views import APIView
from rest_framework.response import Response
# from rest_framework.generics import ListAPIView
from rest_framework import status
from drf_yasg.utils import swagger_auto_schema
from .models import StateSave, Gallery
from workflowAPI.models import Permission
from publishAPI.models import Project
from ltiAPI.models import Submission
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
    permission_classes = (AllowAny,)
    # parser_classes = (FormParser,)

    @swagger_auto_schema(request_body=StateSaveSerializer)
    def post(self, request, *args, **kwargs):
        print("Getting Saved State")

        logger.info('Got POST for state save ')
        esim_libraries = None
        if request.data.get('esim_libraries'):
            esim_libraries = json.loads(request.data.get('esim_libraries'))
        try:
            queryset = StateSave.objects.get(
                save_id=request.data.get("save_id", None),
                branch=request.data.get("branch"),
                version=request.data.get("version"))
            serializer = StateSaveSerializer(data=request.data)
            if serializer.is_valid():
                img = Base64ImageField(max_length=None, use_url=True)
                filename, content = img.update(request.data['base64_image'])
                queryset.data_dump = request.data.get("data_dump")
                queryset.save()
                queryset.base64_image.save(filename, content)
                return Response(data=serializer.data,
                                status=status.HTTP_200_OK)
            else:
                return Response(data=serializer.errors,
                                status=status.HTTP_400_BAD_REQUEST)
        except StateSave.DoesNotExist:
            try:
                queryset = StateSave.objects.get(
                    save_id=request.data.get("save_id", None),
                    data_dump=request.data["data_dump"],
                    branch=request.data["branch"])
                serializer = StateSaveSerializer(data=request.data)
                if serializer.is_valid():
                    queryset.name = serializer.data["name"]
                    queryset.description = serializer.data["description"]
                    queryset.save()
                    response = serializer.data
                    response['duplicate'] = True
                    response['owner'] = queryset.owner.username
                    return Response(response)
                return Response(serializer.errors,
                                status=status.HTTP_400_BAD_REQUEST)
            except StateSave.DoesNotExist:
                img = Base64ImageField(max_length=None, use_url=True)
                filename, content = img.update(request.data['base64_image'])
                try:
                    project = Project.objects.get(
                        project_id=request.data.get('project_id', None))
                    state_save = StateSave(
                        data_dump=request.data.get('data_dump'),
                        description=request.data.get('description'),
                        name=request.data.get('name'),
                        owner=request.user if request.user.is_authenticated else None,  # noqa
                        branch=request.data.get('branch'),
                        version=request.data.get('version'),
                        project=project,
                        shared=True,
                        is_arduino=True if esim_libraries is None else False,
                    )
                except:  # noqa
                    state_save = StateSave(
                        data_dump=request.data.get('data_dump'),
                        description=request.data.get('description'),
                        name=request.data.get('name'),
                        owner=request.user if request.user.is_authenticated else None,  # noqa
                        branch=request.data.get('branch'),
                        version=request.data.get('version'),
                        is_arduino=True if esim_libraries is None else False,
                    )
                if request.data.get('save_id'):
                    state_save.save_id = request.data.get('save_id')
                state_save.base64_image.save(filename, content)
                if esim_libraries:
                    state_save.esim_libraries.set(esim_libraries)
                try:
                    state_save.save()
                    return Response(StateSaveSerializer(state_save).data)
                except Exception:
                    return Response(status=status.HTTP_400_BAD_REQUEST)


class CopyStateView(APIView):
    permission_classes = (IsAuthenticated,)
    parser_classes = (FormParser, JSONParser)

    def post(self, request, save_id, version, branch):
        if isinstance(save_id, uuid.UUID):
            # Check for permissions and sharing settings here
            try:
                saved_state = StateSave.objects.get(
                    save_id=save_id, branch=branch, version=version)
            except StateSave.DoesNotExist:
                return Response({'error': 'Does not Exist'},
                                status=status.HTTP_404_NOT_FOUND)
            copy_state = StateSave(name=saved_state.name,
                                   description=saved_state.description,
                                   data_dump=saved_state.data_dump,
                                   base64_image=saved_state.base64_image,
                                   is_arduino=saved_state.is_arduino,
                                   owner=self.request.user, branch='master',
                                   version=version)
            copy_state.save()
            copy_state.esim_libraries.set(saved_state.esim_libraries.all())
            copy_state.save()
            return Response(
                {"save_id": copy_state.save_id, "version": copy_state.version,
                 "branch": copy_state.branch})


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
    def get(self, request, save_id, version, branch):

        if isinstance(save_id, uuid.UUID):
            # Check for permissions and sharing settings here
            try:
                saved_state = StateSave.objects.get(
                    save_id=save_id, version=version, branch=branch)
            except StateSave.DoesNotExist:
                return Response({'error': 'Does not Exist'},
                                status=status.HTTP_404_NOT_FOUND)
            # Verifies owner
            if self.request.user != saved_state.owner and not saved_state.shared:  # noqa
                print("Here")
                return Response({'error': 'not the owner and not shared'},
                                status=status.HTTP_401_UNAUTHORIZED)
            try:
                serialized = StateSaveSerializer(
                    saved_state, context={'request': request})
                User = get_user_model()
                try:
                    owner_name = User.objects.get(
                        id=serialized.data.get('owner'))
                    data = {}
                    data.update(serialized.data)
                    data['owner'] = owner_name.username
                except User.DoesNotExist:
                    data = {}
                    data.update(serialized.data)
                    data['owner'] = None
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
    def delete(self, request, save_id, version, branch):
        if isinstance(save_id, uuid.UUID):
            try:
                saved_state = StateSave.objects.get(
                    save_id=save_id, version=version, branch=branch,
                    owner=self.request.user)
            except StateSave.DoesNotExist:
                return Response({'error': 'Does not Exist'},
                                status=status.HTTP_404_NOT_FOUND)
            # Verifies owner
            if (saved_state.project is None) or \
                    (saved_state.project is not None and
                     (saved_state.project.active_branch != branch or
                      saved_state.project.active_version != version)) or \
                    (saved_state.project is not None and
                     Permission.objects.filter(
                         role__in=self.request.user.groups.all(),
                         del_own_states=saved_state.project.state).exists()):
                pass
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            saved_state.delete()
            return Response({'done': True})
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
    def post(self, request, save_id, sharing, version, branch):

        if isinstance(save_id, uuid.UUID):
            # Check for permissions and sharing settings here
            try:
                saved_state = StateSave.objects.get(
                    save_id=save_id, version=version, branch=branch)
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
            owner=self.request.user, is_arduino=False).order_by(
            "save_id", "-save_time").distinct("save_id")
        submissions = Submission.objects.filter(student=self.request.user)
        for submission in submissions:
            saved_state = saved_state.exclude(save_id=submission.schematic.save_id)  # noqa
        try:
            serialized = StateSaveSerializer(saved_state, many=True)
            return Response(serialized.data)
        except Exception:
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


class StateSaveAllVersions(APIView):
    serializer_class = SaveListSerializer
    permission_classes = (IsAuthenticated,)

    @swagger_auto_schema(responses={200: SaveListSerializer})
    def get(self, request, save_id):
        queryset = StateSave.objects.filter(
            owner=self.request.user, save_id=save_id)
        try:
            serialized = SaveListSerializer(
                queryset, many=True, context={'request': request})
            return Response(serialized.data)
        except Exception:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GetStateSpecificVersion(APIView):
    serializer_class = StateSaveSerializer
    permission_classes = (IsAuthenticated,)

    @swagger_auto_schema(responses={200: StateSaveSerializer})
    def get(self, request, save_id, version, branch):
        queryset = StateSave.objects.get(
            save_id=save_id, version=version, owner=self.request.user,
            branch=branch)
        try:
            serialized = StateSaveSerializer(
                queryset)
            return Response(serialized.data)
        except Exception:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, save_id, version, branch):
        try:
            queryset = StateSave.objects.get(
                save_id=save_id, version=version, owner=self.request.user,
                branch=branch)
            queryset.delete()
            return Response(data=None, status=status.HTTP_204_NO_CONTENT)
        except StateSave.DoesNotExist:
            return Response({"error": "Circuit not found"},
                            status=status.HTTP_404_NOT_FOUND)


class DeleteBranch(APIView):
    permission_classes = (IsAuthenticated,)

    def delete(self, request, save_id, branch):
        try:
            queryset = StateSave.objects.filter(
                save_id=save_id,
                branch=branch,
                owner=self.request.user
            )
            if queryset[0].project is None or \
                    queryset[0].project.active_branch != branch:
                queryset.delete()
                return Response(data=None, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response(data=None, status=status.HTTP_400_BAD_REQUEST)
        except StateSave.DoesNotExist:
            return Response({"error": "circuit not found"},
                            status=status.HTTP_404_NOT_FOUND)


class DeleteCircuit(APIView):

    permission_classes = (IsAuthenticated,)

    def delete(self, request, save_id):
        try:
            queryset = StateSave.objects.filter(
                save_id=save_id,
                owner=self.request.user
            )
            if queryset[0].project is None:
                queryset.delete()
                return Response(data=None, status=status.HTTP_204_NO_CONTENT)
            else:
                return Response(data=None, status=status.HTTP_400_BAD_REQUEST)
        except StateSave.DoesNotExist:
            return Response({"error": "circuit not found"},
                            status=status.HTTP_404_NOT_FOUND)


class GalleryView(APIView):
    """
    Esim Gallery

    """
    permission_classes = (AllowAny,)
    parser_classes = (FormParser, JSONParser)
    methods = ['GET']

    @swagger_auto_schema(responses={200: GallerySerializer})
    def get(self, request):

        galleryset = Gallery.objects.all()
        try:
            serialized = GallerySerializer(galleryset, many=True)
            return Response(serialized.data)
        except Exception:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GalleryFetchSaveDeleteView(APIView):

    """
    Returns Saved data for given save id,
    Only staff can add / delete it
    THIS WILL ESCAPE DOUBLE QUOTES

    """
    # permission_classes = (AllowAny,)
    parser_classes = (FormParser, JSONParser)
    methods = ['GET']

    @swagger_auto_schema(responses={200: GallerySerializer})
    def get(self, request, save_id):

        try:
            saved_state = Gallery.objects.get(
                save_id=save_id)
        except Gallery.DoesNotExist:
            return Response({'error': 'Does not Exist'},
                            status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = GallerySerializer(
                saved_state, context={'request': request})
            data = {}
            data.update(serialized.data)
            return Response(data)
        except Exception:
            traceback.print_exc()
            return Response({'error': 'Not Able To Serialize'},
                            status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(responses={200: GallerySerializer})
    def post(self, request, save_id):

        # Checking user roles
        userRoles = self.request.user.groups.all()
        staff = False
        for userRole in userRoles:
            if (self.request.user and self.request.user.is_authenticated and
                    userRole.customgroup and
                    userRole.customgroup.is_type_staff):
                staff = True
        if not staff:
            return Response({'error': 'Not the owner'},
                            status=status.HTTP_401_UNAUTHORIZED)
        saved_state = Gallery()
        if not (request.data['data_dump'] and request.data['media'] and
                request.data['save_id']):
            return Response({'error': 'not a valid POST request'},
                            status=status.HTTP_406_NOT_ACCEPTABLE)

        # saves to gallery
        try:
            if 'save_id' in request.data:
                saved_state.save_id = request.data['save_id']
            if 'is_arduino' in request.data:
                saved_state.is_arduino = request.data['is_arduino']
            if 'data_dump' in request.data:
                saved_state.data_dump = request.data['data_dump']
            if 'shared' in request.data:
                saved_state.shared = bool(request.data['shared'])
            if 'name' in request.data:
                saved_state.name = request.data['name']
            if 'description' in request.data:
                saved_state.description = request.data['description']
            if 'media' in request.data:
                img = Base64ImageField(max_length=None, use_url=True)
                filename, content = img.update(
                    request.data['media'])
                saved_state.media.save(filename, content)
            if 'esim_libraries' in request.data:
                esim_libraries = json.loads(
                    request.data.get('esim_libraries'))
                saved_state.esim_libraries.set(esim_libraries)
            saved_state.save()
            serialized = GallerySerializer(saved_state)
            return Response(serialized.data)
        except Exception:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @swagger_auto_schema(responses={200: GallerySerializer})
    def delete(self, request, save_id):
        try:
            # Checking user roles
            userRoles = self.request.user.groups.all()
            staff = False
            for userRole in userRoles:
                if (self.request.user and self.request.user.is_authenticated
                    and userRole.customgroup and
                        userRole.customgroup.is_type_staff):
                    staff = True
            if not staff:
                return Response({'error': 'Not the owner'},
                                status=status.HTTP_401_UNAUTHORIZED)
            # Deltes from gallery
            try:
                saved_state = Gallery.objects.get(
                    save_id=save_id)
            except Gallery.DoesNotExist:
                return Response({'error': 'Does not Exist'},
                                status=status.HTTP_404_NOT_FOUND)
            saved_state.delete()
            return Response({'done': True})
        except Exception:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
