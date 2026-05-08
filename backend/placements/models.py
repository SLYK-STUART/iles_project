from django.db import models
from django.conf import settings
from decimal import Decimal
from django.core.exceptions import ValidationError

User = settings.AUTH_USER_MODEL


class Company(models.Model):
    name = models.CharField(max_length=200)
    address = models.TextField(blank=True, null=True)
    industry = models.CharField(max_length=100, blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class InternshipPlacement(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('ACTIVE', 'Active'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    student = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='student_placements'
    )
    company = models.ForeignKey(
        Company, on_delete=models.PROTECT, related_name='placements'
    )

    workplace_supervisor = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='workplace_supervisions'
    )
    academic_supervisor = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='academic_supervisions'
    )

    start_date = models.DateField()
    end_date = models.DateField()

    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='PENDING')

    description = models.TextField(blank=True, null=True)

    final_score = models.DecimalField(
        max_digits=5, decimal_places=2, blank=True, null=True,
        help_text="Combined final score (e.g. 40% AC + 60% WP)"
    )
    final_grade = models.CharField(max_length=10, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student} - {self.company}"

    def clean(self):
        if self.end_date <= self.start_date:
            raise ValidationError("End date must be after start date")

        overlapping = InternshipPlacement.objects.filter(
            student=self.student,
            status__in=["PENDING", "ACTIVE"],
            start_date__lt=self.end_date,
            end_date__gt=self.start_date
        ).exclude(id=self.id if self.id else None)

        if overlapping.exists():
            raise ValidationError("Student already has an overlapping placement")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def calculate_final_score(self):
        """Calculate combined score from Academic and Workplace evaluations"""
        try:
            ac_eval = self.evaluations.get(
                evaluation_type='AC_ACADEMIC', 
                status='SUBMITTED'
            )
            wp_eval = self.evaluations.get(
                evaluation_type='WP_PERFORMANCE', 
                status='SUBMITTED'
            )

            self.final_score = round(
                (ac_eval.total_score) + (wp_eval.total_score)
            )

            if self.final_score >= 80:
                self.final_grade = "A"
            elif self.final_score >= 70:
                self.final_grade = "B"
            elif self.final_score >= 60:
                self.final_grade = "C"
            elif self.final_score >= 50:
                self.final_grade = "D"
            else:
                self.final_grade = "F"

            self.save(update_fields=['final_score', 'final_grade'])
            return self.final_score

        except Exception:
            return None

    def get_ac_evaluation(self):
        return self.evaluations.filter(evaluation_type='AC_ACADEMIC').first()

    def get_wp_evaluation(self):
        return self.evaluations.filter(evaluation_type='WP_PERFORMANCE').first()