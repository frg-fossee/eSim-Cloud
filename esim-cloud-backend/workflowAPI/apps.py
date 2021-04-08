from django.apps import AppConfig
import workflowAPI 

class WorkflowapiConfig(AppConfig):
    name = 'workflowAPI'
    def ready(self):
        pass
        # import workflowAPI.signals.handlers