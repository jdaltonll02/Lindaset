from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    """Register a new user account"""
    data = request.data
    
    # Validation
    errors = {}
    
    # Required fields
    required_fields = ['username', 'email', 'password', 'firstName', 'lastName']
    for field in required_fields:
        if not data.get(field, '').strip():
            errors[field] = f'{field} is required'
    
    # Username validation
    username = data.get('username', '').strip()
    if len(username) < 3:
        errors['username'] = 'Username must be at least 3 characters'
    elif User.objects.filter(username=username).exists():
        errors['username'] = 'Username already exists'
    
    # Email validation
    email = data.get('email', '').strip()
    try:
        validate_email(email)
        if User.objects.filter(email=email).exists():
            errors['email'] = 'Email already registered'
    except ValidationError:
        errors['email'] = 'Invalid email format'
    
    # Password validation
    password = data.get('password', '')
    if len(password) < 6:
        errors['password'] = 'Password must be at least 6 characters'
    
    # Password confirmation
    if password != data.get('confirmPassword', ''):
        errors['confirmPassword'] = 'Passwords do not match'
    
    # Terms agreement
    if not data.get('agreeToTerms', False):
        errors['agreeToTerms'] = 'You must agree to the terms'
    
    if errors:
        return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create user
        user = User.objects.create(
            username=username,
            email=email,
            password=make_password(password),
            first_name=data.get('firstName', '').strip(),
            last_name=data.get('lastName', '').strip(),
            role=data.get('role', 'contributor'),
            location=data.get('location', '').strip(),
            is_active=True
        )
        
        # Store language preferences
        languages = data.get('languages', [])
        if languages:
            user.bio = f"Languages: {', '.join(languages)}"
            user.save()
        
        return Response({
            'message': 'Account created successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'firstName': user.first_name,
                'lastName': user.last_name,
                'role': user.role,
                'location': user.location
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response({
            'errors': {'submit': 'Registration failed. Please try again.'}
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([AllowAny])
def check_username(request):
    """Check if username is available"""
    username = request.data.get('username', '').strip()
    
    if not username:
        return Response({'available': False, 'message': 'Username is required'})
    
    if len(username) < 3:
        return Response({'available': False, 'message': 'Username must be at least 3 characters'})
    
    if User.objects.filter(username=username).exists():
        return Response({'available': False, 'message': 'Username already taken'})
    
    return Response({'available': True, 'message': 'Username is available'})

@api_view(['POST'])
@permission_classes([AllowAny])
def check_email(request):
    """Check if email is available"""
    email = request.data.get('email', '').strip()
    
    if not email:
        return Response({'available': False, 'message': 'Email is required'})
    
    try:
        validate_email(email)
    except ValidationError:
        return Response({'available': False, 'message': 'Invalid email format'})
    
    if User.objects.filter(email=email).exists():
        return Response({'available': False, 'message': 'Email already registered'})
    
    return Response({'available': True, 'message': 'Email is available'})