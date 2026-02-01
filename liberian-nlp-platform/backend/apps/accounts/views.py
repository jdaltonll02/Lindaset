from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
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


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def login_view(request):
    """User login endpoint."""
    serializer = UserLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    user = serializer.validated_data['user']
    login(request, user)
    
    # Get or create token
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'user': UserSerializer(user).data,
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