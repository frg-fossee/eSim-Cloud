from os import confstr
import uuid
from rest_framework.views import APIView
from .serializers import StatusSerializer, ReportApprovalSerializer, \
    StatusWithNotesSerializer, \
    UserRoleRetreieveSerializer
from .models import Permission, State, Transition, Permission
from publishAPI.models import Project, Report, TransitionHistory
from publishAPI.serializers import ProjectSerializer, ReportSerializer, \
    ReportDescriptionSerializer
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status as http_status
from rest_framework.parsers import FormParser, JSONParser


class RetriveUserRoleView(APIView):
    """
    Request to retrive roles
    """
    parser_classes = (FormParser, JSONParser)
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(responses={200: UserRoleRetreieveSerializer})
    def get(self, request):
        userRoles = self.request.user.groups.all()
        data = []
        reviewer = False
        e_sim_reviewer = False
        arduino_reviewer = False
        staff = False
        e_sim_staff = False
        arduino_staff = False
        for userRole in userRoles:
            data.append(userRole.name)
            if userRole.customgroup is not None and userRole.customgroup.is_type_reviewer:  # noqa
                reviewer = True
                if userRole.customgroup.is_arduino is True:
                    arduino_reviewer = True
                else:
                    e_sim_reviewer = True
            if userRole.customgroup is not None and userRole.customgroup.is_type_staff:  # noqa
                staff = True
                if userRole.customgroup.is_arduino is True:
                    arduino_staff = True
                else:
                    e_sim_staff = True

        serializer = UserRoleRetreieveSerializer(
            data={"group": data, "is_type_reviewer": reviewer,
                  "e_sim_reviewer": e_sim_reviewer,
                  "arduino_reviewer": arduino_reviewer,
                  "is_type_staff": staff,
                  "is_arduino_staff": arduino_staff,
                  "is_esim_staff": e_sim_staff})
        try:
            serializer.is_valid()
            return Response(serializer.data)
        except:  # noqa
            serializer.is_valid()
            return Response(serializer.errors)


class RetriveProjectsViewSet(APIView):
    """
    Retrive circuits for futher evaluation
    """
    parser_classes = (FormParser, JSONParser)
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(responses={200: ProjectSerializer})
    def get(self, request):
        try:
            groups = self.request.user.groups.filter(customgroup__is_type_reviewer=True)  # noqa
        except:  # noqa
            return Response({'error': 'You are not authorized!'},
                            status=http_status.HTTP_401_UNAUTHORIZED)
        transitions = Transition.objects.filter(
            role__in=groups, only_for_creator=False).distinct().exclude(from_state__public=True,  # noqa
                                                                        from_state__report=False)  # noqa
        projects = Project.objects.none()
        for transition in transitions:
            if transition.from_state.public is False or transition.from_state.report is True:  # noqa
                roles_set = set(transition.role.all())
                user_roles_set = set(groups)
                if user_roles_set.intersection(roles_set):
                    intersection = user_roles_set.intersection(roles_set)
                    for user_role in intersection:
                        if user_role.customgroup.is_arduino is False:
                            project = Project.objects.filter(
                                state=transition.from_state, is_arduino=False).exclude(  # noqa
                                author=self.request.user)
                            projects = projects | project
                        else:
                            project = Project.objects.filter(
                                state=transition.from_state, is_arduino=True).exclude(  # noqa
                                author=self.request.user)
                            projects = projects | project
        if projects == Project.objects.none():
            return Response(status=http_status.HTTP_404_NOT_FOUND)
        else:
            serialized = ProjectSerializer(projects, many=True)
            return Response(serialized.data)


