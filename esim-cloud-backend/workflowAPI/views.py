import uuid
from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import NotificationSerializer, StatusSerializer,ReportApprovalSerializer ,UserRoleRetreieveSerializer
from .models import Notification, State, Transition, CustomGroup
from publishAPI.models import Publication, Report
from publishAPI.serializers import PublicationSerializer,ReportSerializer,ReportDescriptionSerializer
from rest_framework.response import Response
from rest_framework import viewsets
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers, status as http_status
from rest_framework.parsers import FormParser, JSONParser
from publishAPI.models import TransitionHistory


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
        for userRole in userRoles:
            data.append(userRole.name)
            if userRole.customgroup.is_type_reviewer:
                reviewer = True
        serializer = UserRoleRetreieveSerializer(
            data={"group": data, "is_type_reviewer": reviewer})
        try:
            serializer.is_valid()
            return Response(serializer.data)
        except:
            serializer.is_valid()
            return Response(serializer.errors)


class NotificationView(APIView):
    parser_classes = (FormParser, JSONParser)
    permission_classes = [IsAuthenticated]
    serializer_class = NotificationSerializer

    @swagger_auto_schema(responses={200: NotificationSerializer})
    def get(self, request):
        notifications = Notification.objects.filter(
            user=self.request.user, shown=False)
        if notifications is not None:
            for notification in notifications:
                notification.shown = True
                notification.save()
            serialized = NotificationSerializer(notifications, many=True)
            return Response(serialized.data)
        else:
            return Response({'message': 'No New Notifications!'})

    @swagger_auto_schema(responses={200: NotificationSerializer}, request_body=NotificationSerializer)
    def post(self, request):
        notif = Notification(text=request.data['text'], user=self.request.user)
        notif.save()
        serialized = NotificationSerializer(notif)
        return Response(serialized.data)


class RetrivePublicationsViewSet(APIView):
    """
    Retrive circuits for futher evaluation
    """
    parser_classes = (FormParser, JSONParser)
    serializer_class = PublicationSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(responses={200: PublicationSerializer})
    def get(self, request):
        try:
            groups = self.request.user.groups.all()
        except:
            return Response({'error': 'You are not authorized!'}, status=http_status.HTTP_401_UNAUTHORIZED)
        transistions = Transition.objects.filter(
            role__in=groups, only_for_creator=False)
        publications = Publication.objects.none()
        for transistion in transistions:
            publication = Publication.objects.filter(
                state=transistion.from_state).exclude(author=self.request.user)
            # TODO: Make sure this gets distinct values
            publications = publications | publication
        if publications is None:
            return Response(status=http_status.HTTP_404_NOT_FOUND)
        else:
            serialized = PublicationSerializer(publications, many=True)
            return Response(serialized.data)


class PublicationStateView(APIView):
    """
    Requests to set and get Publication states
    """
    parser_classes = (FormParser, JSONParser)
    serializer_class = StatusSerializer
    permission_classes = [IsAuthenticated]

    def get(self, request, publication_id):
        if isinstance(publication_id, uuid.UUID):
            try:
                saved_state = Publication.objects.get(
                    publication_id=publication_id)
            except:
                return Response({'error': 'Publication does not Exist'}, status=http_status.HTTP_404_NOT_FOUND)
            circuit_transition = Transition.objects.filter(
                from_state=saved_state.state, role__in=self.request.user.groups.all())
            states = []
            for transition in circuit_transition:
                if transition.only_for_creator is True and self.request.user is saved_state.author:
                    states.append(transition.to_state.name)
                else:
                    if transition.allowed_for_creator is False and saved_state.author == request.user:
                        pass
                    else:
                        states.append(transition.to_state.name)
            states = list(set(states))
            if states == []:
                return Response(status=http_status.HTTP_200_OK)
            else:
                return Response(states,status=http_status.HTTP_200_OK)

    @swagger_auto_schema(responses={200: StatusSerializer}, request_body=StatusSerializer)
    def post(self, request, publication_id):
        if isinstance(publication_id, uuid.UUID):
            try:
                saved_state = Publication.objects.get(
                    publication_id=publication_id)
            except:
                return Response({'error': 'Does not Exist'}, status=http_status.HTTP_404_NOT_FOUND)
            try:
                user_roles = self.request.user.groups.all()
            except:
                return Response(data={'message': 'No User Role'}, status=http_status.HTTP_404_NOT_FOUND)
            circuit_transition = Transition.objects.get(from_state=saved_state.state,
                                                        to_state=State.objects.get(name=request.data['name']))
            roles = circuit_transition.role.all()
            if circuit_transition.from_state != saved_state.state:
                return Response({'error': 'You are not authorized to edit the status.'},
                                status=http_status.HTTP_401_UNAUTHORIZED)
            else:
                if circuit_transition.only_for_creator is True and self.request.user == saved_state.author:
                    transition_history = TransitionHistory(publication_id=publication_id,
                                                           transition_author=request.user,
                                                           from_state=saved_state.state,
                                                           to_state=circuit_transition.to_state)
                    transition_history.save()
                    saved_state.state = circuit_transition.to_state
                    saved_state.save()
                    state = saved_state.state
                    serialized = StatusSerializer(state)
                    return Response(serialized.data)
                elif circuit_transition.only_for_creator is False:
                    roles_set = set(roles)
                    user_roles_set = set(user_roles)
                    if user_roles_set & roles_set:
                        intersection = user_roles_set.intersection(roles_set)
                        for user_role in intersection:
                            if user_role.customgroup.is_arduino is saved_state.is_arduino:
                                if circuit_transition.allowed_for_creator is False and saved_state.author == request.user:
                                    return Response({'error': 'You are not authorized to edit the status as it is not allowed for creator.'},
                                                    status=http_status.HTTP_401_UNAUTHORIZED)
                                else:

                                    transition_history = TransitionHistory(publication_id=publication_id,
                                                                           transition_author=request.user,
                                                                           from_state=saved_state.state,
                                                                           to_state=circuit_transition.to_state)
                                    transition_history.save()
                                    saved_state.state = circuit_transition.to_state
                                    saved_state.save()
                                    state = saved_state.state
                                    if saved_state.author != request.user:
                                        notiftext = "Your circuit status have been changed from " + \
                                            str(circuit_transition.from_state) + \
                                            " to " + \
                                            str(circuit_transition.to_state)
                                        notification = Notification(
                                            text=notiftext, user=saved_state.author)
                                        notification.save()
                                    serialized = StatusSerializer(state)
                                    return Response(serialized.data)
                        else:
                            return Response({'error': 'You are not authorized to edit the status as you dont have the role 1.'},
                                            status=http_status.HTTP_401_UNAUTHORIZED)
                    else:
                        return Response({'error': 'You are not authorized to edit the status as you dont have the role 2 .'},
                                        status=http_status.HTTP_401_UNAUTHORIZED)
                else:
                    return Response({'error': 'You are not authorized to edit the status as it is only allowed for creator.'},
                                    status=http_status.HTTP_401_UNAUTHORIZED)


