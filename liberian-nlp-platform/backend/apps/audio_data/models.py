from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model
import uuid
import os

User = get_user_model()


def audio_upload_path(instance, filename):
    """Generate upload path for audio files."""
    ext = filename.split('.')[-1]
    filename = f"{instance.id}.{ext}"
    return os.path.join('audio', str(instance.language.id), filename)


class AudioRecording(models.Model):
    """Audio recordings for ASR and speech translation."""
    
    class RecordingStatus(models.TextChoices):
        UPLOADED = 'uploaded', 'Uploaded'
        PROCESSING = 'processing', 'Processing'
        PROCESSED = 'processed', 'Processed'
        VALIDATED = 'validated', 'Validated'
        REJECTED = 'rejected', 'Rejected'
        ERROR = 'error', 'Error'
    
    class RecordingType(models.TextChoices):
        READ_SPEECH = 'read_speech', 'Read Speech'
        SPONTANEOUS = 'spontaneous', 'Spontaneous Speech'
        CONVERSATION = 'conversation', 'Conversation'
        NARRATION = 'narration', 'Narration'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Audio file and metadata
    audio_file = models.FileField(upload_to=audio_upload_path)
    original_filename = models.CharField(max_length=255)
    file_size = models.PositiveIntegerField(help_text="File size in bytes")
    
    # Audio properties
    duration = models.FloatField(validators=[MinValueValidator(0.1), MaxValueValidator(30.0)])
    sample_rate = models.PositiveIntegerField(default=16000)
    channels = models.PositiveIntegerField(default=1)
    bit_depth = models.PositiveIntegerField(default=16)
    
    # Content information
    language = models.ForeignKey('languages.Language', on_delete=models.CASCADE)
    sentence = models.ForeignKey(
        'text_data.Sentence', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='audio_recordings'
    )
    transcript = models.TextField(blank=True)
    
    # Recording metadata
    status = models.CharField(max_length=20, choices=RecordingStatus.choices, default=RecordingStatus.UPLOADED)
    recording_type = models.CharField(max_length=20, choices=RecordingType.choices, default=RecordingType.READ_SPEECH)
    
    # Quality metrics
    signal_to_noise_ratio = models.FloatField(null=True, blank=True)
    silence_ratio = models.FloatField(null=True, blank=True)
    clipping_detected = models.BooleanField(default=False)
    quality_score = models.FloatField(default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(1.0)])
    
    # Speaker information (anonymized)
    speaker_id = models.CharField(max_length=50, blank=True)
    speaker_age_range = models.CharField(
        max_length=20,
        choices=[
            ('18-25', '18-25'),
            ('26-35', '26-35'),
            ('36-45', '36-45'),
            ('46-55', '46-55'),
            ('56-65', '56-65'),
            ('65+', '65+'),
        ],
        blank=True
    )
    speaker_gender = models.CharField(
        max_length=20,
        choices=[
            ('male', 'Male'),
            ('female', 'Female'),
            ('other', 'Other'),
            ('prefer_not_to_say', 'Prefer not to say'),
        ],
        blank=True
    )
    
    # Contributor information
    recorded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='audio_recordings')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['language', 'status']),
            models.Index(fields=['recorded_by']),
            models.Index(fields=['sentence']),
        ]
    
    def __str__(self) -> str:
        return f"Audio {self.id} - {self.language.name}"


class AudioProcessingResult(models.Model):
    """Results from audio processing pipeline."""
    
    recording = models.OneToOneField(
        AudioRecording, 
        on_delete=models.CASCADE, 
        related_name='processing_result'
    )
    
    # Processing metadata
    processed_at = models.DateTimeField(auto_now_add=True)
    processing_duration = models.FloatField(help_text="Processing time in seconds")
    
    # Audio analysis results
    spectral_features = models.JSONField(default=dict, blank=True)
    mfcc_features = models.JSONField(default=dict, blank=True)
    pitch_features = models.JSONField(default=dict, blank=True)
    
    # Quality analysis
    noise_level = models.FloatField(null=True, blank=True)
    speech_segments = models.JSONField(default=list, blank=True)
    silence_segments = models.JSONField(default=list, blank=True)
    
    # Automatic transcription (if available)
    auto_transcript = models.TextField(blank=True)
    transcript_confidence = models.FloatField(null=True, blank=True)
    
    # Error information
    processing_errors = models.JSONField(default=list, blank=True)
    
    def __str__(self) -> str:
        return f"Processing result for {self.recording.id}"


class SpeakerProfile(models.Model):
    """Anonymous speaker profiles for consistency."""
    
    speaker_id = models.CharField(max_length=50, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='speaker_profiles')
    
    # Demographic information (optional)
    age_range = models.CharField(
        max_length=20,
        choices=[
            ('18-25', '18-25'),
            ('26-35', '26-35'),
            ('36-45', '36-45'),
            ('46-55', '46-55'),
            ('56-65', '56-65'),
            ('65+', '65+'),
        ],
        blank=True
    )
    gender = models.CharField(
        max_length=20,
        choices=[
            ('male', 'Male'),
            ('female', 'Female'),
            ('other', 'Other'),
            ('prefer_not_to_say', 'Prefer not to say'),
        ],
        blank=True
    )
    
    # Language background
    native_languages = models.ManyToManyField('languages.Language', related_name='native_speakers_audio')
    fluent_languages = models.ManyToManyField('languages.Language', related_name='fluent_speakers_audio')
    
    # Recording statistics
    total_recordings = models.PositiveIntegerField(default=0)
    total_duration = models.FloatField(default=0.0)
    average_quality = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self) -> str:
        return f"Speaker {self.speaker_id}"


class AudioDataset(models.Model):
    """Collections of audio recordings for specific purposes."""
    
    class DatasetType(models.TextChoices):
        ASR = 'asr', 'Automatic Speech Recognition'
        SPEECH_TRANSLATION = 'speech_translation', 'Speech Translation'
        SPEAKER_ID = 'speaker_id', 'Speaker Identification'
        EMOTION = 'emotion', 'Emotion Recognition'
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    dataset_type = models.CharField(max_length=20, choices=DatasetType.choices)
    language = models.ForeignKey('languages.Language', on_delete=models.CASCADE)
    
    # Dataset metadata
    is_public = models.BooleanField(default=True)
    version = models.CharField(max_length=20, default='1.0')
    license = models.CharField(max_length=50, default='CC-BY-4.0')
    
    # Content
    recordings = models.ManyToManyField(AudioRecording, related_name='datasets')
    
    # Statistics
    total_duration = models.FloatField(default=0.0)
    recording_count = models.PositiveIntegerField(default=0)
    speaker_count = models.PositiveIntegerField(default=0)
    
    # Management
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['name', 'version']
    
    def __str__(self) -> str:
        return f"{self.name} v{self.version} ({self.language.name})"