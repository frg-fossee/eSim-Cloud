"""

esimCloud URL Configuration

"""
from django.conf.urls import url, include
from publishAPI import views as publishAPI_views
from rest_framework import routers

router = routers.SimpleRouter()
router.register(r'tags', publishAPI_views.TagsViewSet,
                basename='tag')
router.register(r'publish/publishing', publishAPI_views.PublishViewSet,
                basename='publish')
router.register(r'publish/circuit', publishAPI_views.CircuitViewSet,
                basename='circuit')
router.register(r'circuits', publishAPI_views.PublicCircuitViewSet,
                basename='circuit')

urlpatterns = [
    url(r'^', include(router.urls)),
]
