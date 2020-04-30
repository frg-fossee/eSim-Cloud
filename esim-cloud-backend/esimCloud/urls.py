"""

esimCloud URL Configuration

"""

from django.contrib import admin
from django.urls import path

from simulationAPI import views as simulationAPI_views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('upload', simulationAPI_views.NetlistUploader.as_view(),
         name='netlistUploader'),
]
