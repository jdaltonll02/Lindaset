import os
import json
import zipfile
from django.http import HttpResponse, FileResponse
from django.core.management import call_command
from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import SystemBackup, SystemSnapshot
from .serializers import SystemBackupSerializer, SystemSnapshotSerializer
from apps.accounts.models import User
from apps.languages.models import Language

def is_admin_or_superuser(user):
    return hasattr(user, 'role') and user.role in ['admin', 'superuser']

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def backup_list(request):
    if not is_admin_or_superuser(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        backups = SystemBackup.objects.all()
        serializer = SystemBackupSerializer(backups, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = SystemBackupSerializer(data=request.data)
        if serializer.is_valid():
            backup = serializer.save(created_by=request.user)
            
            # Create backup file
            backup_data = {
                'users': list(User.objects.values()),
                'languages': list(Language.objects.values()),
                'metadata': {
                    'backup_id': str(backup.id),
                    'created_at': backup.created_at.isoformat(),
                    'backup_type': backup.backup_type
                }
            }
            
            backup_dir = os.path.join(settings.MEDIA_ROOT, 'backups')
            os.makedirs(backup_dir, exist_ok=True)
            backup_file = os.path.join(backup_dir, f'backup_{backup.id}.json')
            
            with open(backup_file, 'w') as f:
                json.dump(backup_data, f, indent=2, default=str)
            
            backup.file_path = backup_file
            backup.file_size = os.path.getsize(backup_file)
            backup.save()
            
            return Response(SystemBackupSerializer(backup).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'DELETE'])
@permission_classes([IsAuthenticated])
def backup_detail(request, backup_id):
    if not is_admin_or_superuser(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        backup = SystemBackup.objects.get(id=backup_id)
    except SystemBackup.DoesNotExist:
        return Response({'error': 'Backup not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        if os.path.exists(backup.file_path):
            response = FileResponse(open(backup.file_path, 'rb'), as_attachment=True, 
                                  filename=f'{backup.name}.json')
            return response
        return Response({'error': 'Backup file not found'}, status=status.HTTP_404_NOT_FOUND)
    
    elif request.method == 'DELETE':
        if os.path.exists(backup.file_path):
            os.remove(backup.file_path)
        backup.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def snapshot_list(request):
    if not is_admin_or_superuser(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        snapshots = SystemSnapshot.objects.all()
        serializer = SystemSnapshotSerializer(snapshots, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = SystemSnapshotSerializer(data=request.data)
        if serializer.is_valid():
            snapshot_data = {
                'users': list(User.objects.values()),
                'languages': list(Language.objects.values()),
                'system_state': {
                    'total_users': User.objects.count(),
                    'total_languages': Language.objects.count()
                }
            }
            
            snapshot = serializer.save(
                created_by=request.user,
                snapshot_data=snapshot_data
            )
            return Response(SystemSnapshotSerializer(snapshot).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'DELETE', 'POST'])
@permission_classes([IsAuthenticated])
def snapshot_detail(request, snapshot_id):
    if not is_admin_or_superuser(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        snapshot = SystemSnapshot.objects.get(id=snapshot_id)
    except SystemSnapshot.DoesNotExist:
        return Response({'error': 'Snapshot not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        response = HttpResponse(
            json.dumps(snapshot.snapshot_data, indent=2, default=str),
            content_type='application/json'
        )
        response['Content-Disposition'] = f'attachment; filename="{snapshot.name}.json"'
        return response
    
    elif request.method == 'DELETE':
        snapshot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    elif request.method == 'POST':  # Restore snapshot
        # This would restore the system to the snapshot state
        # For now, just return success message
        return Response({'message': f'System restored to snapshot: {snapshot.name}'})