"""

esimCloud URL Configuration

"""
from django.urls import path
from saveAPI import views as saveAPI_views


urlpatterns = [
    path('save', saveAPI_views.StateSaveView.as_view(),
         name='saveState'),

    path('save/<uuid:save_id>',
         saveAPI_views.StateFetchView.as_view(), name='fetchState'),

    path('save/<uuid:save_id>/sharing/<str:sharing>',
         saveAPI_views.StateShareView.as_view(), name='shareState'),

]
