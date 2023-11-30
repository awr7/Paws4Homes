from django.shortcuts import render
from pawsBackend.models import UserProfile
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate

@csrf_exempt
def login(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('email')  # Using email as the username
        password = data.get('password')
        
        user = authenticate(username=username, password=password)
        if user is not None:
            # Login successful
            return JsonResponse({'success': True}, status=200)
        else:
            # Login failed
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt  # You should use CSRF tokens in production for security
def register(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        re_password = data.get('rePassword')
        phone_number = data.get('phone')    # Retrieve phone number
        company_or_full_name = data.get('companyNameOrFullName')  # Get company name or full name

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
