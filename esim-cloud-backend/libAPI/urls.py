from libAPI.views import LibraryViewSet, LibraryComponentViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'eda/libraries', LibraryViewSet, basename='library')
router.register(r'components', LibraryComponentViewSet, basename='components')
urlpatterns = router.urls
