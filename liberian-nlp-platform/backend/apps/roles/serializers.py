from rest_framework import serializers
from .models import Permission, CustomRole, UserRole
from django.conf import settings


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'codename', 'description', 'category', 'created_at']


class CustomRoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.ListField(
        child=serializers.UUIDField(), write_only=True, required=False
    )
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    user_count = serializers.SerializerMethodField()
    
    class Meta:
        model = CustomRole
        fields = [
            'id', 'name', 'description', 'permissions', 'permission_ids',
            'is_admin_role', 'created_by_username', 'user_count',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_user_count(self, obj):
        return obj.user_assignments.count()
    
    def create(self, validated_data):
        permission_ids = validated_data.pop('permission_ids', [])
        validated_data['created_by'] = self.context['request'].user
        role = super().create(validated_data)
        if permission_ids:
            role.permissions.set(permission_ids)
        return role
    
    def update(self, instance, validated_data):
        permission_ids = validated_data.pop('permission_ids', None)
        role = super().update(instance, validated_data)
        if permission_ids is not None:
            role.permissions.set(permission_ids)
        return role


class UserRoleSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    role_name = serializers.CharField(source='role.name', read_only=True)
    assigned_by_username = serializers.CharField(source='assigned_by.username', read_only=True)
    
    class Meta:
        model = UserRole
        fields = [
            'id', 'user', 'username', 'role', 'role_name',
            'assigned_by_username', 'assigned_at'
        ]
        read_only_fields = ['assigned_by', 'assigned_at']
    
    def create(self, validated_data):
        validated_data['assigned_by'] = self.context['request'].user
        return super().create(validated_data)


class UserWithRolesSerializer(serializers.ModelSerializer):
    custom_roles = serializers.SerializerMethodField()
    
    class Meta:
        model = settings.AUTH_USER_MODEL
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'custom_roles']
    
    def get_custom_roles(self, obj):
        user_roles = obj.custom_roles.select_related('role').all()
        return [{'id': ur.role.id, 'name': ur.role.name} for ur in user_roles]