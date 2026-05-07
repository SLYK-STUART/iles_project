from django.urls import path
from .views import (
    AdminCreateStudentView,
    ChangePasswordView,
    AdminCreateSupervisorView,
    AdminCreatePlacementView,
    AdminPlacementDetailView,
    AdminPlacementListView,
    AdminPlacementFormDataView,

)
urlpatterns = [
    path("create-student/", AdminCreateStudentView.as_view()),
    path("auth/change_password/", ChangePasswordView.as_view()),
    path("create-supervisor/", AdminCreateSupervisorView.as_view()),
    path("placements/create/", AdminCreatePlacementView.as_view()),
    path("placements/", AdminPlacementListView.as_view()),
    path("placements/<int:pk>/", AdminPlacementDetailView.as_view()),
    path("placements/form-data/", AdminPlacementFormDataView.as_view()),
]