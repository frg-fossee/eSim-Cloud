from rest_framework.response import Response
from rest_framework import status as http_status
import uuid
from .serializers import StatusSerializer
from .models import Permission, State, Transition, Permission
from publishAPI.models import TransitionHistory


def ChangeStatus(self, status, project):
    if isinstance(project.project_id, uuid.UUID):
        try:
            user_roles = self.request.user.groups.all()
        except:  # noqa
            return Exception({'message': 'No User Role'})
        if project.author == self.request.user and Permission.objects.filter(
                role__in=user_roles,
                view_own_states=project.state).exists():
            pass
        elif project.author != self.request.user and Permission.objects.filter(
                role__in=user_roles,
                view_other_states=project.state).exists():
            pass
        else:
            return Exception(
                {'error': 'You are not authorized to edit the status.'})
        circuit_transition = Transition.objects.get(from_state=project.state,
                                                    to_state=State.objects.get(
                                                        name=status))
        roles = circuit_transition.role.all()
        if circuit_transition.from_state != project.state:
            return Exception(
                {'error': 'You are not authorized to edit the status.'})
        else:
            if circuit_transition.only_for_creator is True and self.request.user == project.author:  # noqa
                transition_history = TransitionHistory(
                    project_id=project.project_id,
                    transition_author=self.request.user,
                    transition=circuit_transition,
                    reviewer_notes='',)
                transition_history.save()
                project.state = circuit_transition.to_state
                project.save()
                state = project.state
                serialized = StatusSerializer(state)
                return serialized.data
            elif circuit_transition.only_for_creator is False:
                roles_set = set(roles)
                user_roles_set = set(user_roles)
                if user_roles_set.intersection(roles_set):
                    intersection = user_roles_set.intersection(roles_set)
                    for user_role in intersection:
                        if user_role.customgroup.is_arduino is project.is_arduino:  # noqa
                            if circuit_transition.restricted_for_creator is True and project.author == self.request.user:  # noqa
                                return Response({
                                    'error': 'You are not authorized to edit the status as it is not allowed for creator.'},  # noqa
                                    status=http_status.HTTP_401_UNAUTHORIZED)
                            else:
                                transition_history = TransitionHistory(
                                    project_id=project.project_id,
                                    transition_author=self.request.user,
                                    transition=circuit_transition,
                                    reviewer_notes='',)
                                transition_history.save()
                                project.state = circuit_transition.to_state
                                project.save()
                                state = project.state
                                serialized = StatusSerializer(state)
                                return serialized.data
                    return Exception({
                        'error': 'You are not authorized to edit the status as you dont have the role'})  # noqa
                else:
                    return Exception({
                        'error': 'You are not authorized to edit the status as you dont have the role'})  # noqa
            else:
                return Exception(
                    {
                        'error': 'You are not authorized to edit the status as it is only allowed for creator.'})  # noqa
