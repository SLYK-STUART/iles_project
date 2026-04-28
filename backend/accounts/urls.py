from django.urls import path
from .views import CustomLoginView, StudentDashboardView, AdminUserDetailView, AdminUserListView

urlpatterns = [
    path('login/', CustomLoginView.as_view()),
    path('student/dashboard/', StudentDashboardView.as_view(), name='student-dashbaord'),

    path('admin/users/', AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users<int:user_id>/', AdminUserDetailView.as_view(), name='admin-user-detail'),
]