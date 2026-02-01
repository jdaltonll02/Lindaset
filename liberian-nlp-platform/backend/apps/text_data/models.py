from django.db import models
from django.core.validators import MinLengthValidator, MaxLengthValidator
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()


class Corpus(models.Model):
    """Text corpus for organizing sentences."""
    
    class CorpusType(models.TextChoices):
        GENERAL = 'general', 'General Domain'
        NEWS = 'news', 'News'
        LITERATURE = 'literature', 'Literature'
        RELIGIOUS = 'religious', 'Religious Texts'
        EDUCATIONAL = 'educational', 'Educational'
        CONVERSATIONAL = 'conversational', 'Conversational'
        TECHNICAL = 'technical', 'Technical'
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    corpus_type = models.CharField(max_length=20, choices=CorpusType.choices)
    language = models.ForeignKey('languages.Language', on_delete=models.CASCADE)
    is_public = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Statistics
    sentence_count = models.PositiveIntegerField(default=0)
    word_count = models.PositiveIntegerField(default=0)
    
    class Meta:
        verbose_name_plural = 'corpora'
        unique_together = ['name', 'language']
    
    def __str__(self) -> str:
        return f"{self.name} ({self.language.name})"


class Sentence(models.Model):
    """Individual sentences in various languages."""
    
    class SentenceStatus(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        VALIDATED = 'validated', 'Validated'
        REJECTED = 'rejected', 'Rejected'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    text = models.TextField(validators=[MinLengthValidator(1), MaxLengthValidator(1000)])
    language = models.ForeignKey('languages.Language', on_delete=models.CASCADE)
    corpus = models.ForeignKey(Corpus, on_delete=models.CASCADE, related_name='sentences')
    
    # Metadata
    status = models.CharField(max_length=20, choices=SentenceStatus.choices, default=SentenceStatus.DRAFT)
    difficulty_level = models.CharField(
        max_length=20,
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
        ],
        default='intermediate'
    )
    
    # Source information
    source_text = models.TextField(blank=True, help_text="Original text if this is a translation")
    source_language = models.ForeignKey(
        'languages.Language', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='source_sentences'
    )
    
    # Quality metrics
    word_count = models.PositiveIntegerField(default=0)
    character_count = models.PositiveIntegerField(default=0)
    confidence_score = models.FloatField(default=0.0)
    
    # Contributor information
    contributed_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contributed_sentences')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['language', 'status']),
            models.Index(fields=['corpus', 'status']),
            models.Index(fields=['contributed_by']),
        ]
    
    def save(self, *args, **kwargs):
        # Update word and character counts
        self.word_count = len(self.text.split())
        self.character_count = len(self.text)
        super().save(*args, **kwargs)
    
    def __str__(self) -> str:
        return f"{self.text[:50]}..." if len(self.text) > 50 else self.text


class Translation(models.Model):
    """Translation pairs between sentences."""
    
    class TranslationStatus(models.TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        VALIDATED = 'validated', 'Validated'
        REJECTED = 'rejected', 'Rejected'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    source_sentence = models.ForeignKey(
        Sentence, 
        on_delete=models.CASCADE, 
        related_name='translations_as_source'
    )
    target_sentence = models.ForeignKey(
        Sentence, 
        on_delete=models.CASCADE, 
        related_name='translations_as_target'
    )
    
    # Translation metadata
    status = models.CharField(max_length=20, choices=TranslationStatus.choices, default=TranslationStatus.DRAFT)
    translation_type = models.CharField(
        max_length=20,
        choices=[
            ('literal', 'Literal'),
            ('free', 'Free'),
            ('cultural', 'Cultural Adaptation'),
        ],
        default='free'
    )
    
    # Quality metrics
    confidence_score = models.FloatField(default=0.0)
    length_ratio = models.FloatField(default=0.0)
    
    # Contributor information
    translated_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='translations')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['source_sentence', 'target_sentence']
        indexes = [
            models.Index(fields=['source_sentence', 'status']),
            models.Index(fields=['target_sentence', 'status']),
        ]
    
    def save(self, *args, **kwargs):
        # Calculate length ratio
        if self.source_sentence.word_count > 0:
            self.length_ratio = self.target_sentence.word_count / self.source_sentence.word_count
        super().save(*args, **kwargs)
    
    def __str__(self) -> str:
        return f"{self.source_sentence.language.name} → {self.target_sentence.language.name}"


class SentenceMetadata(models.Model):
    """Additional metadata for sentences."""
    
    sentence = models.OneToOneField(Sentence, on_delete=models.CASCADE, related_name='metadata')
    
    # Linguistic annotations
    pos_tags = models.JSONField(default=list, blank=True)
    named_entities = models.JSONField(default=list, blank=True)
    syntactic_features = models.JSONField(default=dict, blank=True)
    
    # Cultural context
    cultural_notes = models.TextField(blank=True)
    usage_context = models.CharField(
        max_length=50,
        choices=[
            ('formal', 'Formal'),
            ('informal', 'Informal'),
            ('ceremonial', 'Ceremonial'),
            ('everyday', 'Everyday'),
        ],
        default='everyday'
    )
    
    # Audio alignment (for future ASR tasks)
    has_audio = models.BooleanField(default=False)
    audio_duration = models.FloatField(null=True, blank=True)
    
    def __str__(self) -> str:
        return f"Metadata for {self.sentence}"