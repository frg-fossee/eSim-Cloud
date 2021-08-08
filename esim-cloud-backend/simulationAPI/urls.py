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

    path('history/<uuid:save_id>/<str:version>/<str:branch>/<str:sim>',
         simulationAPI_views.SimulationResults.as_view(),
         name='schematic sim history'),

    path('history/simulator/<str:sim>',
         simulationAPI_views.SimulationResultsFromSimulator.as_view(),
         name='simulator sim history'),

    path('history/lti/<int:lti_id>',
         simulationAPI_views.GetLTISimResults.as_view(),
         name='lti sim history'),
]
