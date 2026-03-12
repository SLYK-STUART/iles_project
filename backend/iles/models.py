from django.db import models
from django.contrib.auth.models import AbstractUser


# Create your models here.
class CustomUser(AbstractUser):
    ROLES_CHOICES =[
        ('student','Student'),
        ('work supervisor','Work supervisor'),
        ('university supervisor','University supervisor'),
        ('admin','Admin')
    ]
    roles =models.CharField (
        max_length= 30,
        choices = ROLES_CHOICES,
        default= 'student '
  
    )
    def __str__(self):
        return f"{self.username}-{self.roles}"
