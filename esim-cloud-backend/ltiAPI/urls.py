from django.conf.urls import url
from django.urls import path

from . import views
app_name = 'ltiAPI'

urlpatterns = [
    url(r'^build/$', views.LTIBuildApp.as_view(), name="create-lti"),
    url(r'^update/$', views.LTIUpdateAPP.as_view(), name="create-lti"),
    path('<uuid:save_id>/config.xml/', views.LTIConfigView.as_view(),
         name="config"),
    path('auth/<uuid:save_id>/', views.LTIAuthView.as_view(), name="auth"),
    path('submit/', views.LTIPostGrade.as_view(), name="submit"),
    url(r'^denied/$', views.denied, name="denied"),
    path('exist/<uuid:save_id>/', views.LTIExist.as_view()),
    path('delete/<int:id>/', views.LTIDeleteApp.as_view()),
    path('submissions/<str:consumer_key>/', views.GetLTISubmission.as_view()),
    path('exists/', views.LTIAllConsumers.as_view())
]
