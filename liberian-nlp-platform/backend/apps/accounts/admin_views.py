from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from .serializers import UserSerializer

User = get_user_model()

def is_admin_or_superuser(user):
    """Check if user has admin privileges"""
    return hasattr(user, 'role') and user.role in ['admin', 'superuser']

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_users(request):
    """List all users or create a new user (admin/superuser only)"""
    if not is_admin_or_superuser(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        users = User.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        if not (hasattr(request.user, 'role') and request.user.role == 'superuser'):
            return Response({'error': 'Only superusers can create users'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            if 'password' in request.data:
                user.set_password(request.data['password'])
                user.save()
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_user_detail(request, user_id):
    """Get, update, or delete a specific user (admin/superuser only)"""
    if not is_admin_or_superuser(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = UserSerializer(user)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        if 'role' in request.data and not (hasattr(request.user, 'role') and request.user.role == 'superuser'):
            return Response({'error': 'Only superusers can change roles'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserSerializer(user, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if not (hasattr(request.user, 'role') and request.user.role == 'superuser'):
            return Response({'error': 'Only superusers can delete users'}, status=status.HTTP_403_FORBIDDEN)
        
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)