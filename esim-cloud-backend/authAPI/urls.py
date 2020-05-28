"""

esimCloud URL Configuration

"""
from django.urls import path
from django.conf.urls import url, include
from authAPI import views as authAPI_views

urlpatterns = [
    url(r'^google-callback', authAPI_views.GoogleOAuth2.as_view()),
    url(r'^users/activate/(?P<uid>[\w-]+)/(?P<token>[\w-]+)/$',
        authAPI_views.UserActivationView.as_view()),
]
