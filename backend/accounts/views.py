from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import customLoginSerializer
from .permissions import IsStudent
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth import get_user_model

from placements.models import InternshipPlacement
from logbook.models import WeeklyLog, LogReview

class CustomLoginView(APIView):

    def post(self, request):
        serializer = customLoginSerializer(data=request.data)

        if serializer.is_valid():
            return Response(serializer.validated_data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStudent] #protected view

    def get(self, request):
        user = request.user

        placement = InternshipPlacement.objects.filter(
            student=user,
            status="ACTIVE"
        ).select_related(
            "company",
            "academic_supervisor",
            "workplace_supervisor"
        ).first()

        logs = WeeklyLog.objects.filter(placement=placement)

        submitted = logs.count()
        pending = logs.filter(status="SUBMITTED").count()
        approved = logs.filter(status="APPROVED").count()
        rejected = logs.filter(status="REJECTED").count()

        activities = []

        recent_logs = WeeklyLog.objects.filter(
            placement=placement
        ).order_by("-created_at")[:5]

        for log in recent_logs:
            activities.append({
                "type": "log",
                "message": f"Week {log.week_number} log is created",
                "date": log.created_at,
            })

        reviews = LogReview.objects.filter(
            log__placement=placement
        ).order_by("-reviewed_at")[:5]

        for review in reviews:
            activities.append({
                "type": "review",
                "message": f"Log {log.week_number} {review.new_status.lower()} by supervisor",
                "date": review.reviewed_at,
            })

        activities = sorted(
            activities,
            key=lambda x: x["date"],
            reverse=True
        )[:5]

        student_profile = {
            "name":f"{request.user.first_name} {request.user.last_name}",
            "email": request.user.email,
            "phone": request.user.phone_number,
        }

        return Response({
            "message": f"Welcome {request.user.first_name} {request.user.last_name}",
            "email": request.user.email,
            "role": request.user.role,
            
            "placement": {
                "company": placement.company.name if placement else None,
                "start_date": placement.start_date if placement else None,
                "end_date": placement.end_date if placement else None,
                "academic_supervisor": (
                    f"{placement.academic_supervisor.first_name} {placement.academic_supervisor.last_name}"
                    if placement and placement.academic_supervisor else None,
                    
                ),
                "workplace_supervisor": (
                        f"{placement.workplace_supervisor.first_name} {placement.workplace_supervisor.last_name}"
                        if placement and placement.workplace_supervisor else None
                    ),
            },

            "progress": {
                "submitted": submitted,
                "approved": approved,
                "rejected": rejected,
                "pending": pending,
            },
            "recent_activity": activities,
            "student_profile": student_profile,
        })