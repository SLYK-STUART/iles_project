from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class customLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only = True) #password never returned in response

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        user = authenticate(username=email, password=password)

        if not user:
            raise serializers.ValidationError("Invalid credentials")
        
        if not user.is_active:
            raise serializers.ValidationError("User is inactive")
        
        #generate tokens
        refresh = RefreshToken.for_user(user) #creates refresh and access tokens

        return {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "email": user.email,
            "role": user.role
        }