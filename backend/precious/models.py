from django.db import models
from django.conf import settings
from django.utils import timezone


class WeeklyLog(models.Model):

    class Status(models.TextChoices):
        DRAFT = "DRAFT", "Draft"
        SUBMITTED = "SUBMITTED", "Submitted"
        REVIEWED = "REVIEWED", "Reviewed"
        APPROVED = "APPROVED", "Approved"

    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="weekly_logs"
    )

    week_number = models.PositiveIntegerField()

    activities = models.TextField()
    challenges = models.TextField(blank=True, null=True)
    lessons_learned = models.TextField(blank=True, null=True)

    supervisor_comment = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )

    submitted_at = models.DateTimeField(blank=True, null=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("student", "week_number")
        ordering = ["-created_at"]

    def submit(self):
        if self.status == self.Status.DRAFT:
            self.status = self.Status.SUBMITTED
            self.submitted_at = timezone.now()
            self.save()

    def review(self):
        if self.status == self.Status.SUBMITTED:
            self.status = self.Status.REVIEWED
            self.reviewed_at = timezone.now()
            self.save()

    def approve(self):
        if self.status == self.Status.REVIEWED:
            self.status = self.Status.APPROVED
            self.save()

    def __str__(self):
        return f"Week {self.week_number} - {self.student}"

# Create your models here.
