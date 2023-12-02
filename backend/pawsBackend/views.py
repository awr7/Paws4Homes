from django.shortcuts import render
from pawsBackend.models import UserProfile, DogListing
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth import logout


@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('email')  
        password = data.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            auth_login(request, user) 
            user_profile = UserProfile.objects.get(user=user)
            is_business_account = user_profile.is_business_account if user_profile else False
            return JsonResponse({'success': True, 'isBusiness': is_business_account}, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def logout_user(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'success': 'Logged out successfully'}, status=200)

    return JsonResponse({'error': 'Invalid request'}, status=400)


@csrf_exempt  
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        re_password = data.get('rePassword')
        phone_number = data.get('phone')    
        company_or_full_name = data.get('companyNameOrFullName')  

        print(data)

        # Check if the passwords match
        if password != re_password:
            print("Passwords do not match")
            return JsonResponse({'error': 'Passwords do not match'}, status=400)

        # Check if the email is already in use
        if User.objects.filter(email=email).exists():
            print("Email is already in use")
            return JsonResponse({'error': 'Email is already in use'}, status=400)

        # Validate the password
        try:
            validate_password(password)
        except ValidationError as e:
            print(e.messages)
            return JsonResponse({'error': e.messages}, status=400)

        # Create the user account
        user = User.objects.create_user(username=email, email=email, password=password)

        # Decide how to store the company or full name
        if company_or_full_name:
            # If it's a business account
            UserProfile.objects.create(
                user=user, 
                phone_number=phone_number,
                company_name=company_or_full_name,
                is_business_account=True
            )
        else:
            # Handle as individual account
            first_name = data.get('firstname')
            last_name = data.get('lastname')
            user.first_name = first_name
            user.last_name = last_name
            user.save()
            UserProfile.objects.create(user=user, phone_number=phone_number)

        return JsonResponse({'success': 'User created successfully'}, status=201)

    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
def submit_dog_listing(request):
    if request.method == 'POST':
        print("Request = post")
        print(request.user)
        data = json.loads(request.body)

        # Perform checks for all required fields including the new ones
        required_fields = ['name', 'breed', 'age', 'ageUnit', 'color', 'size', 'bio', 'gender', 'images']
        for field in required_fields:
            if not data.get(field):
                return JsonResponse({'error': f'{field} is required'}, status=400)
        
        # Check if at least one image is uploaded
        images = data.get('images')
        if not images or not any(images):
            return JsonResponse({'error': 'At least one image is required'}, status=400)

        user = request.user  # Get the logged-in user
        
        # Create a new DogListing instance and save the data
        dog_listing = DogListing(
            user=user,
            name=data.get('name'),
            breed=data.get('breed'),
            age=data.get('age'),
            age_unit=data.get('ageUnit'),
            color=data.get('color'),
            size=data.get('size'),
            bio=data.get('bio'),
            gender=data.get('gender'),
            images=data.get('images')
        )
        print(data)
        dog_listing.save()

        return JsonResponse({'success': 'Dog listing created successfully'}, status=201)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)
