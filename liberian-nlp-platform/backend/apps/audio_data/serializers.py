from rest_framework import serializers
from .models import AudioRecording, AudioProcessingResult, SpeakerProfile, AudioDataset
from apps.languages.serializers import LanguageListSerializer
from apps.accounts.serializers import UserSerializer


class AudioRecordingSerializer(serializers.ModelSerializer):
    """Serializer for audio recordings."""
    
    language = LanguageListSerializer(read_only=True)
    language_id = serializers.IntegerField(write_only=True)
    recorded_by = UserSerializer(read_only=True)
    
    # File upload
    audio_file = serializers.FileField()
    
    class Meta:
        model = AudioRecording
        fields = [
            'id', 'audio_file', 'original_filename', 'file_size',
            'duration', 'sample_rate', 'channels', 'bit_depth',
            'language', 'language_id', 'sentence', 'transcript',
            'status', 'recording_type', 'signal_to_noise_ratio',
            'silence_ratio', 'clipping_detected', 'quality_score',
            'speaker_id', 'speaker_age_range', 'speaker_gender',
            'recorded_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'file_size', 'duration', 'sample_rate', 'channels',
            'bit_depth', 'signal_to_noise_ratio', 'silence_ratio',
            'clipping_detected', 'quality_score', 'recorded_by',
            'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        validated_data['recorded_by'] = self.context['request'].user
        return super().create(validated_data)


class AudioRecordingListSerializer(serializers.ModelSerializer):
    """Simplified serializer for audio recording lists."""
    
    language_name = serializers.CharField(source='language.name', read_only=True)
    contributor = serializers.CharField(source='recorded_by.username', read_only=True)
    
    class Meta:
        model = AudioRecording
        fields = [
            'id', 'original_filename', 'duration', 'language_name',
            'status', 'recording_type', 'quality_score',
            'contributor', 'created_at'
        ]


class AudioProcessingResultSerializer(serializers.ModelSerializer):
    """Serializer for audio processing results."""
    
    class Meta:
        model = AudioProcessingResult
        fields = [
            'processed_at', 'processing_duration', 'spectral_features',
            'mfcc_features', 'pitch_features', 'noise_level',
            'speech_segments', 'silence_segments', 'auto_transcript',
            'transcript_confidence', 'processing_errors'
        ]


class SpeakerProfileSerializer(serializers.ModelSerializer):
    """Serializer for speaker profiles."""
    
    user = UserSerializer(read_only=True)
    native_languages = LanguageListSerializer(many=True, read_only=True)
    fluent_languages = LanguageListSerializer(many=True, read_only=True)
    
    class Meta:
        model = SpeakerProfile
        fields = [
            'speaker_id', 'user', 'age_range', 'gender',
            'native_languages', 'fluent_languages',
            'total_recordings', 'total_duration', 'average_quality'
        ]
        read_only_fields = [
            'speaker_id', 'total_recordings', 'total_duration', 'average_quality'
        ]


class AudioDatasetSerializer(serializers.ModelSerializer):
    """Serializer for audio datasets."""
    
    language = LanguageListSerializer(read_only=True)
    language_id = serializers.IntegerField(write_only=True)
    created_by = UserSerializer(read_only=True)
    recordings = AudioRecordingListSerializer(many=True, read_only=True)
    
    class Meta:
        model = AudioDataset
        fields = [
            'id', 'name', 'description', 'dataset_type', 'language',
            'language_id', 'is_public', 'version', 'license',
            'recordings', 'total_duration', 'recording_count',
            'speaker_count', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'total_duration', 'recording_count', 'speaker_count',
            'created_by', 'created_at', 'updated_at'
        ]
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AudioUploadSerializer(serializers.Serializer):
    """Serializer for audio file uploads."""
    
    audio_file = serializers.FileField()
    language_id = serializers.IntegerField()
    sentence_id = serializers.UUIDField(required=False, allow_null=True)
    transcript = serializers.CharField(max_length=1000, required=False, allow_blank=True)
    recording_type = serializers.ChoiceField(
        choices=AudioRecording.RecordingType.choices,
        default='read_speech'
    )
    speaker_age_range = serializers.ChoiceField(
        choices=[
            ('18-25', '18-25'),
            ('26-35', '26-35'),
            ('36-45', '36-45'),
            ('46-55', '46-55'),
            ('56-65', '56-65'),
            ('65+', '65+'),
        ],
        required=False,
        allow_blank=True
    )
    speaker_gender = serializers.ChoiceField(
        choices=[
            ('male', 'Male'),
            ('female', 'Female'),
            ('other', 'Other'),
            ('prefer_not_to_say', 'Prefer not to say'),
        ],
        required=False,
        allow_blank=True
    )


class AudioStatsSerializer(serializers.Serializer):
    """Serializer for audio statistics."""
    
    total_recordings = serializers.IntegerField()
    total_duration = serializers.FloatField()
    validated_recordings = serializers.IntegerField()
    unique_speakers = serializers.IntegerField()
    by_language = serializers.DictField()
    by_status = serializers.DictField()
    by_recording_type = serializers.DictField()
    quality_distribution = serializers.DictField()