class ReportedPublicationsView(viewsets.ViewSet):

    parser_classes = (FormParser, JSONParser)
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(request_body=ReportDescriptionSerializer)
    def report_publication(self, request,publication_id):
        '''
        Request to report a publication.
        '''
        try: 
            state = State.objects.get(report=True)
        except:
            return Response({'Message': 'No reported State implemented'}, status=http_status.HTTP_404_NOT_FOUND)
        try:
            publication = Publication.objects.get(publication_id=publication_id)
        except:
            return Response({'Message': 'No publications found'}, status=http_status.HTTP_404_NOT_FOUND)
        publication.state = state
        publication.is_reported = True
        report = Report(description=request.data['description'],publication=publication,reporter=self.request.user)
        publication.save()
        report.save()
        return Response(status=http_status.HTTP_200_OK)

    @swagger_auto_schema(responses={200: PublicationSerializer})
    def list_publications(self, request):
        '''
        Request to retrieve reported publications.
        '''
        try:
            publications = Publication.objects.filter(is_reported=True)
        except:
            return Response({'Message': 'No publications found'}, status=http_status.HTTP_404_NOT_FOUND)
        serialized = PublicationSerializer(publications, many=True)
        return Response(serialized.data, status=http_status.http_status.HTTP_200_OK)

    @swagger_auto_schema(request_body=ReportApprovalSerializer)
    def approve_reports(self,request,publication_id):
        try:
            groups = self.request.user.groups.all()
        except:
            return Response({'error': 'You are not authorized!'}, status=http_status.HTTP_401_UNAUTHORIZED)
        for group in groups:
            if group.customgroup.is_type_reviewer is True:
                flag = False
                for report in request.data['reports']:
                    if report['approved']:
                        flag= True
                    temp = Report.objects.get(id=report['id'])
                    temp.approved = report['approved']
                    temp.save()
                if flag:
                    #Change status as well
                    publication = Publication.objects.get(publication_id=publication_id)
                    publication.state = State.objects.get(name=request.data['state']['name'])
                    return Response({"Approval sent"})
        else:
            return Response({'error': 'You are not authorized!'}, status=http_status.HTTP_401_UNAUTHORIZED)
    @swagger_auto_schema(responses={200: ReportSerializer})
    def get_reports(self, request, publication_id):
        '''
        Request to get reports of a specific publication.
        '''
        try:
            publication = Publication.objects.get(publication_id=publication_id,is_reported=True)
        except:
            return Response({"Error": "No publication found"}, status=http_status.HTTP_404_NOT_FOUND)
        try:
            if self.request.user == publication.author:
                reports = Report.objects.filter(
                    publication=publication, report_open=True,approved=True)
            else:
                reports = Report.objects.filter(
                    publication=publication, report_open=True,approved=None)
        except:
            return Response({"Message": "No reports found"}, status=http_status.HTTP_404_NOT_FOUND)
        serialized = ReportSerializer(reports, many=True)
        return Response(serialized.data, status=http_status.HTTP_200_OK)

    @swagger_auto_schema()
    def resolve(self, request, publication_id):
        '''
        Request to resolve the publications.
        '''
        try:
            groups = self.request.user.groups.all()
        except:
            return Response({'error': 'You are not authorized!'}, status=http_status.HTTP_401_UNAUTHORIZED)
        for group in groups:
            if group.customgroup.is_type_reviewer is True:
                try:
                    publication = Publication.objects.get(publication_id=publication_id)
                except:
                    return Response({"Error": "No publication found"}, status=http_status.HTTP_404_NOT_FOUND)
                try:
                    reports = Report.objects.filter(publication=publication)
                except:
                    return Response({"Message": "No reports found"}, status=http_status.HTTP_404_NOT_FOUND)
                for report in reports:
                    report.report_open = False
                    report.resolver = self.request.user
                    report.save()
                # publication.state = State.objects.get(name=request.data['name'])
                # publication.is_reported = False
                # publication.save()
                return Response({"Message": "Changed Reported Publication State"}, status=http_status.HTTP_200_OK)
        else:
            return Response({'error': 'You are not authorized!'}, status=http_status.HTTP_401_UNAUTHORIZED)