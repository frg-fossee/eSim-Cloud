from rest_framework import serializers
from publishAPI.models import CircuitTag, Circuit
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
    base64_image = Base64ImageField(max_length=None, use_url=True,source='statesave.base64_image')
    status_name = serializers.CharField(read_only=True, source='state.name')
    save_id = serializers.CharField(read_only=True, source='statesave.save_id')
    save_time = serializers.CharField(read_only=True, source='statesave.save_time')
    author_name = serializers.CharField(read_only=True, source='author.username')
    class Meta:
        model = Circuit
        fields = ('circuit_id',
                  'title',
                  'base64_image',
                  'status_name',
                  'save_id',
                  'save_time',
                  'author_name'
                  )

