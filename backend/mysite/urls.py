from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    #JWT Auth
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),
    
    # Apps
    path('api/accounts/', include('accounts.urls')),
    path('api/logbook/', include('logbook.urls')),
    path("api/evaluations/", include("evaluations.urls")),
    path("api/admin/", include("placements.urls")),
]
