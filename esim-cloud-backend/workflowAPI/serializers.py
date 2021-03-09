from django.db.models import fields
from rest_framework import serializers
from django.db import models
from django.contrib.auth.models import  User
from .models import CustomGroup, Transition,State

class UserRoleRetreieveSerializer(serializers.ModelSerializer):
    class Meta: 
        model = User
        fields = ['groups']

class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model=State
        fields=('name',)

class TransitionSerializer(serializers.ModelSerializer):
    class Meta:
        model= Transition
        fields=('to_state',)