"""

esimCloud URL Configuration

"""
from django.urls import path
from saveAPI import views as saveAPI_views
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'save/search', saveAPI_views.SaveSearchViewSet,
                basename='SaveSearch')

urlpatterns = [
    path('save', saveAPI_views.StateSaveView.as_view(),
         name='saveState'),

    path('save/list', saveAPI_views.UserSavesView.as_view(),
         name='listSaves'),

    path('save/arduino/list', saveAPI_views.ArduinoSaveList.as_view(),
         name='ArduinoSaveList'),

    path("save/gallery", saveAPI_views.GalleryView.as_view(),
         name="getGallery"),

    path('save/gallery/<str:save_id>',
         saveAPI_views.GalleryFetchSaveDeleteView.as_view(),
         name='fetchGallerySchematic'),

    path('save/<uuid:save_id>/<str:version>/<str:branch>',
         saveAPI_views.StateFetchUpdateView.as_view(), name='fetchState'),

    path('save/copy/<str:version>/<uuid:save_id>/<str:branch>',
         saveAPI_views.CopyStateView.as_view(), name='copyState'),

    path(
        'save/<uuid:save_id>/sharing/<str:sharing>/<str:version>/<str:branch>',
        saveAPI_views.StateShareView.as_view(), name='shareState'),

    path("save/versions/<uuid:save_id>",
         saveAPI_views.StateSaveAllVersions.as_view(), name="listAllVersions"),

    path("save/versions/<str:version>/<uuid:save_id>/<str:branch>",
         saveAPI_views.GetStateSpecificVersion.as_view(),
         name="getSpecificVersion"),

    path("save/versions/<uuid:save_id>/<str:branch>",
         saveAPI_views.DeleteBranch.as_view(),
         name="deleteBranch"),

    path("save/<uuid:save_id>", saveAPI_views.DeleteCircuit.as_view(),
         name="deleteCircuit")

]

urlpatterns += router.urls
