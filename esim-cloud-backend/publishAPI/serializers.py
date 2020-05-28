from rest_framework import serializers
from publishAPI.models import CircuitTag


class CircuitTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CircuitTag
        fields = ('tag', 'description', 'id')
