"""
esimCloud URL Configuration
"""
from django.urls import path
from arduinoAPI import views as arduinoAPI_views


urlpatterns = [
    path('compileINO', arduinoAPI_views.CompileSketchINO.as_view(),
         name='compileINOFiles'),
    path('compileInlineAssembly', arduinoAPI_views.CompileSketchInlineAssembly.as_view(),
         name='compileInlineAssemblyFiles'),
    path('compile/status', arduinoAPI_views.CompilationStatus.as_view(),
         name='CompilationStatus')

]
