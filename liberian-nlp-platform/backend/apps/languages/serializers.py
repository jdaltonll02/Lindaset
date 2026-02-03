from rest_framework import serializers
from .models import Language, TextData, AudioData

class LanguageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Language
        fields = ['id', 'name', 'iso_code', 'family', 'estimated_speakers', 
                 'endangerment_level', 'regions', 'description', 'is_active', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class TextDataSerializer(serializers.ModelSerializer):
    source_language_name = serializers.CharField(source='source_language.name', read_only=True)
    target_language_name = serializers.CharField(source='target_language.name', read_only=True)
    contributor_name = serializers.CharField(source='contributor.username', read_only=True)
    
    class Meta:
        model = TextData
        fields = ['id', 'source_text', 'target_text', 'source_language', 'target_language',
                 'source_language_name', 'target_language_name', 'contributor', 'contributor_name',
                 'status', 'created_at']
        read_only_fields = ['id', 'contributor', 'created_at']

class AudioDataSerializer(serializers.ModelSerializer):
    language_name = serializers.CharField(source='language.name', read_only=True)
    contributor_name = serializers.CharField(source='contributor.username', read_only=True)
    
    class Meta:
        model = AudioData
        fields = ['id', 'text', 'language', 'language_name', 'file_path', 'duration',
                 'speaker_gender', 'speaker_age_range', 'quality_score', 'contributor',
                 'contributor_name', 'status', 'created_at']
        read_only_fields = ['id', 'contributor', 'created_at']