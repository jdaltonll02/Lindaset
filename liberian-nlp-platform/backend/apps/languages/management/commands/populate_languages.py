from django.core.management.base import BaseCommand
from apps.languages.models import Language

class Command(BaseCommand):
    help = 'Populate database with sample Liberian languages'

    def handle(self, *args, **options):
        languages_data = [
            {
                'name': 'Bassa',
                'iso_code': 'bassa',
                'family': 'kru',
                'estimated_speakers': 600000,
                'endangerment_level': 'safe',
                'regions': 'Grand Bassa, Rivercess, Margibi',
                'description': 'Bassa is a Kru language spoken by the Bassa people of Liberia and Sierra Leone.'
            },
            {
                'name': 'Kpelle',
                'iso_code': 'kpelle',
                'family': 'mande',
                'estimated_speakers': 800000,
                'endangerment_level': 'safe',
                'regions': 'Bong, Lofa, Gbarpolu',
                'description': 'Kpelle is a Mande language spoken primarily in Liberia, with some speakers in Guinea.'
            },
            {
                'name': 'Vai',
                'iso_code': 'vai',
                'family': 'mande',
                'estimated_speakers': 150000,
                'endangerment_level': 'vulnerable',
                'regions': 'Grand Cape Mount',
                'description': 'Vai is a Mande language known for its indigenous syllabic writing system.'
            },
            {
                'name': 'Krahn',
                'iso_code': 'krahn',
                'family': 'kru',
                'estimated_speakers': 120000,
                'endangerment_level': 'vulnerable',
                'regions': 'Grand Gedeh, River Gee, Sinoe',
                'description': 'Krahn is a Kru language spoken in southeastern Liberia.'
            },
            {
                'name': 'Gio',
                'iso_code': 'gio',
                'family': 'mande',
                'estimated_speakers': 350000,
                'endangerment_level': 'safe',
                'regions': 'Nimba',
                'description': 'Gio (Dan) is a Mande language spoken in Liberia and Côte d\'Ivoire.'
            }
        ]

        created_count = 0
        for lang_data in languages_data:
            language, created = Language.objects.get_or_create(
                name=lang_data['name'],
                defaults=lang_data
            )
            if created:
                created_count += 1
                self.stdout.write(f"Created: {language.name}")
            else:
                self.stdout.write(f"Exists: {language.name}")

        self.stdout.write(
            self.style.SUCCESS(f'Successfully processed {len(languages_data)} languages ({created_count} created)')
        )