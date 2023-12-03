from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login_user, name='login'),
    path('submit-dog-listing/', views.submit_dog_listing, name='submit_dog_listing'),
    path('logout/', views.logout_user, name='logout'),
    path('get-dog-listings/', views.get_dog_listings, name='get_dog_listings'),
    path('get-user-dog-listings/', views.get_user_dog_listings, name='get_user_dog_listings'),
    path('update-dog-listing/<int:listing_id>/', views.update_dog_listing, name='update_dog_listing'),
    path('delete-dog-listing/<int:listing_id>/', views.delete_dog_listing, name='delete_dog_listing'),
    path('get-dog-listing/<int:listing_id>/', views.get_dog_listing, name='get_dog_listing'),
    # ... other url patterns ...
]
