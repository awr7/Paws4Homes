from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone_number = models.CharField(max_length=20)
    company_name = models.CharField(max_length=255, blank=True, null=True)
    is_business_account = models.BooleanField(default=False)

class DogListing(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    breed = models.CharField(max_length=255)
    age = models.IntegerField()
    age_unit = models.CharField(max_length=20)
    color = models.CharField(max_length=50)
    size = models.CharField(max_length=50)
    bio = models.TextField(blank=True)
    gender = models.CharField(max_length=50)
    images = models.JSONField()  # Store image URLs or paths in JSON format
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