class ProjectStateView(APIView):
    """
    Requests to set and get possible to_states states
    """
    parser_classes = (FormParser, JSONParser)
    serializer_class = StatusSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, project_id):
        if isinstance(project_id, uuid.UUID):
            try:
                project = Project.objects.get(
                    project_id=project_id)
            except Project.DoesNotExist:
                return Response({'error': 'Project does not Exist'},
                                status=http_status.HTTP_404_NOT_FOUND)
            circuit_transition = Transition.objects.filter(
                from_state=project.state,
                role__in=self.request.user.groups.all()).distinct()
            states = []
            for transition in circuit_transition:
                if transition.from_state.public is False or transition.from_state.report is True:  # noqa
                    if transition.only_for_creator is True and self.request.user is project.author:  # noqa
                        states.append(transition.to_state.name)
                    else:
                        if transition.restricted_for_creator is True and project.author == request.user:  # noqa
                            pass
                        else:
                            states.append(transition.to_state.name)
            states = list(set(states))
            if states == []:
                return Response(status=http_status.HTTP_200_OK)
            else:
                return Response(states, status=http_status.HTTP_200_OK)

    @swagger_auto_schema(responses={200: StatusSerializer},
                         request_body=StatusWithNotesSerializer)
    def post(self, request, project_id):
        if isinstance(project_id, uuid.UUID):
            try:
                project = Project.objects.get(
                    project_id=project_id)
            except Project.DoesNotExist:
                return Response({'error': 'Does not Exist'},
                                status=http_status.HTTP_404_NOT_FOUND)
            try:
                user_roles = self.request.user.groups.all()
            except:  # noqa
                return Response(data={'message': 'No User Role'},
                                status=http_status.HTTP_404_NOT_FOUND)
            if project.author == self.request.user and Permission.objects.filter(  # noqa
                    role__in=user_roles,
                    view_own_states=project.state).exists():
                pass
            elif project.author != self.request.user and Permission.objects.filter(  # noqa
                    role__in=user_roles,
                    view_other_states=project.state).exists():
                pass
            else:
                return Response(status=http_status.HTTP_401_UNAUTHORIZED)
            circuit_transition = Transition.objects.get(
                from_state=project.state,
                to_state=State.objects.get(name=request.data['name']))
            roles = circuit_transition.role.all()
            if circuit_transition.from_state != project.state:
                return Response(
                    {'error': 'You are not authorized to edit the status.'},
                    status=http_status.HTTP_401_UNAUTHORIZED)
            else:
                if circuit_transition.only_for_creator is True and self.request.user == project.author:  # noqa
                    transition_history = TransitionHistory(
                        project_id=project_id,
                        transition_author=request.user,
                        transition=circuit_transition,
                        reviewer_notes=request.data['note'])
                    transition_history.save()
                    project.state = circuit_transition.to_state
                    project.save()
                    state = project.state
                    serialized = StatusSerializer(state)
                    return Response(serialized.data)
                elif circuit_transition.only_for_creator is False:
                    roles_set = set(roles)
                    user_roles_set = set(user_roles)
                    if user_roles_set.intersection(roles_set):
                        intersection = user_roles_set.intersection(roles_set)
                        for user_role in intersection:
                            if user_role.customgroup.is_arduino is project.is_arduino:  # noqa
                                if circuit_transition.restricted_for_creator is True and project.author == request.user:  # noqa
                                    return Response({
                                        'error': 'You are not authorized to edit the status as it is not '  # noqa
                                                 'allowed for creator.'},
                                        status=http_status.HTTP_401_UNAUTHORIZED)  # noqa
                                else:
                                    transition_history = TransitionHistory(
                                        project_id=project_id,
                                        transition_author=request.user,
                                        transition=circuit_transition,
                                        reviewer_notes=request.data['note'])
                                    transition_history.save()
                                    project.state = circuit_transition.to_state
                                    project.save()
                                    state = project.state
                                    serialized = StatusSerializer(state)
                                    return Response(serialized.data)
                        return Response(
                            {
                                'error': 'You are not authorized to edit the status as you dont have the role'},  # noqa
                            status=http_status.HTTP_401_UNAUTHORIZED)
                    else:
                        return Response(
                            {
                                'error': 'You are not authorized to edit the status as you dont have the role.'},  # noqa
                            status=http_status.HTTP_401_UNAUTHORIZED)
                else:
                    return Response(
                        {
                            'error': 'You are not authorized to edit the status as it is only allowed for creator.'},  # noqa
                        status=http_status.HTTP_401_UNAUTHORIZED)


