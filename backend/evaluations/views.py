from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.utils import timezone
from django.db import transaction

from .models import Evaluation, EvaluationCriteria
from .serializers import EvaluationSerializer, EvaluationCriteriaSerializer, FinalEvaluationSerializer

from placements.models import InternshipPlacement
from logbook.models import WeeklyLog


class EvaluationCriteriaViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = EvaluationCriteriaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = EvaluationCriteria.objects.filter(is_active=True)

        if user.role == "WP_SUP":
            return queryset.filter(evaluator_role__in=['WP_SUP', 'BOTH'])
        elif user.role == "AC_SUP":
            return queryset.filter(evaluator_role__in=['AC_SUP', 'BOTH'])
        elif user.role == "ADMIN":
            return queryset

        return queryset.none()


class EvaluationViewSet(viewsets.ModelViewSet):
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "STUDENT":
            return Evaluation.objects.filter(placement__student=user)
        return Evaluation.objects.filter(evaluator=user)

    def perform_create(self, serializer):
        user = self.request.user
        placement = serializer.validated_data["placement"]

        if user.role not in ["WP_SUP", "AC_SUP"]:
            raise PermissionDenied("Only supervisors can create evaluations")

        if Evaluation.objects.filter(placement=placement, evaluator=user).exists():
            raise ValidationError("You already created an evaluation for this placement")

        if not WeeklyLog.objects.filter(placement=placement, status="APPROVED").exists():
            raise ValidationError("Cannot evaluate until at least one weekly log is approved")

        serializer.save()

    def perform_update(self, serializer):
        evaluation = self.get_object()
        if evaluation.status == "SUBMITTED":
            raise ValidationError("Submitted evaluation cannot be modified")
        serializer.save()

    @action(detail=True, methods=["POST"])
    def submit(self, request, pk=None):
        evaluation = self.get_object()

        if evaluation.evaluator != request.user:
            raise PermissionDenied("You can only submit your own evaluation")

        if evaluation.status == "SUBMITTED":
            return Response({"error": "Already submitted"}, status=400)

        evaluation.status = "SUBMITTED"
        evaluation.save()

        return Response({
            "message": "Evaluation submitted successfully",
            "total_score": evaluation.total_score
        })


class EvaluationPlacementView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, placement_id):
        try:
            placement = InternshipPlacement.objects.get(id=placement_id)
            user = request.user

            if user.role not in ["WP_SUP", "AC_SUP", "ADMIN"] and placement.student != user:
                return Response({"error": "Unauthorized"}, status=403)

            logs = WeeklyLog.objects.filter(placement=placement)
            evaluation = Evaluation.objects.filter(
                placement=placement, evaluator=user
            ).first()

            criteria = EvaluationCriteria.objects.filter(is_active=True)
            if user.role == "WP_SUP":
                criteria = criteria.filter(evaluator_role__in=['WP_SUP', 'BOTH'])
            elif user.role == "AC_SUP":
                criteria = criteria.filter(evaluator_role__in=['AC_SUP', 'BOTH'])

            return Response({
                "placement_id": placement.id,
                "student": {
                    "name": f"{placement.student.first_name} {placement.student.last_name}",
                    "email": placement.student.email,
                },
                "company": placement.company.name if placement.company else None,
                "start_date": placement.start_date,
                "end_date": placement.end_date,

                "weekly_logs": [
                    {
                        "week": l.week_start_date,
                        "activities": l.activities,
                        "status": l.status,
                        "challenges": l.challenges,
                        "learning_outcomes": l.learning_outcomes
                    } for l in logs
                ],

                "existing_evaluation": {
                    "exists": evaluation is not None,
                    "id": evaluation.id if evaluation else None,
                    "total_score": evaluation.total_score if evaluation else None,
                    "status": evaluation.status if evaluation else None,
                    "comments": evaluation.comments if evaluation else "",
                    "items": [
                        {"criteria": item.criteria.id, "score": item.score}
                        for item in (evaluation.items.all() if evaluation else [])
                    ]
                },

                "available_criteria": [
                    {
                        "id": c.id,
                        "name": c.name,
                        "weight": float(c.weight),
                        "description": c.description
                    } for c in criteria
                ]
            })

        except InternshipPlacement.DoesNotExist:
            return Response({"error": "Placement not found"}, status=404)
        

class FinalEvaluationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, placement_id):
        try:
            placement = InternshipPlacement.objects.get(id=placement_id)

            if (request.user.role not in ["ADMIN", "AC_SUP", "WP_SUP"] and 
                placement.student != request.user):
                return Response({"error": "Unauthorized"}, status=403)

            placement.calculate_final_score()

            serializer = FinalEvaluationSerializer(placement)
            return Response(serializer.data)

        except InternshipPlacement.DoesNotExist:
            return Response({"error": "Placement not found"}, status=404)