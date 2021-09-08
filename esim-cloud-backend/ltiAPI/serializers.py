from django.utils import tree
from rest_framework import serializers
from .models import lticonsumer, ltiSession, Submission
from saveAPI.serializers import SaveListSerializer
from django.contrib.auth import get_user_model
from simulationAPI.serializers import simulationSerializer


class consumerSerializer(serializers.ModelSerializer):
    sim_params = serializers.ListField(
        child=serializers.CharField(max_length=50)
    )

    class Meta:
        model = lticonsumer
        fields = ['consumer_key', 'secret_key', 'model_schematic',
                  'score', 'initial_schematic', 'test_case', 'scored',
                  'id', 'sim_params']

    def create(self, validated_data):
        consumer = lticonsumer.objects.create(**validated_data)
        return consumer


class consumerSubmissionSerializer(serializers.ModelSerializer):
    test_case = simulationSerializer(many=False)

    class Meta:
        model = lticonsumer
        fields = ['consumer_key', 'secret_key', 'model_schematic',
                  'score', 'initial_schematic', 'test_case', 'scored',
                  'id', 'sim_params']

    def create(self, validated_data):
        pass


class consumerExistsSerializer(serializers.ModelSerializer):
    class Meta:
        model = lticonsumer
        fields = ['consumer_key', 'model_schematic', 'initial_schematic']


class consumerResponseSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    config_url = serializers.CharField(max_length=100)
    consumer_key = serializers.CharField(max_length=50)
    secret_key = serializers.CharField(max_length=50)
    sim_params = serializers.ListField(
        child=serializers.CharField(max_length=50))
    score = serializers.FloatField(required=False, allow_null=True)
    initial_schematic = serializers.IntegerField()
    model_schematic = serializers.IntegerField()
    test_case = serializers.IntegerField(required=False, allow_null=True)
    scored = serializers.BooleanField()


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ltiSession
        fields = ["id", "user_id", "oauth_nonce"]


class GetSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ltiSession
        fields = "__all__"


class GetSubmissionUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ["username", "email"]


class SubmissionSerializer(serializers.ModelSerializer):
    ltisession = SessionSerializer(many=False)

    class Meta:
        model = Submission
        fields = ["ltisession", "schematic"]


class GetSubmissionsSerializer(serializers.ModelSerializer):
    ltisession = GetSessionSerializer(many=False)
    schematic = SaveListSerializer(many=False)
    student = GetSubmissionUserSerializer(many=False)
    student_simulation = simulationSerializer()
    project = consumerSubmissionSerializer(many=False)

    class Meta:
        model = Submission
        fields = ["schematic", "student", "project",
                  "score", "lms_success", "ltisession",
                  "student_simulation"]
