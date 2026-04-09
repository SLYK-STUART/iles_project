from rest_framework.routers import DefaultRouter
from .views import WeeklyLogViewSet, LogReviewViewSet

router = DefaultRouter()

router.register(r'weekly-logs', WeeklyLogViewSet, basename='weekly-logs')
router.register(r'log-reviews', LogReviewViewSet, basename='log-reviews')

urlpatterns = router.urls