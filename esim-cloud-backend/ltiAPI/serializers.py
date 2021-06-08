from rest_framework import serializers
from .models import lticonsumer, ltiSession, Submission
from saveAPI.serializers import SaveListSerializer
from django.contrib.auth import get_user_model


class consumerSerializer(serializers.ModelSerializer):
    class Meta:
        model = lticonsumer
        fields = ['consumer_key', 'secret_key', 'model_schematic', 'score', 'initial_schematic']

    def create(self, validated_data):
        model_schematic = validated_data.pop("model_schematic")
        initial_schematic = validated_data.pop("initial_schematic")
        consumer = lticonsumer.objects.create(model_schematic=model_schematic,
                                              initial_schematic=initial_schematic,
                                              **validated_data)
        return consumer


class consumerExistsSerializer(serializers.ModelSerializer):
    class Meta:
        model = lticonsumer
        fields = ['consumer_key', 'model_schematic', 'initial_schematic']


class consumerResponseSerializer(serializers.Serializer):
    config_url = serializers.CharField(max_length=100)
    consumer_key = serializers.CharField(max_length=50)
    secret_key = serializers.CharField(max_length=50)
    score = serializers.FloatField()
    initial_schematic = serializers.UUIDField()
    model_schematic = serializers.UUIDField()


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

    class Meta:
        model = Submission
        fields = ["schematic", "student", "project", "score", "lms_success", "ltisession"]
