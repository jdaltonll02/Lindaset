from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django.contrib.auth.hashers import make_password
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from .models import User, UserProfile, ConsentRecord
from .serializers import (
    UserRegistrationSerializer, UserLoginSerializer,
    UserProfileSerializer, ConsentSerializer, UserSerializer
)


class RegisterView(generics.CreateAPIView):
    """User registration endpoint."""
    
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Create token
        token, created = Token.objects.get_or_create(user=user)
        
        return Response({
            'user': UserSerializer(user).data,
            'token': token.key
        }, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint."""
    from django.contrib.auth import authenticate
    from django.db.models import Q
    
    username_or_email = request.data.get('username')
    password = request.data.get('password')
    
    if not username_or_email or not password:
        return Response({
            'error': 'Username/email and password required'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Try to find user by username or email
    try:
        user_obj = User.objects.get(Q(username=username_or_email) | Q(email=username_or_email))
        username = user_obj.username
    except User.DoesNotExist:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    user = authenticate(username=username, password=password)
    
    if user is None:
        return Response({
            'error': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    if not user.is_active:
        return Response({
            'error': 'Account is disabled'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    # Get or create token
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser
        },
        'token': token.key
    })


@api_view(['POST'])
def logout_view(request):
    """User logout endpoint."""
    if request.user.is_authenticated:
        # Delete token
        try:
            request.user.auth_token.delete()
        except Token.DoesNotExist:
            pass
    
    return Response({'message': 'Logged out successfully'})


class ProfileView(generics.RetrieveUpdateAPIView):
    """User profile management."""
    
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        return profile


class ConsentView(generics.CreateAPIView):
    """Consent management endpoint."""
    
    serializer_class = ConsentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return ConsentRecord.objects.filter(user=self.request.user)


@api_view(['GET'])
def user_stats(request):
    """Get user contribution statistics."""
    if not request.user.is_authenticated:
        return Response({'error': 'Authentication required'}, 
                       status=status.HTTP_401_UNAUTHORIZED)
    
    profile = request.user.profile
    
    stats = {
        'contributions': profile.contribution_count,
        'reviews': profile.review_count,
        'reputation': request.user.reputation_score,
        'role': request.user.role,
        'languages': list(request.user.preferred_languages.values_list('name', flat=True))
    }
    
    return Response(stats)


class UserListView(generics.ListAPIView):
    """List users for leaderboard/directory."""
    
    queryset = User.objects.filter(is_active=True).order_by('-reputation_score')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        role = self.request.query_params.get('role')
        if role:
            queryset = queryset.filter(role=role)
        return queryset


# Admin-only views
class IsAdminUser(permissions.BasePermission):
    """Custom permission to only allow admin users."""
    
    def has_permission(self, request, view):
        return (request.user.is_authenticated and 
                hasattr(request.user, 'role') and
                request.user.role in ['admin', 'superuser'])


class AdminUserListView(generics.ListCreateAPIView):
    """Admin endpoint to list and create users."""
    
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        if 'password' in data:
            data['password'] = make_password(data['password'])
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Admin endpoint to manage individual users."""
    
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        data = request.data.copy()
        
        # Hash password if provided
        if 'password' in data:
            data['password'] = make_password(data['password'])
        
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)