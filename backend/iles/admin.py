from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

# Register your models here.

class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets +( ('Role Information',{'fields':('roles',)}), )
admin.site.register(CustomUser,CustomUserAdmin)
