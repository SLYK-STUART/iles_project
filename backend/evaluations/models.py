from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

# Create your models here.
class EvaluationCriteria(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name
    
class Evaluation(models.Model):
    STATUS_CHOICES = (
        ('DRAFT', 'Draft'),
        ('SUBMITTED', 'Submitted'),
    )

    placement = models.ForeignKey(
        'placements.InternshipPlacement',
        on_delete=models.CASCADE,
        related_name='evaluations'
    )

    evaluator = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='evaluations_given'
    )

    total_score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        blank=True,
        null=True
    )

    comments = models.TextField(blank=True, null=True)

    status = models.CharField(
        max_length=10,
        choices = STATUS_CHOICES,
        default='DRAFT'
    )

    submitted_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.placement} - {self.evaluator}"
    
    class Meta:
        unique_together = ('placement', 'evaluator')

    def calculate_total_score(self):
        total = 0
        items = self.items.select_related('criteria')

        for item in items:
         total += (item.score * item.criteria.weight) / 100

        return total
    
    def save(self, *args, **kwargs):
        if self.status == 'SUBMITTED':
            self.total_score = self.calculate_total_score()

        super().save(*args, **kwargs)

class EvaluationItem(models.Model):
    evaluation = models.ForeignKey(
        Evaluation,
        on_delete=models.CASCADE,
        related_name='items'
    )

    criteria = models.ForeignKey(
        EvaluationCriteria,
        on_delete=models.PROTECT
    )

    score = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.criteria} - {self.score}"
    
    class Meta:
        unique_together = ('evaluation', 'criteria')

