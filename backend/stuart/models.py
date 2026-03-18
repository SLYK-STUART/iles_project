from django.db import models

# Create your models here.
class Evaluation(models.Model):
    """
    Evaluation of a student's internship placement.
    Relationships (placement + evaluator) will be added later.
    """
    # Placeholder fields – will be replaced with ForeignKeys in next step
    placement_identifier = models.CharField(
        max_length=100,
        blank=True,
        help_text="Temporary string / ID of the placement (to be replaced)"
    )
    
    evaluator_identifier = models.CharField(
        max_length=100,
        blank=True,
        help_text="Temporary string / username or ID of the evaluator (to be replaced)"
    )
    
    # Actual evaluation content
    evaluated_at = models.DateTimeField(
        auto_now_add=True,
        help_text="When this evaluation was created"
    )
    
    status = models.CharField(
        max_length=20,
        default='draft',
        choices=[
            ('draft', 'Draft'),
            ('submitted', 'Submitted'),
            ('finalized', 'Finalized'),
        ]
    )
    
    overall_comments = models.TextField(
        blank=True,
        help_text="General comments / recommendations"
    )
    
    # Final result fields (will be filled automatically later)
    total_score = models.FloatField(
        null=True,
        blank=True,
        help_text="Computed weighted total score"
    )
    
    final_grade = models.CharField(
        max_length=5,
        blank=True,
        help_text="A, B+, B, C, etc. (computed later)"
    )

    class Meta:
        verbose_name = "Evaluation"
        verbose_name_plural = "Evaluations"
        ordering = ['-evaluated_at']

    def __str__(self):
        return f"Evaluation {self.id} – {self.status} – {self.evaluated_at.date()}"