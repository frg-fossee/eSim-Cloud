from django.urls import path
from .views import RetriveUserRoleView,PublicationStateView,RetrivePublicationsViewSet, NotificationView,ReportedPublicationsView


urlpatterns = [
    path('role/',RetriveUserRoleView.as_view(),name='getRole'),
    path('notification/',NotificationView.as_view(),name='sendNotif'),
    path('report/',ReportedPublicationsView.as_view({'get':'list_publications'}),name='listReportedPublications'),
    path('report/approve/<uuid:publication_id>',ReportedPublicationsView.as_view({'post':'approve_reports'}),name='approvePublications'),
    path('report/create/<uuid:publication_id>',ReportedPublicationsView.as_view({'post':'report_publication'}),name='reportPublication'),
    path('report/<uuid:publication_id>',ReportedPublicationsView.as_view({'get':'get_reports'}),name='getReports'),
    path('report/resolve/<uuid:publication_id>',ReportedPublicationsView.as_view({'post':'resolve'}),name='resolvePublication'),
    path('state/<uuid:publication_id>',PublicationStateView.as_view(),name='state'),
    path('otherpublications/',RetrivePublicationsViewSet.as_view(),name='otherCircuits')
]
