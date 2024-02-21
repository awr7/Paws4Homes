from pawsBackend.models import UserProfile, DogListing
import json
from django.http import JsonResponse, HttpResponseBadRequest, HttpResponseNotAllowed
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.contrib.auth import authenticate, login as auth_login
from django.contrib.auth import logout
from .models import DogListing, AdoptionApplication, Message
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.conf import settings
import logging
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.core.files.storage import default_storage
from .recommendations import get_matching_breeds
from .utilities import standardize_breed

logger = logging.getLogger(__name__)

@csrf_exempt
def login_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        username = data.get('email')
        password = data.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            token, _ = Token.objects.get_or_create(user=user)
            user_profile = UserProfile.objects.get(user=user)
            is_business_account = user_profile.is_business_account if user_profile else False
            return JsonResponse({
                'success': True,
                'token': token.key,
                'isBusiness': is_business_account,
                'userId': user.id
            }, status=200)
        else:
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

    return JsonResponse({'error': 'Invalid request'}, status=400)




@csrf_exempt
@api_view(['POST'])
def logout_user(request):
    if request.auth:
        request.auth.delete()
    return JsonResponse({'success': 'Logged out successfully'}, status=200)



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
@api_view(['POST', 'PUT'])
@permission_classes([IsAuthenticated])
def submit_dog_listing(request):
    print(f"Request method: {request.method}")
    print(f"Is user authenticated? {request.user.is_authenticated}")
    print(f"User: {request.user}")

    if request.method == 'POST':
        data = json.loads(request.body)

        # Log the data received in the request body
        print(f"Request data: {data}")

        # Perform checks for all required fields including the new ones
        required_fields = ['name', 'breed', 'age', 'ageUnit', 'color', 'size', 'bio', 'gender', 'images']
        for field in required_fields:
            if not data.get(field):
                error_message = f"{field} is required"
                print(f"Error: {error_message}")
                return JsonResponse({'error': error_message}, status=400)
        
        # Check if at least one image is uploaded
        images = data.get('images')
        if not images or not any(images):
            error_message = 'At least one image is required'
            print(f"Error: {error_message}")
            return JsonResponse({'error': error_message}, status=400)

        user = request.user  # Get the logged-in user
        print(f"User ID: {getattr(user, 'id', 'No user id')}")  # This will print user id or 'No user id' if it's not available
        
        # Check if the user is authenticated
        if not user.is_authenticated:
            print("Error: The user is not authenticated.")
            return JsonResponse({'error': 'You must be logged in to submit a listing.'}, status=401)

        try:
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
            dog_listing.save()
            print("Dog listing created successfully.")
            return JsonResponse({'success': 'Dog listing created successfully'}, status=201)
        except Exception as e:
            # Catch any exceptions and print them out
            print(f"An error occurred: {e}")
            return JsonResponse({'error': str(e)}, status=500)
    else:
        print("Error: Invalid request method.")
        return JsonResponse({'error': 'Invalid request'}, status=400)

    
