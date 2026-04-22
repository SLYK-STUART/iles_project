from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from .models import WeeklyLog, LogReview
from .serializers import WeeklyLogSerializer, LogReviewSerializer


class WeeklyLogViewSet(viewsets.ModelViewSet):
    queryset = WeeklyLog.objects.all()
    serializer_class = WeeklyLogSerializer


class LogReviewViewSet(viewsets.ModelViewSet):
    queryset = LogReview.objects.all()
    serializer_class = LogReviewSerializer