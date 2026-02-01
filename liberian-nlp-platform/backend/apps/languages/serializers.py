from rest_framework import serializers
from .models import Language, Script, Orthography, LanguageVariant, LanguagePair


class ScriptSerializer(serializers.ModelSerializer):
    """Serializer for writing scripts."""
    
    class Meta:
        model = Script
        fields = '__all__'


class OrthographySerializer(serializers.ModelSerializer):
    """Serializer for orthographic systems."""
    
    script = ScriptSerializer(read_only=True)
    script_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Orthography
        fields = [
            'id', 'name', 'script', 'script_id', 'is_official', 'is_primary',
            'alphabet', 'tone_marking', 'tone_system', 'character_set',
            'normalization_rules', 'created_at'
        ]


class LanguageVariantSerializer(serializers.ModelSerializer):
    """Serializer for language variants."""
    
    class Meta:
        model = LanguageVariant
        fields = [
            'id', 'name', 'region', 'is_standard',
            'phonological_notes', 'lexical_notes', 'grammatical_notes'
        ]


class LanguageSerializer(serializers.ModelSerializer):
    """Serializer for languages."""
    
    orthographies = OrthographySerializer(many=True, read_only=True)
    variants = LanguageVariantSerializer(many=True, read_only=True)
    speaker_count = serializers.IntegerField(source='estimated_speakers', read_only=True)
    
    class Meta:
        model = Language
        fields = [
            'id', 'name', 'iso_code', 'family', 'is_active', 'description',
            'regions', 'speaker_count', 'endangerment_level',
            'orthographies', 'variants', 'created_at', 'updated_at'
        ]


class LanguageListSerializer(serializers.ModelSerializer):
    """Simplified serializer for language lists."""
    
    speaker_count = serializers.IntegerField(source='estimated_speakers', read_only=True)
    orthography_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Language
        fields = [
            'id', 'name', 'iso_code', 'family', 'endangerment_level',
            'speaker_count', 'orthography_count'
        ]
    
    def get_orthography_count(self, obj):
        return obj.orthographies.count()


class LanguagePairSerializer(serializers.ModelSerializer):
    """Serializer for translation pairs."""
    
    source_language = LanguageListSerializer(read_only=True)
    target_language = LanguageListSerializer(read_only=True)
    source_language_id = serializers.IntegerField(write_only=True)
    target_language_id = serializers.IntegerField(write_only=True)
    
    completion_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = LanguagePair
        fields = [
            'id', 'source_language', 'target_language',
            'source_language_id', 'target_language_id',
            'is_active', 'priority', 'sentence_count',
            'validated_count', 'completion_rate', 'created_at'
        ]
    
    def get_completion_rate(self, obj):
        if obj.sentence_count == 0:
            return 0.0
        return round((obj.validated_count / obj.sentence_count) * 100, 2)


class LanguageStatsSerializer(serializers.Serializer):
    """Serializer for language statistics."""
    
    total_languages = serializers.IntegerField()
    active_languages = serializers.IntegerField()
    total_pairs = serializers.IntegerField()
    total_sentences = serializers.IntegerField()
    validated_sentences = serializers.IntegerField()
    by_family = serializers.DictField()
    by_endangerment = serializers.DictField()