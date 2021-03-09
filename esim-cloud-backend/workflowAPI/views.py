import uuid
from django.shortcuts import render
from rest_framework.views import APIView
from .serializers import StatusSerializer, UserRoleRetreieveSerializer
from .models import State, Transition, TransitionHistory,CustomGroup
from publishAPI.models import Circuit
from publishAPI.serializers import CircuitSerializer
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from rest_framework.permissions import IsAuthenticated
from rest_framework import status as http_status
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
        print(self.request.user.username)
        data = []
        for userRole in userRoles:
            data.append(userRole.name)
        serializer = UserRoleRetreieveSerializer(data={"groups": data})
        try:
            serializer.is_valid()
            return Response(serializer.data)
        except:
            return Response(serializer.errors)

class RetriveCircuitsViewSet(APIView):
    """
    Retrive circuits for futher evaluation
    """
    parser_classes = (FormParser, JSONParser)
    serializer_class = CircuitSerializer
    permission_classes = [IsAuthenticated]
    
    @swagger_auto_schema(responses={200: CircuitSerializer})
    def get(self, request, state_name):
        try: 
            groups = self.request.user.groups.all()
        except:
            return Response({'error': 'You are not authorized!'}, status=http_status.HTTP_401_UNAUTHORIZED)
        for group in groups:
            cus = CustomGroup.objects.get(group=group)
            for state in cus.accessible_states.all():
                if state.name == state_name:
                    try:
                        queryset = Circuit.objects.filter(state__name=state_name)
                        serialized = CircuitSerializer(queryset,many=True)
                        return Response(serialized.data)
                    except:
                        return Response({'error':'No circuit found!'},status=http_status.HTTP_404_NOT_FOUND)
        else:
            return Response({'error':'You are not authorized'},status=http_status.HTTP_401_UNAUTHORIZED)

class CircuitStateView(APIView):
    """
    Requests to set and get Circuit states
    """
    parser_classes = (FormParser, JSONParser)
    serializer_class = StatusSerializer
    permission_classes = [IsAuthenticated]

    @swagger_auto_schema(responses={200: StatusSerializer})
    def get(self, request, circuit_id):
        if isinstance(circuit_id, uuid.UUID):
            try:
                saved_state = Circuit.objects.get(circuit_id=circuit_id)
            except:
                return Response({'error': 'Circuit does not Exist'}, status=http_status.HTTP_404_NOT_FOUND)
            state = saved_state.state
            serialized = StatusSerializer(state)
            return Response(serialized.data)

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
            if circuit_transition.from_state != saved_state.state:
                return Response({'error': 'You are not authorized to edit the status.'},
                                status=http_status.HTTP_401_UNAUTHORIZED)
            else:
                roles_set = set(roles)
                user_roles_set = set(user_roles)
                if user_roles_set & roles_set:
                    intersection = user_roles_set.intersection(roles_set)
                    for user_role in intersection:
                        if user_role.customgroup.is_arduino is saved_state.is_arduino:
                            if circuit_transition.allowed_for_creator is False and saved_state.author == request.user:
                                return Response({'error': 'You are not authorized to edit the status.'},
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
                                serialized = StatusSerializer(state)
                                return Response(serialized.data)
                    else:
                        return Response({'error': 'You are not authorized to edit the status.'},
                                        status=http_status.HTTP_401_UNAUTHORIZED)
                else:
                    return Response({'error': 'You are not authorized to edit the status.'},
                                    status=http_status.HTTP_401_UNAUTHORIZED)
