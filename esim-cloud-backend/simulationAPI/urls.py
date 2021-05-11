"""

esimCloud URL Configuration

"""
from django.urls import path
from simulationAPI import views as simulationAPI_views


urlpatterns = [
    path('upload', simulationAPI_views.NetlistUploader.as_view(),
         name='netlistUploader'),

    path('status/<uuid:task_id>',
         simulationAPI_views.CeleryResultView.as_view(), name='celery_status'),

    path('output/<uuid:task_id>', simulationAPI_views.GraphView.as_view(), name='output')
]
