from django.core.management.base import BaseCommand
from apps.roles.models import Permission


class Command(BaseCommand):
    help = 'Create default permissions for the system'
    
    def handle(self, *args, **options):
        permissions = [
            # User Management
            ('View Users', 'view_users', 'View user list and profiles', 'user_management'),
            ('Create Users', 'create_users', 'Create new user accounts', 'user_management'),
            ('Edit Users', 'edit_users', 'Edit user profiles and settings', 'user_management'),
            ('Delete Users', 'delete_users', 'Delete user accounts', 'user_management'),
            ('Manage User Roles', 'manage_user_roles', 'Assign and remove user roles', 'user_management'),
            
            # Content Management
            ('View Languages', 'view_languages', 'View language list', 'content_management'),
            ('Manage Languages', 'manage_languages', 'Create, edit, delete languages', 'content_management'),
            ('View Text Data', 'view_text_data', 'View text datasets', 'content_management'),
            ('Manage Text Data', 'manage_text_data', 'Create, edit, delete text data', 'content_management'),
            ('View Audio Data', 'view_audio_data', 'View audio recordings', 'content_management'),
            ('Manage Audio Data', 'manage_audio_data', 'Upload, edit, delete audio data', 'content_management'),
            ('Review Content', 'review_content', 'Review and approve content', 'content_management'),
            
            # System Management
            ('View System Stats', 'view_system_stats', 'View system statistics', 'system_management'),
            ('Manage Backups', 'manage_backups', 'Create and manage system backups', 'system_management'),
            ('System Actions', 'system_actions', 'Perform system maintenance actions', 'system_management'),
            ('View Logs', 'view_logs', 'View system and security logs', 'system_management'),
            
            # Data Management
            ('Export Data', 'export_data', 'Export datasets and reports', 'data_management'),
            ('Import Data', 'import_data', 'Import data from external sources', 'data_management'),
            ('Manage Datasets', 'manage_datasets', 'Create and manage datasets', 'data_management'),
            
            # Security
            ('View Security Logs', 'view_security_logs', 'View security events and logs', 'security'),
            ('Manage Security', 'manage_security', 'Configure security settings', 'security'),
            ('Audit System', 'audit_system', 'Perform security audits', 'security'),
        ]
        
        created_count = 0
        for name, codename, description, category in permissions:
            permission, created = Permission.objects.get_or_create(
                codename=codename,
                defaults={
                    'name': name,
                    'description': description,
                    'category': category
                }
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created permission: {name}")
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully created {created_count} permissions')
        )