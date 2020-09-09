from .views import  DomainsViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'domains', DomainsViewSet, basename='domains')
urlpatterns = router.urls
