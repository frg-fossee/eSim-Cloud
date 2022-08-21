from django.utils import tree
from rest_framework import serializers
from .models import ArduinoLTISession, ArduinoLTISimData, \
    ArduinoSubmission, lticonsumer, ltiSession, Submission, \
    ArduinLTIConsumer
from saveAPI.serializers import SaveListSerializer
from django.contrib.auth import get_user_model
from simulationAPI.serializers import simulationSerializer
from saveAPI.serializers import ArduinoModelSimulationDataSerializer


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


class ArduinoConsumerSerializer(serializers.ModelSerializer):

    class Meta:
        model = ArduinLTIConsumer
        fields = ['consumer_key', 'secret_key', 'model_schematic',
                  'score', 'initial_schematic', 'test_case', 'scored',
                  'id', 'view_code', 'con_weightage']

    def create(self, validated_data):
        consumer = ArduinLTIConsumer.objects.create(**validated_data)
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


class consumerArduinoSubmissionSerializer(serializers.ModelSerializer):
    test_case = ArduinoModelSimulationDataSerializer(many=False)

    class Meta:
        model = ArduinLTIConsumer
        fields = ['consumer_key', 'secret_key', 'model_schematic',
                  'score', 'initial_schematic', 'test_case', 'scored',
                  'id', 'view_code', 'con_weightage']

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


class ArduinoConsumerResponseSerializer(serializers.Serializer):
    id = serializers.UUIDField()
    config_url = serializers.CharField(max_length=100)
    consumer_key = serializers.CharField(max_length=50)
    secret_key = serializers.CharField(max_length=50)
    score = serializers.FloatField(required=False, allow_null=True)
    initial_schematic = serializers.IntegerField()
    model_schematic = serializers.IntegerField()
    test_case = serializers.IntegerField(required=False, allow_null=True)
    scored = serializers.BooleanField()
    con_weightage = serializers.FloatField(required=True, allow_null=False)
    view_code = serializers.BooleanField(allow_null=False)


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ltiSession
        fields = ["id", "user_id", "oauth_nonce"]


class ArduinoSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArduinoLTISession
        fields = ["id", "user_id", "oauth_nonce"]


class GetSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ltiSession
        fields = "__all__"


class GetArduinoSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArduinoLTISession
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


class ArduinoSubmissionSerializer(serializers.ModelSerializer):
    ltisession = ArduinoSessionSerializer(many=False)

    class Meta:
        model = ArduinoSubmission
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


class ArduinoLTISimulationDataSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField()
    result = serializers.CharField()

    class Meta:
        model = ArduinoLTISimData
        fields = ('id', 'result')


class GetArduinoSubmissionsSerializer(serializers.ModelSerializer):
    ltisession = GetArduinoSessionSerializer(many=False)
    schematic = SaveListSerializer(many=False)
    student = GetSubmissionUserSerializer(many=False)
    student_simulation = ArduinoLTISimulationDataSerializer()
    project = consumerArduinoSubmissionSerializer(many=False)

    class Meta:
        model = ArduinoSubmission
        fields = ["schematic", "student", "project",
                  "score", "lms_success", "ltisession",
                  "student_simulation"]
