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
router.register(r'publish/publishing', publishAPI_views.PublicProjectViewSet,
                basename='publish')
router.register(r'publish/myproject', publishAPI_views.MyProjectViewSet,
                basename='project')
# router.register(r'circuits', publishAPI_views.PublishViewSet,
#                 basename='Project')

urlpatterns = [
    url(r'^', include(router.urls)),
    path('publish/project/<uuid:circuit_id>',
         publishAPI_views.ProjectViewSet.as_view(), name='create'),
]
