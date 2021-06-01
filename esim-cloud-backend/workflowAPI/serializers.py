from rest_framework import serializers
from .models import CustomGroup, Transition,State
from publishAPI.models import Report
class UserRoleRetreieveSerializer(serializers.ModelSerializer):
    class Meta: 
        model = CustomGroup
        fields = ['group','is_type_reviewer']

class StatusWithNotesSerializer(serializers.ModelSerializer):
    note = serializers.CharField(max_length=500)
    name= serializers.CharField(max_length=200)

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model=State
        fields=('name',)

class TransitionSerializer(serializers.ModelSerializer):
    class Meta:
        model= Transition
        fields=('to_state',)
class ReportStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields=('id','approved')

class ReportApprovalSerializer(serializers.ModelSerializer):
    state = StatusSerializer()
    reports = ReportStatusSerializer(many=True)
    class Meta:
        model=Report
        fields=('reports','state')