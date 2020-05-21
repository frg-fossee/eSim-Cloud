"""
esimCloud URL Configuration
"""
from django.urls import path
from arduinoAPI import views as arduinoAPI_views


urlpatterns = [
    path('compile', arduinoAPI_views.CompileSketch.as_view(),
         name='compileINOFiles'),
    path('compile/status', arduinoAPI_views.CompilationStatus.as_view(),
         name='CompilationStatus')

]
