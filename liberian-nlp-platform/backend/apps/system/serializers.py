from rest_framework import serializers
from .models import SystemBackup, SystemSnapshot

class SystemBackupSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = SystemBackup
        fields = ['id', 'name', 'description', 'backup_type', 'file_size', 
                 'created_by_username', 'created_at']
        read_only_fields = ['id', 'file_size', 'created_by_username', 'created_at']

class SystemSnapshotSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = SystemSnapshot
        fields = ['id', 'name', 'description', 'created_by_username', 'created_at']
        read_only_fields = ['id', 'created_by_username', 'created_at']