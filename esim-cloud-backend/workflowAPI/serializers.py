from rest_framework import fields, serializers
from .models import CustomGroup, Transition, State
from publishAPI.models import Report


class UserRoleRetreieveSerializer(serializers.ModelSerializer):
    e_sim_reviewer = serializers.BooleanField()
    arduino_reviewer = serializers.BooleanField()

    class Meta:
        model = CustomGroup
        fields = ['group', 'is_type_reviewer', 'arduino_reviewer',
                  'e_sim_reviewer', 'is_type_staff']


class StatusWithNotesSerializer(serializers.ModelSerializer):
    note = serializers.CharField(max_length=500)
    name = serializers.CharField(max_length=200)

    class Meta:
        model = State
        fields = ('name', 'note',)


class StatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = State
        fields = ('name',)


class TransitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transition
        fields = ('to_state',)


class ReportStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = ('id', 'approved')


class ReportApprovalSerializer(serializers.ModelSerializer):
    state = StatusSerializer()
    reports = ReportStatusSerializer(many=True)

    class Meta:
        model = Report
        fields = ('reports', 'state')
