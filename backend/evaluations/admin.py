from django.contrib import admin
from .models import EvaluationCriteria, Evaluation, EvaluationItem

admin.site.register(EvaluationCriteria)
admin.site.register(Evaluation)
admin.site.register(EvaluationItem)