from django.shortcuts import render, get_object_or_404

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import customLoginSerializer
from .permissions import IsStudent
from rest_framework.permissions import IsAuthenticated
from datetime import timedelta, date


from django.contrib.auth import get_user_model

from placements.models import InternshipPlacement
from logbook.models import WeeklyLog, LogReview
from evaluations.serializers import FinalEvaluationSerializer

class CustomLoginView(APIView):

    def post(self, request):
        serializer = customLoginSerializer(data=request.data)

        if serializer.is_valid():
            data = serializer.validated_data

            return Response({
                "access": data["access"],
                "role": data["role"],
                "must_change_password": data["must_change_password"],
                "user_id": data.get("user_id")
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

User = get_user_model()


class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStudent]

    def get(self, request):
        user = request.user
        today = date.today()
 
        placement = InternshipPlacement.objects.filter(
            student=user,
            status="ACTIVE"
        ).select_related(
            "company",
            "academic_supervisor",
            "workplace_supervisor"
        ).first()

        if not placement:
            return Response({"error": "No active placement found"}, status=404)
 
        logs = WeeklyLog.objects.filter(placement=placement)
         
        log_map = {log.week_start_date: log for log in logs}
 
        total_logs = logs.count()
        approved = logs.filter(status="APPROVED").count()
        submitted = logs.filter(status="SUBMITTED").count()
        rejected = logs.filter(status="REJECTED").count()
        pending = logs.filter(status="DRAFT").count()  
 
        start = placement.start_date
        start = start - timedelta(days=start.weekday())

        end = placement.end_date

        weeks = []
        total_weeks = 0
        completed_weeks = 0

        current = start
        while current <= end:
            week_end = current + timedelta(days=6)

            log = log_map.get(current)

            is_past = week_end < today
            is_current = current <= today <= week_end

            missed = False
            locked = False

            if not log and is_past:
                missed = True
                locked = True

            if log:
                completed_weeks += 1
                if log.status == "REJECTED":
                    display_status="DRAFT"
                else:
                    display_status = log.status

            weeks.append({
                "week_start": current.isoformat(),      
                "week_end": week_end.isoformat(),
                "status": log.status if log else "MISSING",
                "log_id": log.id if log else None,
                "has_log": bool(log),
                "is_current": is_current,
                "missed": missed,
                "locked": locked,
            })

            total_weeks += 1
            current += timedelta(days=7)

        
        placement.calculate_final_score()
        final_eval_serializer = FinalEvaluationSerializer(placement)

        activities = []
 
        recent_logs = WeeklyLog.objects.filter(placement=placement).order_by("-created_at")[:5]
        for log in recent_logs:
            activities.append({
                "type": "log",
                "message": f"Log for week {log.week_start_date} was created",
                "date": log.created_at,
            })
 
        recent_reviews = LogReview.objects.filter(
            log__placement=placement
        ).select_related("log").order_by("-reviewed_at")[:5]

        for review in recent_reviews:
            activities.append({
                "type": "review",
                "message": f"Week {review.log.week_start_date} log was {review.new_status.lower()} by supervisor",
                "date": review.reviewed_at,
            })
 
        activities = sorted(activities, key=lambda x: x["date"], reverse=True)[:5]
 
        student_profile = {
            "name": f"{user.first_name} {user.last_name}".strip(),
            "email": user.email,
            "phone": getattr(user, 'phone_number', None),
        }
 
        progress_percent = round((completed_weeks / total_weeks) * 100, 1) if total_weeks > 0 else 0

        return Response({
            "student_profile": student_profile,
            "placement": {
                "company": placement.company.name if placement.company else None,
                "start_date": placement.start_date,
                "end_date": placement.end_date,
                "academic_supervisor": (
                    f"{placement.academic_supervisor.first_name} {placement.academic_supervisor.last_name}".strip()
                    if placement.academic_supervisor else None
                ),
                "workplace_supervisor": (
                    f"{placement.workplace_supervisor.first_name} {placement.workplace_supervisor.last_name}".strip()
                    if placement.workplace_supervisor else None
                ),
            },
            "progress": {
                "total_weeks": total_weeks,
                "completed_weeks": completed_weeks,
                "percentage": progress_percent,
                "total_logs": total_logs,
                "submitted": submitted,
                "approved": approved,
                "rejected": rejected,
                "pending": pending,
            },
            "weeks": weeks,                  
            "recent_activity": activities,
            "evaluations": final_eval_serializer.data,
        })
    
class AdminUserListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self, request):
        if request.user.role != "ADMIN":
            return Response({"error": "Unauthorized"}, status=403)
        
        users = User.objects.all().order_by('-date_joined')

        user_data = []
        for user in users:
            user_data.append({
                "id": user.id,
                "email": user.email,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "role": user.role,
                "phone_number": user.phone_number,
                "is_active": user.is_active,
                "date_joined": user.date_joined.strftime("%Y-%m-%d %H:%M"),
                "last_login": user.last_login.strftime("%Y-%m-%d %H-%M") if user.last_login else None,
            })

        return Response({
            "total_users": users.count(),
            "users": user_data
        })

class AdminUserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _is_admin(self, user):
        return user.role == "ADMIN"
    
    def get(self, request, user_id):
        if not self._is_admin(request.user):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(User, id=user_id)

        return Response({
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "role": user.role,
            "phone_number": user.phone_number,
            "is_active": user.is_active,
            "date_joined": user.date_joined.strftime("%Y-%m-%d"),
        })

    def patch(self, request, user_id):
        if not self._is_admin(request.user):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(User, id=user_id)

        allowed_fields = ["first_name", "last_name", "phone_number", "is_active"]

        for field in allowed_fields:
            if field in request.data:
                setattr(user, field, request.data[field])

        user.save()

        return Response({
            "message": "User updated successfully",
            "is_active": user.is_active
        })

    def delete(self, request, user_id):
        if not self._is_admin(request.user):
            return Response({"error": "Unauthorized"}, status=status.HTTP_403_FORBIDDEN)

        user = get_object_or_404(User, id=user_id)
 
        if user.id == request.user.id:
            return Response(
                {"error": "You cannot delete your own account"},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.delete()

        return Response({
            "message": "User deleted successfully"
        }, status=status.HTTP_200_OK)