def get_dog_listings(request):
    if request.method == 'GET':
        listings = DogListing.objects.all()  
        listings_data = [{
            'id': listing.id,
            'name': listing.name,
            'breed': listing.breed,
            'age': listing.age,
            'age_unit': listing.age_unit,
            'color': listing.color,
            'size': listing.size,
            'bio': listing.bio,
            'gender': listing.gender,
            'images': listing.images,  
        } for listing in listings]
        return JsonResponse(listings_data, safe=False)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_dog_listings(request):
    if request.method == 'GET':
        # Filter listings by the logged-in user
        user_listings = DogListing.objects.filter(user=request.user)
        listings_data = [{
            'id': listing.id,
            'name': listing.name,
            'breed': listing.breed,
            'age': listing.age,
            'age_unit': listing.age_unit,
            'color': listing.color,
            'size': listing.size,
            'bio': listing.bio,
            'gender': listing.gender,
            'images': listing.images,  
        } for listing in user_listings]
        return JsonResponse(listings_data, safe=False)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_dog_listing(request, listing_id):
    if request.method == 'PUT':
        data = json.loads(request.body)
        try:
            dog_listing = DogListing.objects.get(id=listing_id, user=request.user)
            # Update fields
            for field, value in data.items():
                setattr(dog_listing, field, value)
            dog_listing.save()
            return JsonResponse({'success': 'Listing updated successfully'}, status=200)
        except DogListing.DoesNotExist:
            return JsonResponse({'error': 'Listing not found'}, status=404)

    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_dog_listing(request, listing_id):
    if request.method == 'DELETE':
        try:
            dog_listing = DogListing.objects.get(id=listing_id, user=request.user)
            dog_listing.delete()
            return JsonResponse({'success': 'Listing deleted successfully'}, status=200)
        except DogListing.DoesNotExist:
            return JsonResponse({'error': 'Listing not found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)

def get_dog_listing(request, listing_id):
    if request.method == 'GET':
        try:
            listing = DogListing.objects.get(id=listing_id)
            listing_data = {
                'id': listing.id,
                'name': listing.name,
                'breed': listing.breed,
                'age': listing.age,
                'age_unit': listing.age_unit,
                'color': listing.color,
                'size': listing.size,
                'bio': listing.bio,
                'gender': listing.gender,
                'images': listing.images, 
                'date_added': listing.date_added.strftime("%m-%d-%Y")  
            }
            return JsonResponse(listing_data)
        except DogListing.DoesNotExist:
            return JsonResponse({'error': 'Listing not found'}, status=404)
    else:
        return JsonResponse({'error': 'Invalid request'}, status=400)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_details(request):
    user = request.user
    user_profile = UserProfile.objects.get(user=user)

    return JsonResponse({
        'first_name': user.first_name,
        'last_name': user.last_name,
        'email': user.email,
        'phone_number': user_profile.phone_number
    })

@csrf_exempt
def create_adoption_application(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        # Fetch the DogListing object using the dogID
        dog_id = data.get('dogID')
        try:
            dog = DogListing.objects.get(id=dog_id)
        except DogListing.DoesNotExist:
            return JsonResponse({'error': 'Dog not found'}, status=404)

        # Create the AdoptionApplication object
        application = AdoptionApplication.objects.create(
            dog=dog,  
            user=request.user,  
            first_name=data['firstName'],
            last_name=data['lastName'],
            email=data['email'],
            phone_number=data['phone'],
            why_adopt=data['whyAdopt'],
            alone_time=data['aloneTime'],
            house_type=data['houseType'],
            home_owner=data['homeOwner'],
            owned_dog_before=data['dogOwner'],
            additional_note=data.get('additionalNote', '')  
        )

        application_id = application.id  
        application_url = f"/applications/{application_id}"  

        initial_message_content = f"New adoption application from {request.user.username} for {dog.name}. <a href='{application_url}'>Click here to view the application.</a>"
        Message.objects.create(
            sender=request.user,
            receiver=dog.user,
            content=initial_message_content
        )

        return JsonResponse({'success': 'Application submitted successfully'})
    
    return JsonResponse({'error': 'Invalid request'}, status=400)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_message(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            receiver_id = data['receiver']
            content = data['content']

            if not receiver_id or not content:
                return JsonResponse({'error': 'Missing reciever or content'}, status =400)

            sender = request.user  # Use the authenticated user as the sender
            receiver = User.objects.get(id=receiver_id)

            message = Message.objects.create(
                sender=sender,
                receiver=receiver,
                content=content
            )
            return JsonResponse({'success': 'Message sent successfully'}, status=200)

        except User.DoesNotExist:
            return JsonResponse({'error': 'Receiver not found'}, status=404)
        except json.JSONDecodeError as e:
            return JsonResponse({'error': 'Invalid JSON: ' + str(e)}, status=400)
        except Exception as e:
            print("Error in send_message:", e)
            return JsonResponse({'error': str(e)}, status=500)

    return JsonResponse({'error': 'Invalid request method'}, status=400)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_messages(request, user_id=None):
    user = request.user

    # Decide the query based on whether a specific user_id is given
    messages = (Message.objects
                .filter(Q(sender=user) & Q(receiver_id=user_id) | Q(sender_id=user_id) & Q(receiver=user))
                .order_by('-timestamp') if user_id else
                Message.objects
                .filter(Q(sender=user) | Q(receiver=user))
                .order_by('-timestamp'))

    messages_data = []
    for message in messages:
        sender_profile = UserProfile.objects.get(user=message.sender)

        # Decide the sender's name based on account type
        sender_name = sender_profile.company_name if sender_profile.is_business_account else f"{message.sender.first_name} {message.sender.last_name}"

        message_data = {
            'id': message.id,
            'sender_id': message.sender.id,
            'receiver_id': message.receiver.id,
            'sender_name': sender_name,
            'content': message.content,
            'timestamp': message.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            'is_read': message.is_read,
        }

        # If a specific user_id is provided, add the profile image of the receiver
        if user_id:
            # The receiver is the other person in the conversation
            receiver = message.receiver if message.sender == user else message.sender
            receiver_profile = UserProfile.objects.get(user=receiver)

            # Get the full URL for the receiver's profile image
            receiver_profile_pic = request.build_absolute_uri(settings.STATIC_URL + receiver_profile.profile_image)
            message_data['receiver_profile_pic'] = receiver_profile_pic

        messages_data.append(message_data)

    return JsonResponse(messages_data, safe=False, status=200)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_adoption_application(request, application_id):
    # Fetch the application, or return 404 if not found
    application = get_object_or_404(AdoptionApplication, pk=application_id)

    dog = application.dog

    owner_profile = UserProfile.objects.get(user=dog.user)

    application_data = {
        "id": application.id,
        "applicant_id": application.user.id,
        "dog": {
            "id": dog.id,
            "user_id": dog.user.id,
            "name": dog.name,
            "breed": dog.breed,
            "age": dog.age,
            "age_unit": dog.age_unit,
            "color": dog.color,
            "size": dog.size,
            "bio": dog.bio,
            "gender": dog.gender,
            "images": dog.images,
            "date_added": dog.date_added.strftime("%Y-%m-%d %H:%M:%S")
        },

        "owner_contact_info": {
            "email": dog.user.email,
            "phone_number": owner_profile.phone_number
        },

        "first_name": application.first_name,
        "last_name": application.last_name,
        "email": application.email,
        "phone_number": application.phone_number,
        "why_adopt": application.why_adopt,
        "alone_time": application.alone_time,
        "house_type": application.house_type,
        "home_owner": application.home_owner,
        "owned_dog_before": application.owned_dog_before,
        "additional_note": application.additional_note
    }

    return JsonResponse(application_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile(request, user_id):
    user = get_object_or_404(User, pk=user_id)
    user_profile = get_object_or_404(UserProfile, user=user)
    
    profile_image_url = settings.STATIC_URL + user_profile.profile_image

    data = {
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'phone_number': user_profile.phone_number,
        'company_name': user_profile.company_name,
        'is_business_account': user_profile.is_business_account,
        'profile_image': request.build_absolute_uri(profile_image_url)
    }
    return JsonResponse(data)

@csrf_exempt
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def mark_messages_as_read(request, receiver_id):
    # Mark all messages in the conversation as read
    Message.objects.filter(sender_id=receiver_id, receiver=request.user, is_read=False).update(is_read=True)
    return JsonResponse({'success': True})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unread_message_count(request):
    # Check if the user is authenticated
    if request.user.is_authenticated:
        logger.info(f"User {request.user.username} is authenticated.")
        unread_count = Message.objects.filter(receiver=request.user, is_read=False).count()
        return JsonResponse({'unread_count': unread_count})
    else:
        # This means the user is not authenticated
        logger.warning("User is not authenticated.")
        return JsonResponse({'error': 'User is not authenticated'}, status=401)

@csrf_exempt
@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def user_profile_update(request, user_id):
    print('request user id', request.user.id, ' user_id=', user_id)

    if request.method != 'PUT':
        return HttpResponseNotAllowed(['PUT'])
    
    user_id = int(user_id)


    try:
        data = json.loads(request.body)
        
        if request.user.id != user_id:
            return JsonResponse({'status': 'error', 'message': 'Unauthorized'}, status=403)

        user = User.objects.get(pk=user_id)
        profile, created = UserProfile.objects.get_or_create(user=user)

        # Update User fields
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.save()

        # Update UserProfile fields
        if profile.is_business_account:
            profile.company_name = data.get('company_name', profile.company_name)
        profile.phone_number = data.get('phone_number', profile.phone_number)
        profile.save()

        return JsonResponse({'status': 'success', 'message': 'Profile updated successfully.'})

    except User.DoesNotExist:
        return JsonResponse({'status': 'error', 'message': 'User not found.'}, status=404)
    except json.JSONDecodeError:
        return JsonResponse({'status': 'error', 'message': 'Invalid JSON format.'}, status=400)
    except Exception as e:
        # Log the exception for debugging purposes
        # e.g., logger.error(f"Error updating user profile: {str(e)}")
        return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        new_password = data.get('newPassword')

        # Validate the new password
        try:
            validate_password(new_password)
        except ValidationError as e:
            return JsonResponse({'error': e.messages}, status=400)

        try:
            user = request.user
            user.set_password(new_password)
            user.save()

            # Invalidate the current session after changing the password
            logout(request)

            return JsonResponse({'success': 'Password changed successfully. Please log in again.'})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
        
@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def upload_profile_picture(request):
    if request.method == 'POST' and request.FILES['image']:
        image = request.FILES['image']
        file_path = default_storage.save('path/to/save/image', image)
        
        # Update the user's profile picture URL in the database
        user_profile = UserProfile.objects.get(user=request.user)
        user_profile.profile_image = file_path
        user_profile.save()

        return JsonResponse({'success': True, 'image_url': file_path})
    
    return JsonResponse({'error': 'Invalid request'}, status=400)

@api_view(['POST'])
@csrf_exempt
def match_dog(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        print("Received match_dog request with data:", data)

        user_preferences = {key: data.get(key) for key in [
            'activityLevel', 'dailyTime', 'sizePreference', 'otherPets',
            'preferredAge', 'childrenAtHome', 'furPreference', 'sheddingTolerance',
            'livingSituation', 'lookingFor'
        ]}

        print("User preferences:", user_preferences)

        matching_breeds = get_matching_breeds(user_preferences)
        print("Matching breeds before standardization:", matching_breeds)

        all_breeds_in_db = DogListing.objects.values_list('breed', flat=True).distinct()
        print("Breeds in DB:", list(all_breeds_in_db))

        validated_breeds = []
        for db_breed in all_breeds_in_db:
            standardized_breed = standardize_breed(db_breed, matching_breeds)
            if standardized_breed:
                validated_breeds.append(db_breed)
        
        print("Validated breeds for query:", validated_breeds)

        matching_dogs = DogListing.objects.filter(breed__in=validated_breeds)[:3]
        print("Matching dogs query:", matching_dogs.query)

        response_data = {
            'matchedBreeds': matching_breeds[:5],
            'dogs': [{
                'id': dog.id, 
                'name': dog.name, 
                'breed': dog.breed,
                'age': dog.age, 
                'age_unit': dog.age_unit,
                'color': dog.color, 
                'size': dog.size,
                'bio': dog.bio, 
                'images': dog.images if dog.images else None
            } for dog in matching_dogs]
        }

        if response_data['dogs']:
            print("Matching dogs found, sending response.")
            return JsonResponse(response_data, safe=False)
        else:
            print("No matching dogs found after standardization.")
            return JsonResponse({'error': 'No matching dogs found', 'matchedBreeds': response_data['matchedBreeds']}, status=404)
    else:
        print("Invalid request method for match_dog.")
        return JsonResponse({'error': 'Invalid request'}, status=400)