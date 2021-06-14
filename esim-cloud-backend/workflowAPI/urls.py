from django.urls import path
from .views import RetriveUserRoleView, ProjectStateView, \
    RetriveProjectsViewSet, ReportedProjectsView

urlpatterns = [
    path('role/', RetriveUserRoleView.as_view(), name='getRole'),
    path('report/', ReportedProjectsView.as_view({'get': 'list_projects'}),
         name='listReportedProjects'),
    path('report/approve/<uuid:project_id>',
         ReportedProjectsView.as_view({'post': 'approve_reports'}),
         name='approveProjects'),
    path('report/create/<uuid:project_id>',
         ReportedProjectsView.as_view({'post': 'report_project'}),
         name='reportProject'),
    path('report/<uuid:project_id>',
         ReportedProjectsView.as_view({'get': 'get_reports'}),
         name='getReports'),
    path('report/resolve/<uuid:project_id>',
         ReportedProjectsView.as_view({'post': 'resolve'}),
         name='resolveProject'),
    path('state/<uuid:project_id>', ProjectStateView.as_view(), name='state'),
    path('otherprojects/', RetriveProjectsViewSet.as_view(),
         name='otherCircuits')
]
