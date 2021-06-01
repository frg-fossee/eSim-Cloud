from rest_framework import permissions
from publishAPI.serializers import CircuitTagSerializer, PublicationSerializer,TransitionHistorySerializer  # noqa
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, AllowAny, DjangoModelPermissions  # noqa
from rest_framework.parsers import JSONParser, MultiPartParser
from workflowAPI.models import Permission
from publishAPI.models import  CircuitTag, Publication,Field,TransitionHistory
from rest_framework.permissions import DjangoModelPermissionsOrAnonReadOnly, IsAuthenticated, AllowAny, \
    DjangoModelPermissions  # noqa
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from drf_yasg.utils import swagger_auto_schema
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from saveAPI.models import StateSave
import logging

logger = logging.getLogger(__name__)


class TagsViewSet(viewsets.ModelViewSet):
    """
     CRUD for Tags
    """
    permission_classes = (DjangoModelPermissionsOrAnonReadOnly,)
    queryset = CircuitTag.objects.all()
    serializer_class = CircuitTagSerializer

class PublicationViewSet(APIView):
    parser_classes = (FormParser,JSONParser)
    permission_classes = (IsAuthenticated,)
    serializer_class = PublicationSerializer
    def get(self,request,circuit_id):
        try:
            queryset = Publication.objects.get(publication_id=circuit_id)
        except Publication.DoesNotExist:
            return Response({'error': 'No circuit there'}, status=status.HTTP_404_NOT_FOUND)
        user_roles = self.request.user.groups.all()
        if queryset.author == self.request.user and Permission.objects.filter(role__in=user_roles,view_own_states=queryset.state).exists():
            pass
        elif queryset.author != self.request.user and Permission.objects.filter(role__in=user_roles,view_other_states=queryset.state).exists():
            pass
        else:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        try:
            histories = TransitionHistorySerializer(TransitionHistory.objects.filter(publication=queryset).order_by("transition_time"),many=True)
            serialized = PublicationSerializer(queryset)
            data = serialized.data.copy()
            data['history'] = histories.data
            return Response(data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    def post(self,request,circuit_id):
        try:
            save_state = StateSave.objects.get(save_id=circuit_id)
        except:
            return Response({'Error':'No State found'},status=status.status.HTTP_404_NOT_FOUND)
        user_roles = self.request.user.groups.all()
        if save_state.publication is None:
            publication = Publication(title=request.data[0]['title'],description=request.data[0]['description'],author=save_state.owner,is_arduino=save_state.is_arduino)
            publication.save()
            for field in request.data[1]:
                field = Field(name=field['name'],text=field['text'])
                field.save()
                publication.fields.add(field)
            publication.save()
            save_state.publication = publication
            save_state.shared = True
            save_state.save()
            histories = TransitionHistorySerializer(TransitionHistory.objects.filter(publication=publication),many=True)
            serialized = PublicationSerializer(publication)
            data = serialized.data.copy()
            data['history'] = histories.data
            return Response(data)
        else:
            if Permission.objects.filter(role__in=user_roles,edit_own_states=save_state.publication.state).exists():
                pass
            else:
                return Response(status=status.HTTP_401_UNAUTHORIZED)
            save_state.publication.title = request.data[0]['title']
            save_state.publication.description = request.data[0]['description']
            save_state.publication.save()
            save_state.publication.fields.clear()
            for field in request.data[1]:
                field = Field(name=field['name'],text=field['text'])
                field.save()
                save_state.publication.fields.add(field)
            save_state.publication.save()
            histories = TransitionHistorySerializer(TransitionHistory.objects.filter(publication=save_state.publication),many=True)
            serialized = PublicationSerializer(save_state.publication)
            data = serialized.data.copy()
            data['history'] = histories.data
            return Response(data)
# class PublishViewSet(viewsets.ModelViewSet):
#     """
#      Publishing CRUD Operations
#     """
#     permission_classes = (DjangoModelPermissions,)
#     queryset = Publish.objects.all()
#     serializer_class = PublishSerializer
class MyPublicationViewSet(viewsets.ModelViewSet):
    """
     List users circuits ( Permission Groups )
    """
    parser_classes = (FormParser, JSONParser)
    permission_classes = (IsAuthenticated,)
    serializer_class = PublicationSerializer
    queryset = Publication.objects.none()
    @swagger_auto_schema(response={200: PublicationSerializer})
    def list(self, request):
        try:
            queryset = Publication.objects.filter(author=self.request.user, is_arduino=False)
        except:
            return Response({'error': 'No circuit there'}, status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = PublicationSerializer(queryset, many=True)
            return Response(serialized.data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PublicPublicationViewSet(viewsets.ModelViewSet):
    """
     List published circuits
    """
    parser_classes = (FormParser, JSONParser)
    permission_classes = (IsAuthenticated,)
    serializer_class = PublicationSerializer
    queryset = Publication.objects.none()

    @swagger_auto_schema(response={200: PublicationSerializer})
    def list(self, request):
        try:
            queryset = Publication.objects.filter(is_arduino=False, state__public=True)
        except:
            return Response(status=status.HTTP_404_NOT_FOUND)
        try:
            serialized = PublicationSerializer(queryset, many=True)
            return Response(serialized.data)
        except:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
