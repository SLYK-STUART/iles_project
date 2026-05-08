from django.contrib import admin
from .models import EvaluationCriteria, Evaluation, EvaluationItem


@admin.register(EvaluationCriteria)
class EvaluationCriteriaAdmin(admin.ModelAdmin):
    list_display = ('name', 'weight', 'evaluator_role', 'is_active', 'description_short')
    list_filter = ('evaluator_role', 'is_active')
    search_fields = ('name', 'description')
    ordering = ('name',)

    def description_short(self, obj):
        return (obj.description[:80] + '...') if obj.description and len(obj.description) > 80 else obj.description
    description_short.short_description = 'Description'
 
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'description', 'weight')
        }),
        ('Assignment & Status', {
            'fields': ('evaluator_role', 'is_active')
        }),
    )


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ('placement', 'evaluator', 'evaluation_type', 'status', 'total_score', 'submitted_at')
    list_filter = ('evaluation_type', 'status', 'evaluator__role')
    search_fields = ('placement__student__first_name', 'placement__student__last_name', 'evaluator__email')


@admin.register(EvaluationItem)
class EvaluationItemAdmin(admin.ModelAdmin):
    list_display = ('evaluation', 'criteria', 'score')
    list_filter = ('evaluation__evaluation_type',)