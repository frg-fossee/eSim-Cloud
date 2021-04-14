import uuid
from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import NotificationSerializer, StatusSerializer, UserRoleRetreieveSerializer
from .models import Notification, State, Transition, TransitionHistory,CustomGroup
from publishAPI.models import Circuit
from publishAPI.serializers import CircuitSerializer
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers, status as http_status
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
        for userRole in userRoles:
            data.append(userRole.name)
            if userRole.customgroup.is_type_reviewer:
                reviewer = True
        serializer = UserRoleRetreieveSerializer(data={"group": data,"is_type_reviewer":reviewer})
        try:
            serializer.is_valid()
            return Response(serializer.data)
        except:
            serializer.is_valid()
            return Response(serializer.errors)


class NotificationView(APIView):
    parser_classes=(FormParser,JSONParser)
    permission_classes=[IsAuthenticated]
    serializer_class = NotificationSerializer

    @swagger_auto_schema(responses={200:NotificationSerializer})
    def get(self,request):
        notifications = Notification.objects.filter(user=self.request.user,shown=False)
        if notifications is not None:
            for notification in notifications:
                notification.shown = True   
                notification.save()
            serialized = NotificationSerializer(notifications,many=True)
            return Response(serialized.data)
        else:
            return Response({'message':'No New Notifications!'})

    @swagger_auto_schema(responses={200:NotificationSerializer}, request_body=NotificationSerializer)
    def post(self,request):
        notif = Notification(text=request.data['text'],user=self.request.user)
        notif.save()
        serialized = NotificationSerializer(notif)
        return Response(serialized.data)

class RetriveCircuitsViewSet(APIView):
    """
    Retrive circuits for futher evaluation
    """
    parser_classes = (FormParser, JSONParser)
    serializer_class = CircuitSerializer
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(responses={200: CircuitSerializer})
    def get(self, request):
        try: 
            groups = self.request.user.groups.all()
        except:
            return Response({'error': 'You are not authorized!'}, status=http_status.HTTP_401_UNAUTHORIZED)
        transistions = Transition.objects.filter(role__in=groups,only_for_creator=False)
        circuits = Circuit.objects.none()
        for transistion in transistions:
            circuit = Circuit.objects.filter(state=transistion.from_state).exclude(author=self.request.user)
            #TODO: Make sure this gets distinct values
            circuits = circuits | circuit
        if circuits is None:
            return Response(status=http_status.HTTP_404_NOT_FOUND)
        else:
            serialized = CircuitSerializer(circuits, many=True)
            return Response(serialized.data)

class CircuitStateView(APIView):
    """
    Requests to set and get Circuit states
    """
    parser_classes = (FormParser, JSONParser)
    serializer_class = StatusSerializer
    permission_classes = [IsAuthenticated]
    def get(self, request, circuit_id):
        if isinstance(circuit_id, uuid.UUID):
            try:
                saved_state = Circuit.objects.get(circuit_id=circuit_id)
            except:
                return Response({'error': 'Circuit does not Exist'}, status=http_status.HTTP_404_NOT_FOUND)
            circuit_transition = Transition.objects.filter(from_state=saved_state.state,role__in=self.request.user.groups.all())
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
            return Response(states)
    @swagger_auto_schema(responses={200: StatusSerializer}, request_body=StatusSerializer)
    def post(self, request, circuit_id):
        if isinstance(circuit_id, uuid.UUID):
            try:
                saved_state = Circuit.objects.get(circuit_id=circuit_id)
            except:
                return Response({'error': 'Does not Exist'}, status=http_status.HTTP_404_NOT_FOUND)
            try:
                user_roles = self.request.user.groups.all()
            except:
                return Response(data={'message': 'No User Role'}, status=http_status.HTTP_404_NOT_FOUND)
            circuit_transition = Transition.objects.get(from_state=saved_state.state,
                                                        to_state=State.objects.get(name=request.data['name']))
            roles = circuit_transition.role.all()
            print(self.request.user)
            print(saved_state.author)
            print(circuit_transition.only_for_creator is True and self.request.user is saved_state.author)
            if circuit_transition.from_state != saved_state.state:
                return Response({'error': 'You are not authorized to edit the status.'},
                                status=http_status.HTTP_401_UNAUTHORIZED)
            else:
                if circuit_transition.only_for_creator is True and self.request.user == saved_state.author:
                    transition_history = TransitionHistory(circuit_id=circuit_id,
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
                                    
                                    transition_history = TransitionHistory(circuit_id=circuit_id,
                                                                        transition_author=request.user,
                                                                        from_state=saved_state.state,
                                                                        to_state=circuit_transition.to_state)
                                    transition_history.save()
                                    saved_state.state = circuit_transition.to_state
                                    saved_state.save()
                                    state = saved_state.state
                                    if saved_state.author != request.user:
                                        notiftext = "Your circuit status have been changed from " +str(circuit_transition.from_state) +" to " + str(circuit_transition.to_state)    
                                        notification = Notification(text=notiftext,user=saved_state.author)
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
