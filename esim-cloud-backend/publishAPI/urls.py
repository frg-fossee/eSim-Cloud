"""

esimCloud URL Configuration

"""
from django.urls import path
from django.conf.urls import url, include
from publishAPI import views as publishAPI_views
from rest_framework import routers

router = routers.SimpleRouter()
router.register(r'tags', publishAPI_views.TagsViewSet)

urlpatterns = [
    url(r'^', include(router.urls)),
]
