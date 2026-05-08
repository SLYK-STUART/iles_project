from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvaluationViewSet, EvaluationCriteriaViewSet, EvaluationPlacementView

router = DefaultRouter()
router.register("evaluations", EvaluationViewSet, basename="evaluations")
router.register("criteria", EvaluationCriteriaViewSet, basename="criteria")

urlpatterns = [
    path("", include(router.urls)),
    path(
        "placements/<int:placement_id>/",
        EvaluationPlacementView.as_view(),
        name="evaluation-placement"
    ),
]