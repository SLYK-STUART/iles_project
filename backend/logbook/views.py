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


class AcademicDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != "AC_SUP":
            return Response({"error": "Unauthorized"}, status=403)

        today = date.today()
 
        placements = InternshipPlacement.objects.filter(
            academic_supervisor=user
        ).select_related('student', 'company')

        placement_list = []
        total_logs = 0
        approved_total = 0
        submitted_total = 0
        rejected_total = 0

        evaluation_scores = []
        recent_logs = []

        for placement in placements:
            logs = WeeklyLog.objects.filter(placement=placement)

            approved = logs.filter(status="APPROVED").count()
            submitted = logs.filter(status="SUBMITTED").count()
            rejected = logs.filter(status="REJECTED").count()
            total = logs.count()

            total_logs += total
            approved_total += approved
            submitted_total += submitted
            rejected_total += rejected
 
            progress = 0
            if placement.start_date and placement.end_date:
                total_days = (placement.end_date - placement.start_date).days
                if total_days > 0:
                    days_passed = (today - placement.start_date).days
                    progress = min(max((days_passed / total_days) * 100, 0), 100)
 
            evaluation = Evaluation.objects.filter(
                placement=placement,
                evaluator=user
            ).first()

            eval_data = None
            if evaluation:
                score = float(evaluation.total_score) if evaluation.total_score else None
                if score is not None:
                    evaluation_scores.append(score)

                eval_data = {
                    "id": evaluation.id,
                    "score": score,
                    "status": evaluation.status
                }
 
            placement_data = {
                "placement_id": placement.id,
                "student_name": f"{placement.student.first_name} {placement.student.last_name}".strip(),
                "company": placement.company.name if placement.company else "N/A",
                "start_date": placement.start_date,
                "end_date": placement.end_date,
                "progress": round(progress, 1),

                "stats": {
                    "total_logs": total,
                    "approved": approved,
                    "submitted": submitted,
                    "rejected": rejected,
                },

                "evaluation": eval_data,
                "pending_evaluation": approved > 0 and not evaluation
            }

            placement_list.append(placement_data)
 
            for log in logs.order_by('-created_at')[:3]:
                recent_logs.append({
                    "id": log.id,
                    "week_start_date": log.week_start_date,
                    "week_end_date": log.week_end_date,
                    "status": log.status,
                    "student_name": placement_data["student_name"],
                    "placement_id": placement.id,
                    "created_at": log.created_at,
                })
 
        recent_logs = sorted(recent_logs, key=lambda x: x["created_at"], reverse=True)[:6]
 
        approval_rate = round((approved_total / total_logs * 100), 1) if total_logs > 0 else 0
        rejection_rate = round((rejected_total / total_logs * 100), 1) if total_logs > 0 else 0
        avg_score = round(sum(evaluation_scores) / len(evaluation_scores), 1) if evaluation_scores else 0

        return Response({
            "supervisor_name": f"{user.first_name} {user.last_name}".strip(),

            "stats": {
                "total_placements": placements.count(),
                "total_logs": total_logs,
                "approved_logs": approved_total,
                "submitted_logs": submitted_total,
                "rejected_logs": rejected_total,
            },

            "charts": {
                "approval_rate": approval_rate,
                "rejection_rate": rejection_rate,
                "average_score": avg_score,
            },

            "placements": placement_list,          
            "placements_preview": placement_list[:4], 

            "recent_logs": recent_logs,        
        })
    
