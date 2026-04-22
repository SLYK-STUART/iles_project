from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

# Create your models here.
#Base user manager is a django helper used to control how users are created and saved
class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Users must have an email")
        
        email = self.normalize_email(email) #from TEST@GMAIL.COM to test@gmail.com
        user = self.model(email=email, **extra_fields)
        user.set_password(password) #hash the password
        user.save()
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'ADMIN')

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must habe is_staff=True')
        
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True')

        return self.create_user(email, password, **extra_fields)
    
class CustomUser(AbstractUser):
    username = None #remove username field

    ROLE_CHOICES = (
        ('STUDENT', 'Student'),
        ('WP_SUP', 'Workplace Supervisor'),
        ('AC_SUP', 'Academic Supervisor'),
        ('ADMIN', 'Administrator'),
    ) 

    email = models.EmailField(unique=True)
    role = models.CharField(
        max_length=10, 
        choices=ROLE_CHOICES,
        default='STUDENT'
    )
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = CustomUserManager() #use my logic when creating users

    def __str__(self):
        return self.email 