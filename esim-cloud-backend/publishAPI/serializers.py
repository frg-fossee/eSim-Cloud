from rest_framework import serializers
from publishAPI.models import CircuitTag, Publish, Circuit


class CircuitTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CircuitTag
        fields = ('tag', 'description', 'id')


class CircuitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Circuit
        fields = ('circuit_id',
                  'title',
                  'sub_title',
                  'data_dump',
                  'author',
                  'description',
                  'last_updated',
                  'publish_request_time'
                  )


class PublishSerializer(serializers.HyperlinkedModelSerializer):
    tags = CircuitTagSerializer(many=True, read_only=True)
    circuit = CircuitSerializer(many=False, read_only=True)

    class Meta:
        model = Publish
        fields = ('published',
                  'reviewed_by',
                  'circuit',
                  'tags',
                  )
