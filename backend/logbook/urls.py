from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import WeeklyLogViewSet, LogReviewViewSet, AcademicDashboardView, AdminDashboardView, WorkplaceDashboardView

router = DefaultRouter()

router.register(r'logs', WeeklyLogViewSet, basename='logs')
router.register(r'reviews', LogReviewViewSet, basename='reviews')

urlpatterns = [
    path('', include(router.urls)),
    path("academic-dashboard/", AcademicDashboardView.as_view(), name='academic-dashboard'),
    path("admin-dashboard/", AdminDashboardView.as_view(), name='admin-dashboard'),
    path("wp-dashboard/", WorkplaceDashboardView.as_view())
]