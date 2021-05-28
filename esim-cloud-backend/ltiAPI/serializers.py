from rest_framework import serializers
from .models import lticonsumer, ltiSession, Submission


class consumerSerializer(serializers.ModelSerializer):
    class Meta:
        model = lticonsumer
        fields = ['consumer_key', 'secret_key', 'save_id', 'score']

    def create(self, validated_data):
        save = validated_data.pop("save_id")
        consumer = lticonsumer.objects.create(save_id=save, **validated_data)
        return consumer


class consumerResponseSerializer(serializers.Serializer):
    config_url = serializers.CharField(max_length=100)
    consumer_key = serializers.CharField(max_length=50)
    secret_key = serializers.CharField(max_length=50)
    score = serializers.FloatField()


class SessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ltiSession
        fields = ["id", "user_id", "oauth_nonce"]


class SubmissionSerializer(serializers.ModelSerializer):
    ltisession = SessionSerializer(many=False)

    class Meta:
        model = Submission
        fields = ["ltisession", "schematic"]


class GetSubmissionsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Submission
        fields = ["schematic", "student", "project", "score", "lms_success", "ltisession"]
