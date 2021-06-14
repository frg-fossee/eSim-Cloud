from django.apps import AppConfig
import workflowAPI


class WorkflowapiConfig(AppConfig):
    name = 'workflowAPI'
    verbose_name = 'Workflow API'

    def ready(self):
        import workflowAPI.signals.handlers
