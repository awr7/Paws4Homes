from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_user, name='login'),
    path('submit-dog-listing/', views.submit_dog_listing, name='submit_dog_listing'),
    path('logout/', views.logout_user, name='logout'),
    # ... other url patterns ...
]
