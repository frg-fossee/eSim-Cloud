from django.contrib import admin
from .models import lticonsumer, Submission, ltiSession


# Register your models here.
class lticonsumeradmin(admin.ModelAdmin):
    list_display = ['consumer_key', 'secret_key',
                    'model_schematic', 'score', 'initial_schematic']
    readonly_fields = ['id', ]

    def id(self, obj):
        return obj.id


class SubmissionAdmin(admin.ModelAdmin):
    list_display = ['project', 'student', 'score',
                    'schematic', 'lms_success']


class ltiSessionAdmin(admin.ModelAdmin):
    list_display = ['user_id', 'lis_result_sourcedid',
                    'lis_outcome_service_url', 'oauth_nonce',
                    'oauth_timestamp', 'oauth_consumer_key', ]


admin.site.register(lticonsumer, lticonsumeradmin)
admin.site.register(Submission, SubmissionAdmin)
admin.site.register(ltiSession, ltiSessionAdmin)
