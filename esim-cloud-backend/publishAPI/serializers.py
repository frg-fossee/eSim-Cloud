from rest_framework import serializers
from publishAPI.models import CircuitTag, Publish, Circuit
from django.core.files.base import ContentFile
import base64
import six
import uuid
import imghdr


class Base64ImageField(serializers.ImageField):

    def to_internal_value(self, data):
        if isinstance(data, six.string_types):
            if 'data:' in data and ';base64,' in data:
                header, data = data.split(';base64,')
            try:
                decoded_file = base64.b64decode(data)
            except TypeError:
                self.fail('invalid_image')
            file_name = str(uuid.uuid4())
            file_extension = imghdr.what(file_name, decoded_file)
            complete_file_name = "%s.%s" % (file_name, file_extension, )
            data = ContentFile(decoded_file, name=complete_file_name)

        return super(Base64ImageField, self).to_internal_value(data)


class CircuitTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = CircuitTag
        fields = ('tag', 'description', 'id')


class CircuitSerializer(serializers.ModelSerializer):
    base64_image = Base64ImageField(max_length=None, use_url=True)
    status_name = serializers.CharField(read_only=True, source='state.name')
    class Meta:
        model = Circuit
        fields = ('circuit_id',
                  'title',
                  'sub_title',
                  'data_dump',
                  'author',
                  'description',
                  'last_updated',
                  'publish_request_time',
                  'base64_image',
                  'status_name'
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
