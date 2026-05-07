from rest_framework import serializers
from .models import InternshipPlacement, Company
from django.contrib.auth import get_user_model

User = get_user_model()


class InternshipPlacementSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.get_full_name", read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)

    workplace_supervisor_name = serializers.CharField(
        source="workplace_supervisor.get_full_name",
        read_only=True,
        allow_null=True,
    )

    academic_supervisor_name = serializers.CharField(
        source="academic_supervisor.get_full_name",
        read_only=True,
        allow_null=True,
    )

    class Meta:
        model = InternshipPlacement
        fields = [
            "id",
            "student",
            "student_name",
            "company",
            "company_name",
            "workplace_supervisor",
            "workplace_supervisor_name",
            "academic_supervisor",
            "academic_supervisor_name",
            "start_date",
            "end_date",
            "status",
            "description",
        ]

    def validate(self, data):
        student = data.get("student")
        start_date = data.get("start_date")
        end_date = data.get("end_date")

        wp = data.get("workplace_supervisor")
        ac = data.get("academic_supervisor")

        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError({
                "end_date": "End date must be after start date"
            })
 
        if student and student.role != "STUDENT":
            raise serializers.ValidationError({
                "student": "Selected user is not a student"
            })

        if wp and wp.role != "WP_SUP":
            raise serializers.ValidationError({
                "workplace_supervisor": "Invalid workplace supervisor"
            })

        if ac and ac.role != "AC_SUP":
            raise serializers.ValidationError({
                "academic_supervisor": "Invalid academic supervisor"
            })

        if student and start_date and end_date:
            overlapping = InternshipPlacement.objects.filter(
                student=student,
                start_date__lt=end_date,
                end_date__gt=start_date
            )
 
            if self.instance:
                overlapping = overlapping.exclude(id=self.instance.id)

            if overlapping.exists():
                raise serializers.ValidationError({
                    "student": "This student already has an overlapping placement"
                })

        return data