from libAPI.views import LibraryViewSet, LibraryComponentViewSet, FavouriteComponentView,DeleteFavouriteComponent
from rest_framework.routers import DefaultRouter
from django.urls import path

router = DefaultRouter()
router.register(r'libraries', LibraryViewSet, basename='library')
router.register(r'components', LibraryComponentViewSet, basename='components')
urlpatterns = [
    path("favouritecomponents", FavouriteComponentView.as_view(),
         name="favouritecomponents"),
    path("favouritecomponents/<int:id>", DeleteFavouriteComponent.as_view(),
         name="favouritecomponents"),
]
urlpatterns += router.urls
