from django.db.models import fields
from rest_framework import serializers
from django.db import models
from django.contrib.auth.models import  Group
from .models import CustomGroup, Notification, Transition,State
from publishAPI.models import Report
class UserRoleRetreieveSerializer(serializers.ModelSerializer):
    class Meta: 
        model = CustomGroup
        fields = ['group','is_type_reviewer']

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model=State
        fields=('name',)

class TransitionSerializer(serializers.ModelSerializer):
    class Meta:
        model= Transition
        fields=('to_state',)
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model= Notification
        fields=('text',)

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