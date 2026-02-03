from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class SystemBackup(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    backup_type = models.CharField(max_length=50, choices=[
        ('full', 'Full System Backup'),
        ('database', 'Database Only'),
        ('files', 'Files Only')
    ], default='full')
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']

class SystemSnapshot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    snapshot_data = models.JSONField()
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']