"""

esimCloud URL Configuration

"""
from django.urls import path
from django.conf.urls import url, include
from publishAPI import views as publishAPI_views
from rest_framework import routers

router = routers.SimpleRouter()
router.register(r'tags', publishAPI_views.TagsViewSet,
                basename='tag')
router.register(r'publish/publishing', publishAPI_views.PublicCircuitViewSet,
                basename='publish')
router.register(r'publish/mycircuit', publishAPI_views.MyCircuitViewSet,
                basename='circuit')
# router.register(r'circuits', publishAPI_views.PublishViewSet,
#                 basename='circuit')

urlpatterns = [
    url(r'^', include(router.urls)),
    path('publish/circuit/<uuid:circuit_id>',
         publishAPI_views.CircuitViewSet.as_view(), name='create'),
]
