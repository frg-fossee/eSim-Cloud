"""

esimCloud URL Configuration

"""
from django.urls import path
from saveAPI import views as saveAPI_views


urlpatterns = [
    path('save', saveAPI_views.StateSaveView.as_view(),
         name='saveState'),

    path('save/list', saveAPI_views.UserSavesView.as_view(),
         name='listSaves'),

    path('save/arduino/list', saveAPI_views.ArduinoSaveList.as_view(),
         name='ArduinoSaveList'),

    path('save/<uuid:save_id>',
         saveAPI_views.StateFetchUpdateView.as_view(), name='fetchState'),

    path('save/<uuid:save_id>/sharing/<str:sharing>',
         saveAPI_views.StateShareView.as_view(), name='shareState'),

]
