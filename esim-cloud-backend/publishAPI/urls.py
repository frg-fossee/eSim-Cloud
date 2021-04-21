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
router.register(r'publish/publishing', publishAPI_views.PublicPublicationViewSet,
                basename='publish')
router.register(r'publish/mypublication', publishAPI_views.MyPublicationViewSet,
                basename='publication')
# router.register(r'circuits', publishAPI_views.PublishViewSet,
#                 basename='Publication')

urlpatterns = [
    url(r'^', include(router.urls)),
    path('publish/publication/<uuid:circuit_id>',
         publishAPI_views.PublicationViewSet.as_view(), name='create'),
]
