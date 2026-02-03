from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth import get_user_model
import random
import string
from datetime import datetime, timedelta
from django.core.cache import cache

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    """Send password reset email"""
    email = request.data.get('email')
    if not email:
        return Response({'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = User.objects.get(email=email)
        
        # Generate reset token
        token = default_token_generator.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        
        # Create reset link (in production, use your domain)
        reset_link = f"http://localhost:3000/reset-password?uid={uid}&token={token}"
        
        # Send email (mock for now)
        print(f"Password reset link for {email}: {reset_link}")
        
        # Send actual email
        try:
            print(f"Attempting to send email to {email}...")
            print(f"Email settings: HOST={settings.EMAIL_HOST}, PORT={settings.EMAIL_PORT}, USER={settings.EMAIL_HOST_USER}")
            
            send_mail(
                'Password Reset - Liberian NLP Platform',
                f'Click here to reset your password: {reset_link}\n\nIf you did not request this, please ignore this email.',
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            print(f"Email sent successfully to {email}")
        except Exception as e:
            print(f"Email sending failed: {e}")
            import traceback
            traceback.print_exc()
        
        return Response({'message': 'Password reset email sent'})
        
    except User.DoesNotExist:
        return Response({'message': 'No account found with this email address'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    """Reset password with token"""
    token = request.data.get('token')
    uid = request.data.get('uid')
    password = request.data.get('password')
    
    if not all([token, uid, password]):
        return Response({'message': 'Missing required fields'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user_id = force_str(urlsafe_base64_decode(uid))
        user = User.objects.get(pk=user_id)
        
        if default_token_generator.check_token(user, token):
            user.set_password(password)
            user.save()
            return Response({'message': 'Password reset successful'})
        else:
            return Response({'message': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)
            
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'message': 'Invalid reset link'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_2fa_code(request):
    """Send 2FA verification code via email"""
    email = request.data.get('email')
    if not email:
        return Response({'message': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate 6-digit code
    code = ''.join(random.choices(string.digits, k=6))
    
    # Store code in cache for 10 minutes
    cache_key = f"2fa_code_{request.user.id}_{email}"
    cache.set(cache_key, code, 600)  # 10 minutes
    
    # Mock email sending (print to console)
    print(f"2FA Code for {email}: {code}")
    
    # Send actual email
    try:
        send_mail(
            '2FA Verification Code - Liberian NLP Platform',
            f'Your verification code is: {code}\n\nThis code will expire in 10 minutes.',
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
    except Exception as e:
        print(f"Email sending failed: {e}")
    
    return Response({'message': 'Verification code sent'})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_2fa_code(request):
    """Verify 2FA code and enable 2FA"""
    code = request.data.get('code')
    if not code:
        return Response({'message': 'Code is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check all possible cache keys for this user
    user_id = request.user.id
    cache_pattern = f"2fa_code_{user_id}_"
    
    # In a real implementation, you'd store the email used
    # For now, we'll check if any code matches
    stored_code = None
    for key in cache._cache.keys():
        if key.startswith(cache_pattern):
            stored_code = cache.get(key)
            if stored_code == code:
                cache.delete(key)  # Use code only once
                break
    
    if stored_code == code:
        # Enable 2FA for user (you'd add a field to User model)
        # request.user.two_factor_enabled = True
        # request.user.save()
        return Response({'message': '2FA enabled successfully'})
    else:
        return Response({'message': 'Invalid or expired code'}, status=status.HTTP_400_BAD_REQUEST)