from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a superuser with custom role'

    def add_arguments(self, parser):
        parser.add_argument('--username', required=True, help='Username for the superuser')
        parser.add_argument('--email', required=True, help='Email for the superuser')
        parser.add_argument('--password', required=True, help='Password for the superuser')
        parser.add_argument('--role', default='superuser', choices=['admin', 'superuser'], help='Role for the user')

    def handle(self, *args, **options):
        username = options['username']
        email = options['email']
        password = options['password']
        role = options['role']

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.ERROR(f'User "{username}" already exists'))
            return

        try:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                role=role,
                is_staff=True,
                is_superuser=True,
                first_name='Super',
                last_name='User'
            )
            
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created {role} "{username}" with email "{email}"')
            )
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error creating user: {e}'))