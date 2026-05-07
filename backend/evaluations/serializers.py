from rest_framework import serializers
from .models import Evaluation, EvaluationItem, EvaluationCriteria
from placements.models import InternshipPlacement

class EvaluationCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EvaluationCriteria
        fields = ['id', 'name', 'description', 'weight', 'evaluator_role', 'is_active']


class EvaluationItemSerializer(serializers.ModelSerializer):
    criteria_name = serializers.CharField(source="criteria.name", read_only=True)
    criteria_weight = serializers.DecimalField(
        source="criteria.weight", 
        max_digits=5, 
        decimal_places=2, 
        read_only=True
    )

    class Meta:
        model = EvaluationItem
        fields = ['id', 'criteria', 'criteria_name', 'criteria_weight', 'score']
        read_only_fields = ['criteria_name', 'criteria_weight']


class EvaluationSerializer(serializers.ModelSerializer):
    items = EvaluationItemSerializer(many=True, read_only=True)
    evaluator_name = serializers.SerializerMethodField()
    placement_info = serializers.SerializerMethodField()

    class Meta:
        model = Evaluation
        fields = [
            'id', 'placement', 'placement_info', 'evaluator', 'evaluator_name',
            'evaluation_type', 'status', 'total_score', 'comments',
            'submitted_at', 'items'
        ]
        read_only_fields = ['total_score', 'submitted_at', 'evaluator', 'evaluation_type']

    def get_evaluator_name(self, obj):
        return f"{obj.evaluator.first_name} {obj.evaluator.last_name}".strip() or obj.evaluator.email

    def get_placement_info(self, obj):
        return {
            "student_name": f"{obj.placement.student.first_name} {obj.placement.student.last_name}",
            "company": obj.placement.company.name if obj.placement.company else None,
        }

    def create(self, validated_data):
        items_data = self.context['request'].data.get('items', [])
        placement = validated_data.get('placement')

        user = self.context['request'].user
        evaluation_type = "WP_PERFORMANCE" if user.role == "WP_SUP" else "AC_ACADEMIC"

        evaluation = Evaluation.objects.create(
            evaluator=user,
            placement=placement,
            evaluation_type=evaluation_type,
            comments=validated_data.get('comments', ''),
            status='DRAFT'
        )

        for item in items_data:
            EvaluationItem.objects.create(
                evaluation=evaluation,
                criteria_id=item['criteria'],
                score=item['score']
            )

        return evaluation

class FinalEvaluationSerializer(serializers.ModelSerializer):
    ac_evaluation = serializers.SerializerMethodField()
    wp_evaluation = serializers.SerializerMethodField()
    student_name = serializers.SerializerMethodField()

    class Meta:
        model = InternshipPlacement
        fields = [
            'id', 'student_name', 'company', 'status',
            'ac_evaluation', 'wp_evaluation',
            'final_score', 'final_grade'
        ]

    def get_student_name(self, obj):
        return f"{obj.student.first_name} {obj.student.last_name}"

    def get_ac_evaluation(self, obj):
        eval_obj = obj.get_ac_evaluation()
        return EvaluationSerializer(eval_obj).data if eval_obj else None

    def get_wp_evaluation(self, obj):
        eval_obj = obj.get_wp_evaluation()
        return EvaluationSerializer(eval_obj).data if eval_obj else None
 
class EvaluationSubmitSerializer(serializers.Serializer):
    """Used when supervisor submits scores"""
    comments = serializers.CharField(required=False, allow_blank=True)
    items = serializers.ListField(
        child=serializers.DictField(),
        allow_empty=False
    )

    def validate_items(self, items):
        if not items:
            raise serializers.ValidationError("At least one score is required.")
        return items