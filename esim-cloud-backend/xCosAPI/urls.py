from .views import CategoriesViewSet, BlocksViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'xCos/libraries', CategoriesViewSet, basename='library')
router.register(r'xCos/components', BlocksViewSet, basename='components')
urlpatterns = router.urls
