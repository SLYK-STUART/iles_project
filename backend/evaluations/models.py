from django.db import models
from django.conf import settings

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
        User,
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
