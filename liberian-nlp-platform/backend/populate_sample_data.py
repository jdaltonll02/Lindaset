#!/usr/bin/env python
import os
import sys
import django
from pathlib import Path

backend_dir = Path(__file__).resolve().parent
sys.path.append(str(backend_dir))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.languages.mongo_models import Language, TextData, AudioData

def populate_sample_data():
    """Add sample translations and audio data"""
    
    # Sample translations
    translations = [
        {"source": "Hello", "target": "Kwa", "source_lang": "English", "target_lang": "Bassa"},
        {"source": "Thank you", "target": "Tankee", "source_lang": "English", "target_lang": "Kpelle"},
        {"source": "Good morning", "target": "Mornin good", "source_lang": "English", "target_lang": "Vai"},
        {"source": "How are you?", "target": "How you dey?", "source_lang": "English", "target_lang": "Krahn"},
        {"source": "Welcome", "target": "You welcome", "source_lang": "English", "target_lang": "Gio"},
    ]
    
    print("Adding sample translations...")
    for trans in translations:
        translation = TextData(
            source_text=trans["source"],
            target_text=trans["target"],
            source_language=trans["source_lang"],
            target_language=trans["target_lang"],
            contributor="demo_user",
            status="approved"
        )
        translation.save()
        print(f"+ {trans['source']} -> {trans['target']} ({trans['target_lang']})")
    
    # Sample audio data
    audio_samples = [
        {"text": "Kwa", "language": "Bassa", "gender": "female"},
        {"text": "Tankee", "language": "Kpelle", "gender": "male"},
        {"text": "Mornin good", "language": "Vai", "gender": "female"},
        {"text": "How you dey?", "language": "Krahn", "gender": "male"},
        {"text": "You welcome", "language": "Gio", "gender": "female"},
    ]
    
    print("\nAdding sample audio data...")
    for audio in audio_samples:
        audio_data = AudioData(
            text=audio["text"],
            language=audio["language"],
            file_path=f"/audio/{audio['language'].lower()}_{audio['text'].replace(' ', '_')}.wav",
            duration=2,
            speaker_gender=audio["gender"],
            quality_score=4,
            contributor="demo_user",
            status="approved"
        )
        audio_data.save()
        print(f"+ Audio: {audio['text']} ({audio['language']}, {audio['gender']})")
    
    print(f"\nDatabase Summary:")
    print(f"Languages: {Language.objects.count()}")
    print(f"Translations: {TextData.objects.count()}")
    print(f"Audio files: {AudioData.objects.count()}")

if __name__ == "__main__":
    try:
        populate_sample_data()
        print("\nSUCCESS: Sample data added to MongoDB!")
    except Exception as e:
        print(f"ERROR: {e}")