class ReportedProjectsView(viewsets.ViewSet):
    parser_classes = (FormParser, JSONParser)
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(request_body=ReportDescriptionSerializer)
    def report_project(self, request, project_id):
        '''
        Request to report a project.
        '''
        try:
            state = State.objects.get(report=True)
        except State.DoesNotExist:
            return Response({'Message': 'No reported State implemented'},
                            status=http_status.HTTP_404_NOT_FOUND)
        try:
            project = Project.objects.get(
                project_id=project_id)
        except Project.DoesNotExist:
            return Response({'Message': 'No projects found'},
                            status=http_status.HTTP_404_NOT_FOUND)
        if project.is_reported is False and project.state != State.objects.get(
                report=True):
            transition_history = TransitionHistory(project_id=project_id,
                                                   transition_author=request.user,  # noqa
                                                   transition=Transition.objects.get(  # noqa
                                                       from_state=project.state,    # noqa
                                                       to_state=state)
                                                   )
            transition_history.save()
            project.state = state
            project.is_reported = True
        report = Report(description=request.data['description'],
                        project=project, reporter=self.request.user)
        project.save()
        report.save()
        return Response(status=http_status.HTTP_200_OK)

    @swagger_auto_schema(responses={200: ProjectSerializer})
    def list_projects(self, request):
        '''
        Request to retrieve reported projects.
        '''
        try:
            projects = Project.objects.filter(is_reported=True)
        except Project.DoesNotExist:
            return Response({'Message': 'No projects found'},
                            status=http_status.HTTP_404_NOT_FOUND)
        serialized = ProjectSerializer(projects, many=True)
        return Response(serialized.data,
                        status=http_status.http_status.HTTP_200_OK)

    @swagger_auto_schema(request_body=ReportApprovalSerializer)
    def approve_reports(self, request, project_id):
        try:
            groups = self.request.user.groups.all()
        except:  # noqa
            return Response({'error': 'You are not authorized!'},
                            status=http_status.HTTP_401_UNAUTHORIZED)
        for group in groups:
            if group.customgroup.is_type_reviewer is True:
                for report in request.data['reports']:
                    temp = Report.objects.get(id=report['id'])
                    temp.approved = report['approved']
                    if report['approved'] is False:
                        temp.report_open = False
                    temp.save()
                project = Project.objects.get(
                    project_id=project_id)
                state = State.objects.get(
                    name=request.data['state']['name'])
                transition = Transition.objects.get(
                    from_state=project.state,
                    to_state=state)
                transition_history = TransitionHistory(
                    project_id=project_id,
                    transition_author=self.request.user,
                    transition=transition)
                transition_history.save()
                project.state = state
                if state.public:
                    project.is_reported = False
                project.save()
                return Response({"Approval sent"})
        else:
            return Response({'error': 'You are not authorized!'},
                            status=http_status.HTTP_401_UNAUTHORIZED)

    @swagger_auto_schema(responses={200: ReportSerializer})
    def get_reports(self, request, project_id):
        '''
        Request to get reports of a specific project.
        '''
        try:
            project = Project.objects.get(
                project_id=project_id, is_reported=True)
        except Project.DoesNotExist:
            return Response({"Error": "No project found"},
                            status=http_status.HTTP_404_NOT_FOUND)
        try:
            if self.request.user == project.author:
                open_reports = Report.objects.filter(
                    project=project, report_open=True, approved=None)
                resolved_reports = []
                approved_reports = Report.objects.filter(
                    project=project, report_open=True, approved=True)
            else:
                open_reports = Report.objects.filter(
                    project=project, report_open=True, approved=None)
                resolved_reports = Report.objects.filter(
                    project=project, report_open=False)
                approved_reports = Report.objects.filter(
                    project=project, report_open=True, approved=True)
        except Report.DoesNotExist:
            return Response({"Message": "No reports found"},
                            status=http_status.HTTP_404_NOT_FOUND)
        open_serialized = ReportSerializer(open_reports, many=True)
        resolved_serialized = ReportSerializer(resolved_reports, many=True)
        approved_serializer = ReportSerializer(approved_reports, many=True)
        return Response(
            {"open": open_serialized.data, "closed": resolved_serialized.data,
             "approved": approved_serializer.data},
            status=http_status.HTTP_200_OK)

    @swagger_auto_schema()
    def resolve(self, request, project_id):
        '''
        Request to resolve the projects.
        '''
        try:
            groups = self.request.user.groups.all()
        except:  # noqa
            return Response({'error': 'You are not authorized!'},
                            status=http_status.HTTP_401_UNAUTHORIZED)
        for group in groups:
            if group.customgroup.is_type_reviewer is True:
                try:
                    project = Project.objects.get(
                        project_id=project_id)
                except Project.DoesNotExist:
                    return Response({"Error": "No project found"},
                                    status=http_status.HTTP_404_NOT_FOUND)
                try:
                    reports = Report.objects.filter(project=project)
                except Report.DoesNotExist:
                    return Response({"Message": "No reports found"},
                                    status=http_status.HTTP_404_NOT_FOUND)
                if self.request.user != project.author:
                    for report in reports:
                        report.report_open = False
                        report.resolver = self.request.user
                        report.save()
                    try:
                        transition_history = TransitionHistory(
                            project_id=project_id,
                            transition_author=request.user,
                            transition=Transition.objects.get(
                                from_state=project.state,
                                to_state=State.objects.get(
                                    name=request.data['name']))
                        )

                        project.state = State.objects.get(
                            name=request.data['name'])
                        transition_history.save()
                    except:  # noqa
                        pass
                    project.is_reported = False
                    project.save()
                    return Response(
                        {"Message": "Changed Reported Project State"},
                        status=http_status.HTTP_200_OK)
                else:
                    return Response({'error': 'You are not authorized!'},
                                    status=http_status.HTTP_401_UNAUTHORIZED)
        else:
            return Response({'error': 'You are not authorized!'},
                            status=http_status.HTTP_401_UNAUTHORIZED)
