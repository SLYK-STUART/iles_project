from django.db import models, transaction
from django.conf import settings
from django.utils import timezone
from django.core.exceptions import ValidationError

User = settings.AUTH_USER_MODEL


class EvaluationCriteria(models.Model):
    EVALUATOR_CHOICES = (
        ('WP_SUP', 'Workplace Supervisor'),
        ('AC_SUP', 'Academic Supervisor'),
        ('BOTH', 'Both'),
    )

    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    weight = models.DecimalField(max_digits=5, decimal_places=2)
    is_active = models.BooleanField(default=True)
    evaluator_role = models.CharField(
        max_length=10,
        choices=EVALUATOR_CHOICES,
        default='AC_SUP'
    )

    def __str__(self):
        return f"{self.name} ({self.weight}%)"

    class Meta:
        verbose_name_plural = "Evaluation Criteria"

    def clean(self):
        if self.weight <= 0:
            raise ValidationError("Weight must be greater than 0")


class Evaluation(models.Model):
    STATUS_CHOICES = (('DRAFT', 'Draft'), ('SUBMITTED', 'Submitted'))
    EVALUATION_TYPE_CHOICES = (
        ('WP_PERFORMANCE', 'Workplace Performance Evaluation'),
        ('AC_ACADEMIC', 'Academic Evaluation'),
    )

    placement = models.ForeignKey('placements.InternshipPlacement', on_delete=models.CASCADE, related_name='evaluations')
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='evaluations_given')
    evaluation_type = models.CharField(max_length=20, choices=EVALUATION_TYPE_CHOICES)
    total_score = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    comments = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='DRAFT')
    submitted_at = models.DateTimeField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('placement', 'evaluator')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.placement} - {self.evaluator} ({self.get_evaluation_type_display()})"

    def calculate_total_score(self):
        total = 0
        for item in self.items.select_related('criteria'):
            total += (item.score * item.criteria.weight) / 100
        return round(total, 2)

    def save(self, *args, **kwargs):
        if self.status == 'SUBMITTED' and not self.submitted_at:
            self.submitted_at = timezone.now()
        
        if self.pk:
            self.total_score = self.calculate_total_score()
            
        super().save(*args, **kwargs)

        if self.status == 'SUBMITTED':
            self.placement.calculate_final_score()


class EvaluationItem(models.Model):
    evaluation = models.ForeignKey(Evaluation, on_delete=models.CASCADE, related_name='items')
    criteria = models.ForeignKey(EvaluationCriteria, on_delete=models.PROTECT)
    score = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        unique_together = ('evaluation', 'criteria')

    def clean(self):
        if self.score < 0 or self.score > 100:
            raise ValidationError("Score must be between 0 and 100")