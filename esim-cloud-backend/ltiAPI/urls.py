from django.conf.urls import url
from django.urls import path

from .views import LTIConfigView, LTIAuthView, denied, LTIBuildApp, LTIExist, LTIDeleteApp

app_name = 'ltiAPI'

urlpatterns = [
    url(r'^build/$', LTIBuildApp.as_view(), name="create-lti"),
    path('<uuid:save_id>/config.xml/', LTIConfigView.as_view(), name="config"),
    url(r'^auth/$', LTIAuthView.as_view(), name="auth"),
    url(r'^denied/$', denied, name="denied"),
    path('exist/<uuid:save_id>/', LTIExist.as_view()),
    path('delete/<uuid:save_id>/', LTIDeleteApp.as_view()),
]
