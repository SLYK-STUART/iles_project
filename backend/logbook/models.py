from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

# Create your models here.
class WeeklyLog(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
        ('REVIEWED', 'Reviewed'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
    )

    placement = models.ForeignKey(
        'placements.InternshipPlacement',
        on_delete=models.CASCADE,
        related_name='weekly_logs'
    )

    week_number = models.PositiveBigIntegerField()

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

    def __str__(self):
        return f"Week {self.week_number} - {self.placement}"
    
    def clean(self):
        from django.core.exceptions import ValidationError

        existing = WeeklyLog.objects.filter(
            placement=self.placement,
            week_number=self.week_number
        ).exclude(id=self.id)

        if existing.exists():
            raise ValidationError("Log for this week already exists")
        
        def save(self, *args, **kwargs):
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