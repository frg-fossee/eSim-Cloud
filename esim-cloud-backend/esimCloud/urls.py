"""

esimCloud URL Configuration

"""

from django.contrib import admin
from django.urls import path

from simulationAPI import views as simulationAPI_views


urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/upload', simulationAPI_views.NetlistUploader.as_view(),
         name='netlistUploader'),

    path('api/task/<uuid:task_id>',
         simulationAPI_views.CeleryResultView.as_view(), name='celery_status'),

]
