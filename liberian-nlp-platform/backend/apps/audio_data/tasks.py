from celery import shared_task
from django.conf import settings
from .models import AudioRecording, AudioProcessingResult
from .utils import AudioProcessor
import os
import tempfile


@shared_task
def process_audio_file(recording_id):
    """Process audio file asynchronously."""
    
    try:
        recording = AudioRecording.objects.get(id=recording_id)
        recording.status = AudioRecording.RecordingStatus.PROCESSING
        recording.save()
        
        # Get file path
        audio_file_path = recording.audio_file.path
        
        # Analyze audio
        analysis_result = AudioProcessor.analyze_audio_file(audio_file_path)
        
        if analysis_result.get('is_valid', False):
            # Update recording with quality metrics
            quality_metrics = analysis_result['quality_metrics']
            recording.signal_to_noise_ratio = quality_metrics['snr']
            recording.silence_ratio = quality_metrics['silence_ratio']
            recording.clipping_detected = quality_metrics['clipping_detected']
            
            # Calculate overall quality score
            quality_score = calculate_quality_score(quality_metrics)
            recording.quality_score = quality_score
            
            # Update processing result
            processing_result = recording.processing_result
            processing_result.spectral_features = analysis_result['spectral_features']
            processing_result.noise_level = quality_metrics['rms_energy']
            processing_result.speech_segments = analysis_result['speech_segments']
            processing_result.silence_segments = analysis_result['silence_segments']
            processing_result.save()
            
            # Convert to standard format if needed
            if recording.sample_rate != AudioProcessor.TARGET_SAMPLE_RATE:
                convert_audio_format.delay(recording_id)
            
            recording.status = AudioRecording.RecordingStatus.PROCESSED
        else:
            recording.status = AudioRecording.RecordingStatus.ERROR
            
        recording.save()
        
        return f"Processing completed for recording {recording_id}"
        
    except Exception as e:
        # Mark as error
        try:
            recording = AudioRecording.objects.get(id=recording_id)
            recording.status = AudioRecording.RecordingStatus.ERROR
            recording.save()
        except:
            pass
        
        return f"Processing failed for recording {recording_id}: {str(e)}"


@shared_task
def convert_audio_format(recording_id):
    """Convert audio to standard format."""
    
    try:
        recording = AudioRecording.objects.get(id=recording_id)
        
        # Create temporary file for converted audio
        with tempfile.NamedTemporaryFile(suffix='.wav', delete=False) as temp_file:
            temp_path = temp_file.name
        
        # Convert audio
        success = AudioProcessor.convert_to_standard_format(
            recording.audio_file.path,
            temp_path
        )
        
        if success:
            # Replace original file
            with open(temp_path, 'rb') as converted_file:
                recording.audio_file.save(
                    f"{recording.id}.wav",
                    converted_file,
                    save=True
                )
            
            # Update properties
            recording.sample_rate = AudioProcessor.TARGET_SAMPLE_RATE
            recording.channels = AudioProcessor.TARGET_CHANNELS
            recording.save()
        
        # Clean up
        os.unlink(temp_path)
        
        return f"Format conversion completed for recording {recording_id}"
        
    except Exception as e:
        return f"Format conversion failed for recording {recording_id}: {str(e)}"


@shared_task
def batch_process_recordings(recording_ids):
    """Process multiple recordings in batch."""
    
    results = []
    for recording_id in recording_ids:
        result = process_audio_file.delay(recording_id)
        results.append(result.id)
    
    return f"Batch processing started for {len(recording_ids)} recordings"


def calculate_quality_score(quality_metrics):
    """Calculate overall quality score from individual metrics."""
    
    # Normalize SNR (0-40 dB range)
    snr_score = min(max(quality_metrics['snr'] / 40.0, 0.0), 1.0)
    
    # Penalize clipping
    clipping_penalty = quality_metrics['clipping_ratio'] * 2.0
    
    # Penalize excessive silence
    silence_penalty = max(0, quality_metrics['silence_ratio'] - 0.3) * 2.0
    
    # Energy score (normalized RMS)
    energy_score = min(quality_metrics['rms_energy'] * 10.0, 1.0)
    
    # Combine scores
    quality_score = (snr_score * 0.4 + energy_score * 0.3 + 
                    (1.0 - clipping_penalty) * 0.2 + 
                    (1.0 - silence_penalty) * 0.1)
    
    return max(min(quality_score, 1.0), 0.0)