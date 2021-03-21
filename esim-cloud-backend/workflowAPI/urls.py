from django.urls import path
from .views import RetriveUserRoleView,CircuitStateView,RetriveCircuitsViewSet, NotificationView


urlpatterns = [
    path('role/',RetriveUserRoleView.as_view(),name='getRole'),
    path('notification/',NotificationView.as_view(),name='sendNotif'),
    path('state/<uuid:circuit_id>',CircuitStateView.as_view(),name='state'),
    path('othercircuits/<str:state_name>',RetriveCircuitsViewSet.as_view(),name='otherCircuits')

]
