from libAPI.views import LibraryViewSet, LibraryComponentViewSet, FavouriteComponentViewSet
from rest_framework.routers import DefaultRouter
from django.urls import path

router = DefaultRouter()
router.register(r'libraries', LibraryViewSet, basename='library')
router.register(r'components', LibraryComponentViewSet, basename='components')
urlpatterns = [
    path("favouritecomponents", FavouriteComponentViewSet.as_view(),
         name="favouritecomponents"),
]
urlpatterns += router.urls
