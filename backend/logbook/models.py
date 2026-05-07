from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta, time, datetime

User = settings.AUTH_USER_MODEL

# Create your models here.
class WeeklyLog(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    placement = models.ForeignKey(
        'placements.InternshipPlacement',
        on_delete=models.CASCADE,
        related_name='weekly_logs'
    )

    activities = models.TextField()
    challenges = models.TextField(blank=True, null=True)
    learning_outcomes = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=10,
        choices=STATUS_CHOICES,
        default='DRAFT'
    )

    submitted_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    week_start_date = models.DateField()
    week_end_date = models.DateField(editable=False)
    deadline = models.DateTimeField(editable=False)

    def __str__(self):
        return f"Week {self.week_start_date} - {self.placement}"
    
    def clean(self):
        from django.core.exceptions import ValidationError

        existing = WeeklyLog.objects.filter(
            placement=self.placement,
            week_start_date=self.week_start_date
        ).exclude(id=self.id)

        if existing.exists():
            raise ValidationError("Log for this week already exists")
        
        if self.placement.start_date and self.placement.end_date:
            if not (self.placement.start_date <= self.week_start_date <= self.placement.end_date):
                raise ValidationError("Week is outside placement period")
            
        if self.week_start_date.weekday() != 0:
            raise ValidationError("Week must start on Monday")
        
    def save(self, *args, **kwargs):
        self.week_end_date = self.week_start_date + timedelta(days=6)

        self.deadline = timezone.make_aware(
            datetime.combine(self.week_end_date, time(23, 59, 59))
        )

        if self.pk: 
            old = WeeklyLog.objects.get(pk=self.pk)
            if old.status != "SUBMITTED":
                if old.status != "DRAFT":
                    raise ValueError("Cannot edit log after submission")
            
        self.clean()
        super().save(*args, **kwargs)

class LogReview(models.Model):
    log = models.ForeignKey(
        WeeklyLog,
        on_delete=models.CASCADE,
        related_name='reviews'
    )

    reviewer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='log_reviews'
    )

    comment = models.TextField(blank=True, null=True)

    old_status = models.CharField(max_length=10)
    new_status = models.CharField(max_length=10)

    reviewed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.log} - {self.new_status}"