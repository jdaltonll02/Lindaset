from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, UserProfile, ConsentRecord


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""
    
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'preferred_languages']
    
    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email already registered")
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords don't match")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        preferred_languages = validated_data.pop('preferred_languages', [])
        
        user = User.objects.create_user(**validated_data)
        user.preferred_languages.set(preferred_languages)
        
        # Create profile
        UserProfile.objects.create(user=user)
        
        return user


class UserLoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    username = serializers.CharField()
    password = serializers.CharField()
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if username and password:
            # Try to authenticate with username first
            user = authenticate(username=username, password=password)
            
            # If username auth fails, try email
            if not user:
                try:
                    user_obj = User.objects.get(email=username)
                    user = authenticate(username=user_obj.username, password=password)
                except User.DoesNotExist:
                    pass
            
            if not user:
                raise serializers.ValidationError('Invalid credentials')
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled')
            attrs['user'] = user
        else:
            raise serializers.ValidationError('Must include username and password')
        
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile."""
    
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    role = serializers.CharField(source='user.role', read_only=True)
    reputation_score = serializers.FloatField(source='user.reputation_score', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = [
            'username', 'email', 'role', 'reputation_score',
            'bio', 'location', 'native_languages',
            'contribution_count', 'review_count'
        ]


class ConsentSerializer(serializers.ModelSerializer):
    """Serializer for consent records."""
    
    class Meta:
        model = ConsentRecord
        fields = ['consent_type', 'granted']
    
    def create(self, validated_data):
        request = self.context['request']
        validated_data['user'] = request.user
        validated_data['ip_address'] = request.META.get('REMOTE_ADDR', '')
        validated_data['user_agent'] = request.META.get('HTTP_USER_AGENT', '')
        
        # Update or create consent record
        consent, created = ConsentRecord.objects.update_or_create(
            user=validated_data['user'],
            consent_type=validated_data['consent_type'],
            defaults=validated_data
        )
        return consent


class UserSerializer(serializers.ModelSerializer):
    """Basic user serializer for public information."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'role', 'reputation_score', 'is_verified']
        read_only_fields = ['id', 'role', 'reputation_score', 'is_verified']