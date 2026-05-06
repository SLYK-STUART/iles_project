from rest_framework import serializers
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from placements.models import InternshipPlacement
from django.utils.crypto import get_random_string
from django.contrib.auth.password_validation import validate_password
from .models import CustomUser

class customLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only = True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials")
        
        if not user.is_active:
            raise serializers.ValidationError("User is inactive")
         
        refresh = RefreshToken.for_user(user)  

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "email": user.email,
            "role": user.role,
            "must_change_password": user.must_change_password,
            "user_id": user.id
        }

User = get_user_model()

class AdminCreateStudentSerializer(serializers.ModelSerializer):
    placement_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "placement_id",
        ]

    def create(self, validated_data):
        placement_id = validated_data.pop("placement_id", None)

        temp_password = get_random_string(length=8)

        user = User.objects.create_user(
            email=validated_data['email'],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
            password=temp_password,
        )

        user.role = "STUDENT"
        user.must_change_password = True
        user.save()

        if placement_id:
            try:
                placement = InternshipPlacement.objects.get(id=placement_id)
                placement.student = user
                placement.save()
            except InternshipPlacement.DoesNotExist:
                raise serializers.ValidationError({
                    "placement_id": "Invalid placement ID"
                })
            
        user.temp_password = temp_password

        return user
    
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)

    def validate_new_password(self, value):
        validate_password(value)
        return value



class AdminCreateSupervisorSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(
        choices=[
            ("WP_SUP", "Workplace Supervisor"),
            ("AC_SUP", "Academic Supervisor"),
        ]
    )

    class Meta:
        model = CustomUser
        fields = ["id", "first_name", "last_name", "email", "role"]

    def validate_email(self, value):
        if CustomUser.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists")
        return value

    def create(self, validated_data):
        temp_password = get_random_string(length=10)

        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=temp_password,
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),
        )

        user.role = validated_data["role"]
        user.must_change_password = True
        user.save()
 
        user.temp_password = temp_password

        return user