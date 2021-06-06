from rest_framework import permissions
from publishAPI.serializers import CircuitTagSerializer, ProjectSerializer, TransitionHistorySerializer  # noqa
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, AllowAny, DjangoModelPermissions  # noqa
from rest_framework.parsers import JSONParser, MultiPartParser
from workflowAPI.models import Permission
from publishAPI.models import CircuitTag, Project, Field, TransitionHistory
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, IsAuthenticated, AllowAny, \
    DjangoModelPermissions  # noqa
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from saveAPI.models import StateSave
from workflowAPI.utils import ChangeStatus
import logging

logger = logging.getLogger(__name__)


class TagsViewSet(viewsets.ModelViewSet):
    """
     CRUD for Tags
    """
    permission_classes = (DjangoModelPermissionsOrAnonReadOnly,)
    queryset = CircuitTag.objects.all()
    serializer_class = CircuitTagSerializer


class ProjectViewSet(APIView):
    parser_classes = (FormParser, JSONParser)
    permission_classes = (IsAuthenticated,)
    serializer_class = ProjectSerializer

    def get(self, request, circuit_id):
        try:
            queryset = Project.objects.get(project_id=circuit_id)
        except Project.DoesNotExist:
            return Response({'error': 'No circuit there'}, status=status.HTTP_404_NOT_FOUND)
        user_roles = self.request.user.groups.all()
        if queryset.author == self.request.user and Permission.objects.filter(role__in=user_roles, view_own_states=queryset.state).exists():
            pass
        elif queryset.author != self.request.user and Permission.objects.filter(role__in=user_roles, view_other_states=queryset.state).exists():
            pass
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        can_edit = False
        if queryset.author == self.request.user and Permission.objects.filter(role__in=user_roles, edit_own_states=queryset.state).exists():
            can_edit = True
        else:
            can_edit = False
        try:
            histories = TransitionHistorySerializer(TransitionHistory.objects.filter(
                project=queryset).order_by("transition_time"), many=True)
            serialized = ProjectSerializer(queryset)
            data = serialized.data.copy()
            data['history'] = histories.data
            data['can_edit'] = can_edit
            return Response(data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, circuit_id):
        try:
            save_state = StateSave.objects.get(save_id=circuit_id)
        except:
            return Response({'Error': 'No State found'}, status=status.HTTP_404_NOT_FOUND)
        user_roles = self.request.user.groups.all()
        if save_state.project is None:
            project = Project(title=request.data[0]['title'], description=request.data[0]
                              ['description'], author=save_state.owner, is_arduino=save_state.is_arduino)
            project.save()
            for field in request.data[1]:
                field = Field(name=field['name'], text=field['text'])
                field.save()
                project.fields.add(field)
            project.save()
            can_edit = False
            
            save_state.project = project
            save_state.shared = True
            save_state.save()
            ChangeStatus(self, request.data[2], save_state.project)
            if Permission.objects.filter(role__in=user_roles, edit_own_states=project.state).exists():
                can_edit = True
            else:
                can_edit = False
            histories = TransitionHistorySerializer(
                TransitionHistory.objects.filter(project=project), many=True)
            serialized = ProjectSerializer(project)
            data = serialized.data.copy()
            data['history'] = histories.data
            data['can_edit'] = can_edit
            return Response(data)
        else:
            can_edit = False
            flag = False
            if Permission.objects.filter(role__in=user_roles, edit_own_states=save_state.project.state).exists():
                try:
                    flag = True
                except:
                    flag = False
            else:
                if flag is False:
                    return Response(status=status.HTTP_401_UNAUTHORIZED)
            save_state.project.title = request.data[0]['title']
            save_state.project.description = request.data[0]['description']
            save_state.project.save()
            ChangeStatus(self, request.data[2], save_state.project)
            if Permission.objects.filter(role__in=user_roles, edit_own_states=save_state.project.state).exists():
                can_edit = True
            else:
                can_edit = False
            save_state.project.fields.clear()
            for field in request.data[1]:
                field = Field(name=field['name'], text=field['text'])
                field.save()
                save_state.project.fields.add(field)
            save_state.project.save()
            histories = TransitionHistorySerializer(
                TransitionHistory.objects.filter(project=save_state.project), many=True)
            serialized = ProjectSerializer(save_state.project)
            data = serialized.data.copy()
            data['history'] = histories.data
            data['can_edit'] = can_edit
            return Response(data)
# class PublishViewSet(viewsets.ModelViewSet):
#     """
#      Publishing CRUD Operations
#     """
#     permission_classes = (DjangoModelPermissions,)
#     queryset = Publish.objects.all()
#     serializer_class = PublishSerializer


class MyProjectViewSet(viewsets.ModelViewSet):
    """
     List users circuits ( Permission Groups )
    """
    parser_classes = (FormParser, JSONParser)
    permission_classes = (IsAuthenticated,)
    serializer_class = ProjectSerializer
    queryset = Project.objects.none()

    @swagger_auto_schema(response={200: ProjectSerializer})
    def list(self, request):
        try:
            queryset = Project.objects.filter(
                author=self.request.user, is_arduino=False)
        except:
            return Response({'error': 'No circuit there'}, status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = ProjectSerializer(queryset, many=True)
            return Response(serialized.data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicProjectViewSet(viewsets.ModelViewSet):
    """
     List published circuits
    """
    parser_classes = (FormParser, JSONParser)
    permission_classes = (IsAuthenticated,)
    serializer_class = ProjectSerializer
    queryset = Project.objects.none()

    @swagger_auto_schema(response={200: ProjectSerializer})
    def list(self, request):
        try:
            queryset = Project.objects.filter(
                is_arduino=False, state__public=True)
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = ProjectSerializer(queryset, many=True)
            return Response(serialized.data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
