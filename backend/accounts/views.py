from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import customLoginSerializer
from .permissions import IsStudent
from rest_framework.permissions import IsAuthenticated

class CustomLoginView(APIView):

    def post(self, request):
        serializer = customLoginSerializer(data=request.data)

        if serializer.is_valid():
            return Response(serializer.validated_data)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class StudentDashboardView(APIView):
    permission_classes = [IsAuthenticated, IsStudent] #protected view

    def get(self, request):
        return Response({
            "message": f"Welcome {request.user.first_name} {request.user.last_name}",
            "email": request.user.email,
            "role": request.user.role
        })