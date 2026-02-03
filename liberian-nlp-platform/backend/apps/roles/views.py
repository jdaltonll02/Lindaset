from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Permission, CustomRole, UserRole
from .serializers import (
    PermissionSerializer, CustomRoleSerializer, 
    UserRoleSerializer, UserWithRolesSerializer
)

User = get_user_model()


class IsAdminOrSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.is_staff or request.user.is_superuser
        )


class IsSuperUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAdminOrSuperUser]


class CustomRoleViewSet(viewsets.ModelViewSet):
    queryset = CustomRole.objects.all()
    serializer_class = CustomRoleSerializer
    permission_classes = [IsAdminOrSuperUser]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return CustomRole.objects.all()
        # Admin users can only see non-admin roles
        return CustomRole.objects.filter(is_admin_role=False)
    
    def perform_create(self, serializer):
        # Only superuser can create admin roles
        if serializer.validated_data.get('is_admin_role', False) and not self.request.user.is_superuser:
            raise permissions.PermissionDenied("Only superuser can create admin roles")
        serializer.save()
    
    def perform_update(self, serializer):
        # Only superuser can edit admin roles
        if (serializer.instance.is_admin_role or 
            serializer.validated_data.get('is_admin_role', False)) and not self.request.user.is_superuser:
            raise permissions.PermissionDenied("Only superuser can edit admin roles")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only superuser can delete admin roles
        if instance.is_admin_role and not self.request.user.is_superuser:
            raise permissions.PermissionDenied("Only superuser can delete admin roles")
        instance.delete()


class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [IsAdminOrSuperUser]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_superuser:
            return UserRole.objects.all()
        # Admin users can only see assignments for non-admin roles
        return UserRole.objects.filter(role__is_admin_role=False)
    
    def perform_create(self, serializer):
        role = serializer.validated_data['role']
        # Only superuser can assign admin roles
        if role.is_admin_role and not self.request.user.is_superuser:
            raise permissions.PermissionDenied("Only superuser can assign admin roles")
        serializer.save()
    
    def perform_destroy(self, instance):
        # Only superuser can remove admin role assignments
        if instance.role.is_admin_role and not self.request.user.is_superuser:
            raise permissions.PermissionDenied("Only superuser can remove admin role assignments")
        instance.delete()
    
    @action(detail=False, methods=['get'])
    def users_with_roles(self, request):
        users = User.objects.prefetch_related('custom_roles__role').all()
        serializer = UserWithRolesSerializer(users, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def assign_role(self, request):
        user_id = request.data.get('user_id')
        role_id = request.data.get('role_id')
        
        try:
            user = User.objects.get(id=user_id)
            role = CustomRole.objects.get(id=role_id)
            
            # Only superuser can assign admin roles
            if role.is_admin_role and not request.user.is_superuser:
                return Response(
                    {'error': 'Only superuser can assign admin roles'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user_role, created = UserRole.objects.get_or_create(
                user=user, role=role,
                defaults={'assigned_by': request.user}
            )
            
            if created:
                serializer = UserRoleSerializer(user_role)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            else:
                return Response(
                    {'error': 'User already has this role'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (User.DoesNotExist, CustomRole.DoesNotExist):
            return Response(
                {'error': 'User or role not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['delete'])
    def remove_role(self, request):
        user_id = request.data.get('user_id')
        role_id = request.data.get('role_id')
        
        try:
            user_role = UserRole.objects.get(user_id=user_id, role_id=role_id)
            
            # Only superuser can remove admin role assignments
            if user_role.role.is_admin_role and not request.user.is_superuser:
                return Response(
                    {'error': 'Only superuser can remove admin role assignments'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            user_role.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except UserRole.DoesNotExist:
            return Response(
                {'error': 'Role assignment not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )