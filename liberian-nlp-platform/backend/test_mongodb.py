#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.languages.mongo_models import Language

def populate_languages():
    """Populate MongoDB with Liberian languages"""
    languages_data = [
        "Bassa", "Kpelle", "Gio", "Mano", "Krahn", "Grebo", "Vai", "Gola",
        "Kissi", "Gbandi", "Loma", "Mandingo", "Mende", "Kru", "Sapo", "Belleh"
    ]
    
    print("Populating MongoDB with Liberian languages...")
    
    for lang_name in languages_data:
        language = Language(
            name=lang_name,
            family='niger_congo',
            is_active=True,
            regions='Liberia',
            endangerment_level='safe'
        )
        language.save()
        print(f"+ Added {lang_name}")
    
    print(f"\nTotal languages in MongoDB: {Language.objects.count()}")

if __name__ == "__main__":
    try:
        populate_languages()
        print("SUCCESS: MongoDB setup successful!")
    except Exception as e:
        print(f"ERROR: {e}")
        print("Make sure MongoDB is running on localhost:27017")