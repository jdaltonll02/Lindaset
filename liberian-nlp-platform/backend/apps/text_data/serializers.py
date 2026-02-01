from rest_framework import serializers
from .models import Corpus, Sentence, Translation, SentenceMetadata
from apps.languages.serializers import LanguageListSerializer
from apps.accounts.serializers import UserSerializer


class CorpusSerializer(serializers.ModelSerializer):
    """Serializer for text corpora."""
    
    language = LanguageListSerializer(read_only=True)
    language_id = serializers.IntegerField(write_only=True)
    created_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Corpus
        fields = [
            'id', 'name', 'description', 'corpus_type', 'language', 'language_id',
            'is_public', 'created_by', 'sentence_count', 'word_count', 'created_at'
        ]
        read_only_fields = ['sentence_count', 'word_count', 'created_by']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class SentenceMetadataSerializer(serializers.ModelSerializer):
    """Serializer for sentence metadata."""
    
    class Meta:
        model = SentenceMetadata
        fields = [
            'pos_tags', 'named_entities', 'syntactic_features',
            'cultural_notes', 'usage_context', 'has_audio', 'audio_duration'
        ]


class SentenceSerializer(serializers.ModelSerializer):
    """Serializer for sentences."""
    
    language = LanguageListSerializer(read_only=True)
    language_id = serializers.IntegerField(write_only=True)
    corpus = CorpusSerializer(read_only=True)
    corpus_id = serializers.IntegerField(write_only=True)
    contributed_by = UserSerializer(read_only=True)
    metadata = SentenceMetadataSerializer(read_only=True)
    
    # Source information
    source_language = LanguageListSerializer(read_only=True)
    source_language_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Sentence
        fields = [
            'id', 'text', 'language', 'language_id', 'corpus', 'corpus_id',
            'status', 'difficulty_level', 'source_text', 'source_language',
            'source_language_id', 'word_count', 'character_count',
            'confidence_score', 'contributed_by', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'word_count', 'character_count', 'confidence_score',
            'contributed_by', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        validated_data['contributed_by'] = self.context['request'].user
        return super().create(validated_data)


class SentenceListSerializer(serializers.ModelSerializer):
    """Simplified serializer for sentence lists."""
    
    language_name = serializers.CharField(source='language.name', read_only=True)
    corpus_name = serializers.CharField(source='corpus.name', read_only=True)
    contributor = serializers.CharField(source='contributed_by.username', read_only=True)
    
    class Meta:
        model = Sentence
        fields = [
            'id', 'text', 'language_name', 'corpus_name', 'status',
            'difficulty_level', 'word_count', 'confidence_score',
            'contributor', 'created_at'
        ]


class TranslationSerializer(serializers.ModelSerializer):
    """Serializer for translations."""
    
    source_sentence = SentenceListSerializer(read_only=True)
    target_sentence = SentenceListSerializer(read_only=True)
    source_sentence_id = serializers.UUIDField(write_only=True)
    target_sentence_id = serializers.UUIDField(write_only=True)
    translated_by = UserSerializer(read_only=True)
    
    class Meta:
        model = Translation
        fields = [
            'id', 'source_sentence', 'target_sentence',
            'source_sentence_id', 'target_sentence_id',
            'status', 'translation_type', 'confidence_score',
            'length_ratio', 'translated_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'confidence_score', 'length_ratio',
            'translated_by', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        validated_data['translated_by'] = self.context['request'].user
        return super().create(validated_data)


class TranslationPairSerializer(serializers.Serializer):
    """Serializer for creating translation pairs."""
    
    source_text = serializers.CharField(max_length=1000)
    target_text = serializers.CharField(max_length=1000)
    source_language_id = serializers.IntegerField()
    target_language_id = serializers.IntegerField()
    corpus_id = serializers.IntegerField()
    translation_type = serializers.ChoiceField(
        choices=Translation.TranslationStatus.choices,
        default='free'
    )
    difficulty_level = serializers.ChoiceField(
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='intermediate'
    )


class CorpusStatsSerializer(serializers.Serializer):
    """Serializer for corpus statistics."""
    
    total_corpora = serializers.IntegerField()
    total_sentences = serializers.IntegerField()
    total_translations = serializers.IntegerField()
    validated_sentences = serializers.IntegerField()
    by_language = serializers.DictField()
    by_status = serializers.DictField()
    by_corpus_type = serializers.DictField()