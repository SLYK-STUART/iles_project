from rest_framework import serializers
from datetime import timedelta
from django.utils import timezone

from .models import WeeklyLog, LogReview

class LogReviewSerializer(serializers.ModelSerializer):
    reviewer_name = serializers.SerializerMethodField()

    class Meta:
        model = LogReview
        fields = [
            "id",
            "log",
            "comment",
            "old_status",
            "new_status",
            "reviewed_at",
            "reviewer_name",
        ]
        read_only_fields = ["reviewed_at"]

    def get_reviewer_name(self, obj):
        try:
            return f"{obj.reviewer.first_name} {obj.reviewer.last_name}"
        except:
            return "Supervisor"

class WeeklyLogSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()

    reviews = LogReviewSerializer(many=True, read_only=True)

    class Meta:
        model = WeeklyLog
        fields = [
            "id",
            "placement_id",
            "week_start_date",
            "week_end_date",
            "deadline",
            "activities",
            "challenges",
            "learning_outcomes",
            "status",
            "submitted_at",
            "created_at",
            "student_name",
            "company_name",
            "reviews",
        ]
        read_only_fields = [
            "id",
            "week_end_date",
            "deadline",
            "submitted_at",
            "created_at",
            "status",
        ]

    def get_student_name(self, obj):
        try:
            student = obj.placement.student
            return f"{student.first_name} {student.last_name}".strip()
        except:
            return "Unknown Student"

    def get_company_name(self, obj):
        try:
            return obj.placement.company.name if obj.placement.company else "Unknown Company"
        except:
            return "Unknown Company"

    def validate(self, data):
        request = self.context.get("request")
        if not request or not request.user:
            raise serializers.ValidationError("Request context is missing.")

        user = request.user
        placement = user.student_placements.filter(status="ACTIVE").first()

        if not placement:
            raise serializers.ValidationError("You do not have an active placement.")

        week_start = data.get("week_start_date")
        if not week_start:
            raise serializers.ValidationError("week_start_date is required.")
 
        if week_start.weekday() != 0:
            raise serializers.ValidationError("Week must start on Monday.")
 
        today = timezone.now().date()
        current_monday = today - timedelta(days=today.weekday())

        if week_start != current_monday:
            raise serializers.ValidationError("You can only create a log for the current week.")
 
        if WeeklyLog.objects.filter(
            placement=placement,
            week_start_date=week_start
        ).exists():
            raise serializers.ValidationError("Log for this week already exists.")
 
        if placement.start_date and placement.end_date:
            if not (placement.start_date <= week_start <= placement.end_date):
                raise serializers.ValidationError("This week is outside your placement period.")

        return data

    def create(self, validated_data):
        request = self.context.get("request")
        user = request.user
        placement = user.student_placements.filter(status="ACTIVE").first()

        if not placement:
            raise serializers.ValidationError("You do not have an active placement.")
 
        validated_data.pop('placement', None)

        return WeeklyLog.objects.create(
            placement=placement,
            **validated_data
        )
