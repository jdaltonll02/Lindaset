from django.core.management.base import BaseCommand
from django.db import connection


class Command(BaseCommand):
    help = 'Delete all users and their tokens using raw SQL'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            # Delete tokens first
            cursor.execute("DELETE FROM authtoken_token")
            
            # Delete user profiles
            cursor.execute("DELETE FROM accounts_userprofile")
            
            # Delete users
            cursor.execute("DELETE FROM accounts_user")
            
            # Reset auto-increment
            cursor.execute("DELETE FROM sqlite_sequence WHERE name='accounts_user'")
            cursor.execute("DELETE FROM sqlite_sequence WHERE name='authtoken_token'")
        
        self.stdout.write(
            self.style.SUCCESS('Successfully deleted all users and tokens')
        )