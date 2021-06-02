from rest_framework import serializers
from .models import lticonsumer


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
