"""

esimCloud URL Configuration

"""
from django.conf.urls import url
from authAPI import views as authAPI_views

urlpatterns = [
    url(r'^google-callback', authAPI_views.GoogleOAuth2),
    url(r'^users/activate/(?P<uid>[\w-]+)/(?P<token>[\w-]+)/$',
        authAPI_views.activate_user),
    url(r'user/token/', authAPI_views.CustomTokenCreateView.as_view())
]
