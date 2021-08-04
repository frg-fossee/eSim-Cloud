from os import makedirs, read
from django.db.models import fields
from rest_framework import serializers
from rest_framework.fields import ListField
from saveAPI.models import StateSave, Gallery
from libAPI.models import Library
from libAPI.serializers import LibrarySerializer
from django.core.files.base import ContentFile
from ltiAPI.models import lticonsumer
import base64
import six
import uuid
import imghdr


class Base64ImageField(serializers.ImageField):

    def to_internal_value(self, data):
        _, data = self.update(data)
        return super(Base64ImageField, self).to_internal_value(data)

    def update(self, data):
        if isinstance(data, six.string_types):
            if 'data:' in data and ';base64,' in data:
                header, data = data.split(';base64,')
        try:
            decoded_file = base64.b64decode(data)
        except TypeError:
            self.fail('invalid_image')
        file_name = str(uuid.uuid4())
        file_extension = imghdr.what(file_name, decoded_file)
        complete_file_name = "%s.%s" % (file_name, file_extension,)
        data = ContentFile(decoded_file, name=complete_file_name)
        return complete_file_name, data


class StateSaveSerializer(serializers.ModelSerializer):
    base64_image = Base64ImageField(max_length=None, use_url=True)
    esim_libraries = LibrarySerializer(many=True, required=False)
    project_version = serializers.CharField(read_only=True,
                                            source='project.active_version')
    project_branch = serializers.CharField(read_only=True,
                                           source='project.active_branch')
    is_reported = serializers.BooleanField(read_only=True,
                                           source='project.is_reported')
    lti_id = serializers.SerializerMethodField()

    class Meta:
        model = StateSave

        fields = ('save_time', 'save_id', 'data_dump', 'name', 'description',
                  'owner', 'shared', 'base64_image', 'create_time', 'version',
                  'branch', 'is_arduino', 'esim_libraries', 'project_id',
                  'project_version', 'project_branch', 'is_reported',
                  'id', 'lti_id')

    def get_lti_id(self, obj):
        save_id = obj.save_id
        ltis = lticonsumer.objects.filter(model_schematic__save_id=save_id)
        if ltis.exists():
            return ltis[0].id
        else:
            return None


class SaveListSerializer(serializers.ModelSerializer):
    base64_image = Base64ImageField(max_length=None, use_url=True)
    esim_libraries = LibrarySerializer(many=True, required=False)
    project_id = serializers.CharField(read_only=True,
                                       source='project.project_id')
    project_version = serializers.CharField(read_only=True,
                                            source='project.active_version')
    project_branch = serializers.CharField(read_only=True,
                                           source='project.active_branch')
    is_reported = serializers.BooleanField(read_only=True,
                                           source='project.is_reported')
    lti_id = serializers.SerializerMethodField()

    class Meta:
        model = StateSave
        fields = ('save_time', 'save_id', 'name', 'description',
                  'shared', 'base64_image', 'create_time', 'version',
                  'branch', 'esim_libraries', 'project_id', 'project_version',
                  'project_branch', 'is_reported', 'id', 'lti_id')

    def get_lti_id(self, obj):
        save_id = obj.save_id
        ltis = lticonsumer.objects.filter(model_schematic__save_id=save_id)
        if ltis.exists():
            return ltis[0].id
        else:
            return None


class GallerySerializer(serializers.ModelSerializer):

    media = Base64ImageField(max_length=None, use_url=True)
    esim_libraries = LibrarySerializer(many=True, required=False)

    class Meta:
        model = Gallery
        fields = (
            'save_id', 'data_dump', 'name',
            'description', 'media', 'shared', 'esim_libraries'
            )
