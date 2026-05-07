from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import WeeklyLog, LogReview
from .serializers import WeeklyLogSerializer, LogReviewSerializer


class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer


class LogReviewViewSet(viewsets.ModelViewSet):
    queryset = LogReview.objects.all()
    serializer_class = LogReviewSerializer

from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from django.db.models import Q
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from placements.models import InternshipPlacement, Company
from datetime import timedelta, date

from .models import WeeklyLog, LogReview
from .serializers import WeeklyLogSerializer, LogReviewSerializer

from evaluations.models import Evaluation



class WeeklyLogViewSet(viewsets.ModelViewSet):
    serializer_class = WeeklyLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
 
        if user.role == "STUDENT":
            return WeeklyLog.objects.filter(
                placement__student=user
            )
 
        if user.role in ["AC_SUP", "WP_SUP"]:
            return WeeklyLog.objects.filter(
                Q(placement__academic_supervisor=user) |
                Q(placement__workplace_supervisor=user)
            )
 
        return WeeklyLog.objects.all()

    def perform_create(self, serializer):
        user = self.request.user

        placement = user.student_placements.filter(status="ACTIVE").first()

        if not placement:
            raise permissions.PermissionDenied("You don't have an active placement")

        serializer.save(placement=placement)

    def perform_update(self, serializer):
        log = self.get_object()

        if log.placement.student != self.request.user:
            raise permissions.PermissionDenied("Not allowed")

        serializer.save()

    def perform_destroy(self, instance):
        if instance.status != "DRAFT":
            raise permissions.PermissionDenied("Cannot delete submitted logs")
        instance.delete()

    @action(detail=True, methods=["POST"])
    def submit(self, request, pk=None):
        log = self.get_object()

        if log.status != "DRAFT":
            return Response(
                {"error": "Only drafts can be submitted"},
                status=400
            )
        
        if log.deadline and timezone.now() > log.deadline:
            return Response(
                {"error": "submission deadline has passed for this week"},
                status=400
            )
        
        
        log.status = "SUBMITTED"
        log.submitted_at = timezone.now()
        log.save()

        return Response("Log Submitted successfully.")

    @action(detail=True, methods=["POST"])
    def review(self, request, pk=None):
        log = self.get_object()
        user = request.user

        if user.role not in ["AC_SUP", "WP_SUP"]:
            return Response({"error": "Only supervisors can review logs"}, status=403)

        if log.status != "SUBMITTED":
            return Response({"error": "Only submitted logs can be reviewed"}, status=400)

        action_type = request.data.get("action")
        comment = request.data.get("comment", "")

        if action_type not in ["approve", "reject"]:
            return Response({"error": "Invalid action"}, status=400)

        old_status = log.status
        log.status = "APPROVED" if action_type == "approve" else "REJECTED"
        log.save()

        LogReview.objects.create(
            log=log,
            reviewer=user,
            comment=comment,
            old_status=old_status,
            new_status=log.status,
        )

        return Response({"message": f"Log {log.status.lower()} successfully"})


class LogReviewViewSet(viewsets.ModelViewSet):
    serializer_class = LogReviewSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "STUDENT":
            return LogReview.objects.filter(
                log__placement__student=user
            )

        if user.role in ["AC_SUP", "WP_SUP"]:
            return LogReview.objects.filter(
                Q(log__placement__academic_supervisor=user) |
                Q(log__placement__workplace_supervisor=user)
            )

        return LogReview.objects.all()

    def perform_create(self, serializer):
        serializer.save(reviewer=self.request.user)
    