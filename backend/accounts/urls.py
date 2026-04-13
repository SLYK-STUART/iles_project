from django.urls import path
from .views import CustomLoginView, StudentDashboardView

urlpatterns = [
    path('login/', CustomLoginView.as_view()),
    path('student/dashboard/', StudentDashboardView.as_view(), name='student-dashbaord'),
]