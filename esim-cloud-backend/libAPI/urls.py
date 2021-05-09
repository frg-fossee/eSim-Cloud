from libAPI.views import LibraryViewSet, LibraryComponentViewSet, LibrarySetViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'libraries', LibraryViewSet, basename='library')
router.register(r'library-sets', LibrarySetViewSet, basename='library')
router.register(r'components', LibraryComponentViewSet, basename='components')
urlpatterns = router.urls
