from rest_framework import serializers
from .models import Domains

class DomainsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Domains
        fields = ('name', 'logo_path', 'title', 'message')