User = get_user_model()

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != "ADMIN":
            return Response({"error": "Unauthorized"}, status=403)
 
        total_users = User.objects.count()
        total_students = User.objects.filter(role="STUDENT").count()
        total_ac_sup = User.objects.filter(role="AC_SUP").count()
        total_wp_sup = User.objects.filter(role="WP_SUP").count()
 
        total_companies = Company.objects.count()
 
        total_placements = InternshipPlacement.objects.count()
        active_placements = InternshipPlacement.objects.filter(status="ACTIVE").count()
        pending_placements = InternshipPlacement.objects.filter(status="PENDING").count()
        completed_placements = InternshipPlacement.objects.filter(status="COMPLETED").count()
        cancelled_placements = InternshipPlacement.objects.filter(status="CANCELLED").count()
 
        total_logs = WeeklyLog.objects.count()
        submitted_logs = WeeklyLog.objects.filter(status="SUBMITTED").count()
        approved_logs = WeeklyLog.objects.filter(status="APPROVED").count()
        rejected_logs = WeeklyLog.objects.filter(status="REJECTED").count()

        approval_rate = round(
            (approved_logs / total_logs) * 100, 1
        ) if total_logs > 0 else 0
 
        total_evaluations = Evaluation.objects.count()
 
        recent_users = User.objects.filter(
            date_joined__gte=timezone.now() - timedelta(days=7)
        ).order_by("-date_joined")[:5]

        recent_users_data = [
            {
                "id": u.id,
                "name": f"{u.first_name} {u.last_name}".strip() or u.email,
                "role": u.role,
                "joined": u.date_joined.strftime("%Y-%m-%d")
            }
            for u in recent_users
        ]
 
        students_without_placement = User.objects.filter(
            role="STUDENT"
        ).exclude(
            student_placements__status="ACTIVE"
        ).distinct().count() 

        return Response({
            "users": {
                "total": total_users,
                "students": total_students,
                "academic_supervisors": total_ac_sup,
                "workplace_supervisors": total_wp_sup,
            },

            "companies": total_companies,

            "placements": {
                "total": total_placements,
                "active": active_placements,
                "pending": pending_placements,
                "completed": completed_placements,
                "cancelled": cancelled_placements,
                "students_without_placement": students_without_placement,
            },

            "logs": {
                "total": total_logs,
                "submitted": submitted_logs,
                "approved": approved_logs,
                "rejected": rejected_logs,
                "approval_rate": approval_rate,
            },

            "evaluations": total_evaluations,

            "recent_users": recent_users_data,
        })
    
class WorkplaceDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role != "WP_SUP":
            return Response({"error": "Unauthorized"}, status=403)
 
        logs = WeeklyLog.objects.filter(
            placement__workplace_supervisor=user
        ).select_related(
            "placement",
            "placement__student",
            "placement__company"
        )
 
        total_students = logs.values('placement_id').distinct().count()
        pending_reviews = logs.filter(status="SUBMITTED").count()

        completed_evaluations = Evaluation.objects.filter(
            evaluator=user,
            status="SUBMITTED"
        ).count()
 
        students = []
        seen_placements = set()

        for log in logs:
            placement = log.placement
            if placement.id in seen_placements:
                continue
                
            seen_placements.add(placement.id)
            students.append({
                "placement_id": placement.id,
                "student_name": f"{placement.student.first_name} {placement.student.last_name}".strip(),
                "company": placement.company.name if placement.company else "N/A",
                "student_id": placement.student.id,
            })
 
        pending_logs = logs.filter(status="SUBMITTED").order_by('-submitted_at')[:10]

        pending_logs_data = [
            {
                "id": log.id,
                "week_start_date": log.week_start_date,
                "week_end_date": log.week_end_date,
                "student_name": f"{log.placement.student.first_name} {log.placement.student.last_name}".strip(),
                "status": log.status,
                "submitted_at": log.submitted_at,
                "placement_id": log.placement.id,
            }
            for log in pending_logs
        ]
 
        activities = []
 
        recent_logs = logs.order_by('-updated_at')[:8]
        for log in recent_logs:
            student_name = f"{log.placement.student.first_name} {log.placement.student.last_name}".strip()

            if log.status == "SUBMITTED":
                activities.append({
                    "type": "submission",
                    "message": f"{student_name} submitted log for week {log.week_start_date}",
                    "time": log.submitted_at or log.created_at,
                    "log_id": log.id
                })
            elif log.status == "APPROVED":
                activities.append({
                    "type": "approval",
                    "message": f"You approved {student_name}'s log for week {log.week_start_date}",
                    "time": log.updated_at,
                    "log_id": log.id
                })
            elif log.status == "REJECTED":
                activities.append({
                    "type": "rejection",
                    "message": f"You rejected {student_name}'s log for week {log.week_start_date}",
                    "time": log.updated_at,
                    "log_id": log.id
                })
 
        recent_evaluations = Evaluation.objects.filter(
            evaluator=user,
            status="SUBMITTED"
        ).select_related("placement__student").order_by('-submitted_at')[:6]

        for ev in recent_evaluations:
            student_name = f"{ev.placement.student.first_name} {ev.placement.student.last_name}".strip()
            activities.append({
                "type": "evaluation",
                "message": f"You completed evaluation for {student_name}",
                "time": ev.submitted_at,
                "evaluation_id": ev.id
            })
 
        activities = sorted(
            activities, 
            key=lambda x: x["time"] or timezone.now(), 
            reverse=True
        )[:8]

        return Response({
            "supervisor_name": f"{user.first_name} {user.last_name}".strip(),

            "stats": {
                "total_students": total_students,
                "pending_reviews": pending_reviews,
                "completed_evaluations": completed_evaluations,
            },

            "students": students,

            "pending_logs": pending_logs_data,

            "recent_activity": [
                {
                    **activity,
                    "time": activity["time"].isoformat() if activity.get("time") else None
                }
                for activity in activities
            ]
        })