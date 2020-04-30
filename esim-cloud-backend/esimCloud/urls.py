"""

esimCloud URL Configuration

"""

from django.contrib import admin
from django.urls import path
from simulationAPI import urls as simulationURLs
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.conf.urls import url, include
schema_view = get_schema_view(
    openapi.Info(
        title="eSim Cloud API",
        default_version='v1',
        description="Public API Endpoints for eSim Cloud",
        license=openapi.License(name="GPLv3 License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)


urlpatterns = [
    path('admin/', admin.site.urls),

    # Simulation API Routes
    path('api/simulation/', include(simulationURLs)),



    # For API Documentation
    url(r'^swagger(?P<format>\.json|\.yaml)$',
        schema_view.without_ui(
            cache_timeout=0),
        name='schema-json'),

    url(r'^swagger/$', schema_view.with_ui(
        'swagger',
        cache_timeout=0),
        name='schema-swagger-ui'),

]
