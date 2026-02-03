from django.urls import path
from . import views

urlpatterns = [
    path('backups/', views.backup_list, name='backup-list'),
    path('backups/<uuid:backup_id>/', views.backup_detail, name='backup-detail'),
    path('snapshots/', views.snapshot_list, name='snapshot-list'),
    path('snapshots/<uuid:snapshot_id>/', views.snapshot_detail, name='snapshot-detail'),
]