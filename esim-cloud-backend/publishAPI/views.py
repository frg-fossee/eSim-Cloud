from rest_framework import permissions
from publishAPI.serializers import CircuitTagSerializer, ProjectSerializer, \
    TransitionHistorySerializer, DCSweepSerializer, \
    TransientAnalysisSerializer, ACAnalysisSerializer, \
    TFAnalysisSerializer  # noqa
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, \
    AllowAny, DjangoModelPermissions  # noqa
from rest_framework.parsers import JSONParser, MultiPartParser
from workflowAPI.models import Permission
from publishAPI.models import ACAnalysisParameters, CircuitTag, \
    DCSweepParameters, Project, Field, TFAnalysisParameters, \
    TransientAnalysisParameters, TransitionHistory
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, \
    IsAuthenticated, AllowAny, \
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
    serializer_class = ProjectSerializer

    def get(self, request, circuit_id):
        try:
            queryset = Project.objects.get(project_id=circuit_id)
        except Project.DoesNotExist:
            return Response({'error': 'No circuit there'},
                            status=status.HTTP_404_NOT_FOUND)
        user_roles = self.request.user.groups.all()
        can_edit = False
        can_delete = False
        if queryset.state.public is False:
            if queryset.author == self.request.user and Permission.objects.filter(  # noqa
                    role__in=user_roles,
                    view_own_states=queryset.state).exists():
                pass
            elif queryset.author != self.request.user and Permission.objects.filter(  # noqa
                    role__in=user_roles,
                    view_other_states=queryset.state).exists():
                pass
            else:
                return Response(status=status.HTTP_401_UNAUTHORIZED)

            if queryset.author == self.request.user and Permission.objects.filter(  # noqa
                    role__in=user_roles,
                    edit_own_states=queryset.state).exists():
                can_edit = True
            else:
                can_edit = False
            if queryset.author == self.request.user and Permission.objects.filter(  # noqa
                    role__in=user_roles,
                    del_own_states=queryset.state).exists():
                can_delete = True
            else:
                can_delete = False
        try:
            histories = TransitionHistorySerializer(
                TransitionHistory.objects.filter(
                    project=queryset).order_by("transition_time"), many=True)
            serialized = ProjectSerializer(queryset)
            data = serialized.data.copy()
            data['history'] = histories.data
            data['can_edit'] = can_edit
            data['can_delete'] = can_delete
            return Response(data)
        except TransitionHistory.DoesNotExist:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def post(self, request, circuit_id):
        save_states = StateSave.objects.filter(save_id=circuit_id)
        try:
            active_state_save = save_states.get(
                branch=request.data[0]['active_branch'],
                version=request.data[0]['active_version'])
        except StateSave.DoesNotExist:
            return Response({'Save does not exist'},
                            status=status.HTTP_404_NOT_FOUND)
        user_roles = self.request.user.groups.all()
        if active_state_save.project is None:
            project = Project(title=request.data[0]['title'],
                              description=request.data[0]
                              ['description'], author=active_state_save.owner,
                              is_arduino=active_state_save.is_arduino,
                              active_branch=request.data[0]['active_branch'],
                              active_version=request.data[0]['active_version'],
                              )
            dc_sweep = DCSweepParameters(
                parameter=request.data[3]['parameter'],
                sweepType=request.data[3]['sweepType'],
                start=request.data[3]['start'],
                stop=request.data[3]['stop'],
                step=request.data[3]['step'],
                parameter2=request.data[3]['parameter2'],
                start2=request.data[3]['start2'],
                step2=request.data[3]['step2'],
                stop2=request.data[3]['stop2'],
                )
            transient_analysis = TransientAnalysisParameters(
                start=request.data[4]['start'],
                stop=request.data[4]['stop'],
                step=request.data[4]['step'],
                skipInitial=request.data[4]['skipInitial'],
            )
            ac_analysis = ACAnalysisParameters(
                input=request.data[5]['input'],
                stop=request.data[5]['stop'],
                start=request.data[5]['start'],
                pointsBydecade=request.data[5]['pointsBydecade'],
            )
            tf_analysis = TFAnalysisParameters(
                outputNodes=request.data[6]['outputNodes'],
                outputVoltageSource=request.data[6]['outputVoltageSource'],
                inputVoltageSource=request.data[6]['inputVoltageSource'],
            )
            dc_sweep.save()
            ac_analysis.save()
            tf_analysis.save()
            transient_analysis.save()
            project.dc_sweep = dc_sweep
            project.transient_analysis = transient_analysis
            project.ac_analysis = ac_analysis
            project.tf_analysis = tf_analysis
            project.save()
            for field in request.data[1]:
                field = Field(name=field['name'], text=field['text'])
                field.save()
                project.fields.add(field)
            project.save()
            can_edit = False
            can_delete = False
            for save_state in save_states:
                save_state.project = project
                save_state.shared = True
                save_state.save(update_fields=['project', 'shared', ])
            # ChangeStatus(self, request.data[2], active_state_save.project)
            if Permission.objects.filter(role__in=user_roles,
                                         edit_own_states=project.state).exists():  # noqa
                can_edit = True
            else:
                can_edit = False
            if Permission.objects.filter(role__in=user_roles,
                                         del_own_states=project.state).exists():  # noqa
                can_delete = True
            else:
                can_delete = False
            histories = TransitionHistorySerializer(
                TransitionHistory.objects.filter(project=project), many=True)
            serialized = ProjectSerializer(project)
            data = serialized.data.copy()
            data['save_id'] = active_state_save.save_id
            data['history'] = histories.data
            data['can_edit'] = can_edit
            data['can_delete'] = can_delete
            return Response(data)
        else:
            can_edit = False
            can_delete = False
            if Permission.objects.filter(role__in=user_roles,
                                         edit_own_states=active_state_save.project.state).exists():  # noqa
                pass
            else:
                return Response(status=status.HTTP_401_UNAUTHORIZED)
            active_state_save.project.title = request.data[0]['title']
            active_state_save.project.description = request.data[0][
                'description']
            active_state_save.project.active_branch = request.data[0][
                'active_branch']
            active_state_save.project.active_version = request.data[0][
                'active_version']
            dc_sweep = DCSweepParameters(
                parameter=request.data[3]['parameter'],
                sweepType=request.data[3]['sweepType'],
                start=request.data[3]['start'],
                stop=request.data[3]['stop'],
                step=request.data[3]['step'],
                parameter2=request.data[3]['parameter2'],
                start2=request.data[3]['start2'],
                step2=request.data[3]['step2'],
                stop2=request.data[3]['stop2'],
                )
            transient_analysis = TransientAnalysisParameters(
                start=request.data[4]['start'],
                stop=request.data[4]['stop'],
                step=request.data[4]['step'],
                skipInitial=request.data[4]['skipInitial'],
            )
            ac_analysis = ACAnalysisParameters(
                input=request.data[5]['input'],
                stop=request.data[5]['stop'],
                start=request.data[5]['start'],
                pointsBydecade=request.data[5]['pointsBydecade'],
            )
            tf_analysis = TFAnalysisParameters(
                outputNodes=request.data[6]['outputNodes'],
                outputVoltageSource=request.data[6]['outputVoltageSource'],
                inputVoltageSource=request.data[6]['inputVoltageSource'],
            )
            dc_sweep.save()
            ac_analysis.save()
            tf_analysis.save()
            transient_analysis.save()
            active_state_save.project.dc_sweep = dc_sweep
            active_state_save.project.transient_analysis = transient_analysis
            active_state_save.project.ac_analysis = ac_analysis
            active_state_save.project.tf_analysis = tf_analysis
            active_state_save.project.save()
            if request.data[2] != '':
                ChangeStatus(self, request.data[2], active_state_save.project)
            if Permission.objects.filter(role__in=user_roles,
                                         edit_own_states=active_state_save.project.state).exists():  # noqa
                can_edit = True
            else:
                can_edit = False
            if Permission.objects.filter(role__in=user_roles,
                                         del_own_states=active_state_save.project.state).exists():  # noqa
                can_delete = True
            else:
                can_delete = False
            active_state_save.project.fields.clear()
            for field in request.data[1]:
                field = Field(name=field['name'], text=field['text'])
                field.save()
                active_state_save.project.fields.add(field)
            active_state_save.project.save()
            histories = TransitionHistorySerializer(
                TransitionHistory.objects.filter(
                    project=active_state_save.project), many=True)
            serialized = ProjectSerializer(active_state_save.project)
            data = serialized.data.copy()
            data['save_id'] = active_state_save.save_id
            data['history'] = histories.data
            data['can_edit'] = can_edit
            data['can_delete'] = can_delete
            return Response(data)

    def delete(self, request, circuit_id):
        try:
            project = Project.objects.get(project_id=circuit_id)
        except Project.DoesNotExist:
            return Response({'error': 'No circuit there'},
                            status=status.HTTP_404_NOT_FOUND)
        if project.author == self.request.user and Permission.objects.filter(
                role__in=self.request.user.groups.all(),
                del_own_states=project.state).exists():
            project.delete()
            return Response({'done': True})
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)


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
        except Project.DoesNotExist:
            return Response({'error': 'No circuit there'},
                            status=status.HTTP_404_NOT_FOUND)
        serialized = ProjectSerializer(queryset, many=True)
        return Response(serialized.data)


class PublicProjectViewSet(viewsets.ModelViewSet):
    """
     List published circuits
    """
    parser_classes = (FormParser, JSONParser)
    serializer_class = ProjectSerializer
    queryset = Project.objects.none()

    @swagger_auto_schema(response={200: ProjectSerializer})
    def list(self, request):
        try:
            queryset = Project.objects.filter(
                is_arduino=False, state__public=True)
        except Project.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serialized = ProjectSerializer(queryset, many=True)
        return Response(serialized.data)
