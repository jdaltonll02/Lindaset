try:
    from mongoengine import Document, StringField, BooleanField, IntField, DateTimeField
    from datetime import datetime

    class Language(Document):
        name = StringField(max_length=100, required=True)
        iso_code = StringField(max_length=10)
        family = StringField(max_length=50, choices=[
            ('niger_congo', 'Niger-Congo'),
            ('afroasiatic', 'Afroasiatic'),
            ('nilo_saharan', 'Nilo-Saharan'),
            ('other', 'Other')
        ])
        is_active = BooleanField(default=True)
        description = StringField()
        regions = StringField()
        estimated_speakers = IntField()
        endangerment_level = StringField(max_length=25, choices=[
            ('safe', 'Safe'),
            ('vulnerable', 'Vulnerable'),
            ('definitely_endangered', 'Definitely Endangered'),
            ('severely_endangered', 'Severely Endangered'),
            ('critically_endangered', 'Critically Endangered'),
            ('extinct', 'Extinct')
        ])
        created_at = DateTimeField(default=datetime.utcnow)
        updated_at = DateTimeField(default=datetime.utcnow)
        
        meta = {
            'collection': 'languages',
            'indexes': ['name', 'iso_code', 'family']
        }

    class TextData(Document):
        source_text = StringField(required=True)
        target_text = StringField(required=True)
        source_language = StringField(required=True)
        target_language = StringField(required=True)
        contributor = StringField(required=True)
        status = StringField(choices=['pending', 'approved', 'rejected'], default='pending')
        created_at = DateTimeField(default=datetime.utcnow)
        
        meta = {
            'collection': 'text_data',
            'indexes': ['source_language', 'target_language', 'status']
        }

    class AudioData(Document):
        text = StringField(required=True)
        language = StringField(required=True)
        file_path = StringField(required=True)
        duration = IntField()  # in seconds
        speaker_gender = StringField(choices=['male', 'female', 'other'])
        speaker_age_range = StringField()
        quality_score = IntField(min_value=1, max_value=5)
        contributor = StringField(required=True)
        status = StringField(choices=['pending', 'approved', 'rejected'], default='pending')
        created_at = DateTimeField(default=datetime.utcnow)
        
        meta = {
            'collection': 'audio_data',
            'indexes': ['language', 'status', 'quality_score']
        }
        
except ImportError:
    # MongoDB not available, create dummy classes
    class Language:
        pass
    class TextData:
        pass
    class AudioData:
        pass