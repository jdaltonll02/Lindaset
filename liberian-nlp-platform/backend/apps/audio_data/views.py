from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count, Sum, Avg
from django.core.files.storage import default_storage
from django.conf import settings
import os
import tempfile
from .models import AudioRecording, AudioProcessingResult, SpeakerProfile, AudioDataset
from .serializers import (
    AudioRecordingSerializer, AudioRecordingListSerializer,
    AudioProcessingResultSerializer, SpeakerProfileSerializer,
    AudioDatasetSerializer, AudioUploadSerializer, AudioStatsSerializer
)
from .utils import AudioProcessor
from .tasks import process_audio_file  # Will be implemented with Celery


class AudioRecordingListView(generics.ListCreateAPIView):
    """List and upload audio recordings."""
    
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return AudioRecordingListSerializer
        return AudioRecordingSerializer
    
    def get_queryset(self):
        queryset = AudioRecording.objects.select_related('language', 'recorded_by')
        
        # Filter by language
        language = self.request.query_params.get('language')
        if language:
            queryset = queryset.filter(language_id=language)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by recording type
        recording_type = self.request.query_params.get('type')
        if recording_type:
            queryset = queryset.filter(recording_type=recording_type)
        
        # Filter by contributor
        contributor = self.request.query_params.get('contributor')
        if contributor:
            queryset = queryset.filter(recorded_by_id=contributor)
        
        return queryset.order_by('-created_at')


class AudioRecordingDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete an audio recording."""
    
    queryset = AudioRecording.objects.all()
    serializer_class = AudioRecordingSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def upload_audio(request):
    """Upload and process audio file."""
    
    serializer = AudioUploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    audio_file = serializer.validated_data['audio_file']
    
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
            for chunk in audio_file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name
        
        # Analyze audio file
        analysis_result = AudioProcessor.analyze_audio_file(temp_file_path)
        
        if not analysis_result.get('is_valid', False):
            os.unlink(temp_file_path)
            return Response({
                'error': 'Audio file does not meet quality requirements',
                'details': analysis_result.get('error', 'Quality validation failed')
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Create audio recording
        recording = AudioRecording.objects.create(
            audio_file=audio_file,
            original_filename=audio_file.name,
            file_size=audio_file.size,
            duration=analysis_result['properties']['duration'],
            sample_rate=analysis_result['properties']['sample_rate'],
            channels=analysis_result['properties']['channels'],
            language_id=serializer.validated_data['language_id'],
            sentence_id=serializer.validated_data.get('sentence_id'),
            transcript=serializer.validated_data.get('transcript', ''),
            recording_type=serializer.validated_data['recording_type'],
            speaker_age_range=serializer.validated_data.get('speaker_age_range', ''),
            speaker_gender=serializer.validated_data.get('speaker_gender', ''),
            recorded_by=request.user,
            status=AudioRecording.RecordingStatus.PROCESSING,
            # Quality metrics from analysis
            signal_to_noise_ratio=analysis_result['quality_metrics']['snr'],
            silence_ratio=analysis_result['quality_metrics']['silence_ratio'],
            clipping_detected=analysis_result['quality_metrics']['clipping_detected'],
        )
        
        # Create processing result
        AudioProcessingResult.objects.create(
            recording=recording,
            processing_duration=0.0,  # Will be updated by async task
            spectral_features=analysis_result['spectral_features'],
            noise_level=analysis_result['quality_metrics']['rms_energy'],
            speech_segments=analysis_result['speech_segments'],
            silence_segments=analysis_result['silence_segments'],
        )
        
        # Clean up temporary file
        os.unlink(temp_file_path)
        
        # Trigger async processing (if Celery is available)
        # process_audio_file.delay(recording.id)
        
        # For now, mark as processed
        recording.status = AudioRecording.RecordingStatus.PROCESSED
        recording.save()
        
        return Response({
            'recording': AudioRecordingSerializer(recording).data,
            'message': 'Audio uploaded and processed successfully'
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        # Clean up on error
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except:
                pass
        
        return Response({
            'error': f'Failed to process audio: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SpeakerProfileView(generics.RetrieveUpdateAPIView):
    """Manage speaker profile."""
    
    serializer_class = SpeakerProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        profile, created = SpeakerProfile.objects.get_or_create(
            user=self.request.user,
            defaults={'speaker_id': f"spk_{self.request.user.id}"}
        )
        return profile


class AudioDatasetListView(generics.ListCreateAPIView):
    """List and create audio datasets."""
    
    queryset = AudioDataset.objects.all()
    serializer_class = AudioDatasetSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by language
        language = self.request.query_params.get('language')
        if language:
            queryset = queryset.filter(language_id=language)
        
        # Filter by dataset type
        dataset_type = self.request.query_params.get('type')
        if dataset_type:
            queryset = queryset.filter(dataset_type=dataset_type)
        
        # Filter by public/private
        is_public = self.request.query_params.get('public')
        if is_public is not None:
            queryset = queryset.filter(is_public=is_public.lower() == 'true')
        
        return queryset.order_by('-created_at')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def audio_stats(request):
    """Get audio recording statistics."""
    
    total_recordings = AudioRecording.objects.count()
    total_duration = AudioRecording.objects.aggregate(
        total=Sum('duration')
    )['total'] or 0.0
    
    validated_recordings = AudioRecording.objects.filter(status='validated').count()
    unique_speakers = AudioRecording.objects.values('speaker_id').distinct().count()
    
    # Statistics by language
    by_language = dict(
        AudioRecording.objects.values('language__name')
        .annotate(count=Count('id'))
        .values_list('language__name', 'count')
    )
    
    # Statistics by status
    by_status = dict(
        AudioRecording.objects.values('status')
        .annotate(count=Count('id'))
        .values_list('status', 'count')
    )
    
    # Statistics by recording type
    by_recording_type = dict(
        AudioRecording.objects.values('recording_type')
        .annotate(count=Count('id'))
        .values_list('recording_type', 'count')
    )
    
    # Quality distribution
    quality_ranges = [
        ('0.0-0.2', 0.0, 0.2),
        ('0.2-0.4', 0.2, 0.4),
        ('0.4-0.6', 0.4, 0.6),
        ('0.6-0.8', 0.6, 0.8),
        ('0.8-1.0', 0.8, 1.0),
    ]
    
    quality_distribution = {}
    for label, min_val, max_val in quality_ranges:
        count = AudioRecording.objects.filter(
            quality_score__gte=min_val,
            quality_score__lt=max_val
        ).count()
        quality_distribution[label] = count
    
    stats = {
        'total_recordings': total_recordings,
        'total_duration': round(total_duration, 2),
        'validated_recordings': validated_recordings,
        'unique_speakers': unique_speakers,
        'by_language': by_language,
        'by_status': by_status,
        'by_recording_type': by_recording_type,
        'quality_distribution': quality_distribution,
    }
    
    serializer = AudioStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def recording_for_sentence(request, sentence_id):
    """Get audio recordings for a specific sentence."""
    
    recordings = AudioRecording.objects.filter(
        sentence_id=sentence_id,
        status__in=['processed', 'validated']
    ).order_by('-quality_score')
    
    serializer = AudioRecordingListSerializer(recordings, many=True)
    return Response(serializer.data)


class AudioProcessingResultView(generics.RetrieveAPIView):
    """Get processing results for an audio recording."""
    
    serializer_class = AudioProcessingResultSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        recording_id = self.kwargs['recording_id']
        recording = AudioRecording.objects.get(id=recording_id)
        return recording.processing_result