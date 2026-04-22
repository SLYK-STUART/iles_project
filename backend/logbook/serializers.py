from rest_framework import serializers
from .models import WeeklyLog, LogReview


class WeeklyLogSerializer(serializers.ModelSerializer):

    class Meta:
        model = WeeklyLog
        fields = '__all__'

    def validate_week_number(self, value):
        """
        Ensure week number is within internship range
        """

        if value < 1 or value > 12:
            raise serializers.ValidationError(
                "Week number must be between 1 and 12."
            )

        return value


    def update(self, instance, validated_data):
        """
        Prevent editing logs after approval
        """

        if instance.status == "APPROVED":
            raise serializers.ValidationError(
                "Approved logs cannot be edited."
            )

        return super().update(instance, validated_data)



class LogReviewSerializer(serializers.ModelSerializer):

    class Meta:
        model = LogReview
        fields = '__all__'