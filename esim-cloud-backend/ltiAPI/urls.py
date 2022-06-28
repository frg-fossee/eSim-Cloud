from django.conf.urls import url
from django.urls import path

from . import views
app_name = 'ltiAPI'

urlpatterns = [
    url(r'^build/$', views.LTIBuildApp.as_view(), name="create-lti"),
    path('build/arduino', views.ArduinoLTIBuildApp.as_view(),
         name="create-arduino-lti"),
    url(r'^update/$', views.LTIUpdateAPP.as_view(), name="create-lti"),
    path('update_arduino/', views.ArduinoLTIUpdateAPP.as_view(),
         name="create-lti"),
    path('<uuid:save_id>/config.xml/', views.LTIConfigView.as_view(),
         name="config"),
    path('auth/<uuid:save_id>/', views.LTIAuthView.as_view(), name="auth"),
    path('arduino/auth/<uuid:save_id>/',
         views.ArduinoLTIAuthView.as_view(), name="arduino-auth"),
    path('submit/', views.LTIPostGrade.as_view(), name="submit"),
    path('arduino/submit/', views.ArduinoLTIPostGrade.as_view(),
         name="submit"),
    url(r'^denied/$', views.denied, name="denied"),
    path('exist/<uuid:save_id>/', views.LTIExist.as_view()),
    path('exist/arduino/<uuid:save_id>/', views.ArduinoLTIExist.as_view()),
    path('delete/<int:id>/', views.LTIDeleteApp.as_view()),
    path('arduino/delete/<int:id>/', views.ArduinoLTIDeleteApp.as_view()),
    path('submissions/<str:save_id>/<str:version>/<str:branch>',
         views.GetLTISubmission.as_view()),
    path('arduino/submissions/<str:save_id>/<str:version>/<str:branch>',
         views.GetArduinoLTISubmission.as_view()),
    path('arduino/viewcode/<int:ltiID>', views.ArduinoLTIViewCode.as_view()),
    path('exists/', views.LTIAllConsumers.as_view()),
    path('save/arduinodata/<int:save_id>/<int:lti_id>',
         views.ArduinoLTISimulationDataView.as_view())
]
