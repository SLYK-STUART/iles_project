from django.contrib import admin
from .models import LogReview, WeeklyLog


# Register your models here.
admin.site.register(WeeklyLog)
admin.site.register(LogReview)