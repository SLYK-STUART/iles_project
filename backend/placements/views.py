# views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from accounts.serializers import AdminCreateStudentSerializer, ChangePasswordSerializer, AdminCreateSupervisorSerializer
from rest_framework import status
from django.contrib.auth import get_user_model

from .models import InternshipPlacement, Company
from .serializers import InternshipPlacementSerializer

User = get_user_model()

class AdminCreateStudentView(APIView):
    permission_classes = [IsAdminUser, IsAuthenticated]

    def post(self, request):
        serializer = AdminCreateStudentSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response({
                "message": "Student created successfully",
                "student": {
                    "id": user.id,
                    "name": f"{user.first_name} {user.last_name}",
                    "email": user.email,
                    "temp_password": getattr(user, "temp_password", None)
                }
            })

        return Response(serializer.errors, status=400)
    
class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)

        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data["old_password"]
            new_password = serializer.validated_data["new_password"]

            if not user.check_password(old_password):
                return Response(
                    {"old_password": "Incorrect password"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.set_password(new_password)
            user.must_change_password = False
            user.save()
            

            return  Response({
                "message": "Password changed successfully"
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AdminCreateSupervisorView(APIView):
    permission_classes = [IsAdminUser, IsAuthenticated]

    def post(self, request):
        serializer = AdminCreateSupervisorSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.save()

            return Response({
                "message": "Supervisor created successfully",
                "user": {
                    "id": user.id,
                    "name": f"{user.first_name} {user.last_name}",
                    "email": user.email,
                    "role": user.role,
                    "temp_password": getattr(user, "temp_password", None)
                }
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AdminCreatePlacementView(APIView):
    permission_classes = [IsAdminUser, IsAuthenticated]

    def post(self, request):
        serializer = InternshipPlacementSerializer(data=request.data)

        if serializer.is_valid():
            placement = serializer.save()

            return Response({
                "message": "Placement created successfully",
                "placement": InternshipPlacementSerializer(placement).data
            }, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class AdminPlacementListView(APIView):
    permission_classes = [IsAdminUser, IsAuthenticated]

    def get(self, request):
        placements = InternshipPlacement.objects.all().order_by("-created_at")
        serializer = InternshipPlacementSerializer(placements, many=True)

        return Response({"placements": serializer.data})
    
class AdminPlacementDetailView(APIView):
    permission_classes = [IsAdminUser, IsAuthenticated]

    def get_object(self, pk):
        return InternshipPlacement.objects.get(id=pk)

    def get(self, request, pk):
        placement = self.get_object(pk)
        return Response(InternshipPlacementSerializer(placement).data)

    def patch(self, request, pk):
        placement = self.get_object(pk)
        serializer = InternshipPlacementSerializer(
            placement,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Placement updated", "placement": serializer.data})

        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        placement = self.get_object(pk)
        placement.delete()
        return Response({"message": "Placement deleted"})
    
class AdminPlacementFormDataView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        students = User.objects.filter(role="STUDENT", is_active=True)
        supervisors = User.objects.filter(role__in=["WP_SUP", "AC_SUP"], is_active=True)
        companies = Company.objects.all()

        return Response({
            "students": [
                {
                    "id": s.id,
                    "name": f"{s.first_name} {s.last_name}",
                }
                for s in students
            ],
            "supervisors": [
                {
                    "id": s.id,
                    "name": f"{s.first_name} {s.last_name}",
                    "role": s.role
                }
                for s in supervisors
            ],
            "companies": [
                {
                    "id": c.id,
                    "name": c.name
                }
                for c in companies
            ]
        })