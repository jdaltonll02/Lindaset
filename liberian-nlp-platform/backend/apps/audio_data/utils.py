import librosa
import numpy as np
import soundfile as sf
from pydub import AudioSegment
from typing import Dict, List, Tuple, Optional
import tempfile
import os


class AudioProcessor:
    """Audio processing utilities for quality analysis and format conversion."""
    
    TARGET_SAMPLE_RATE = 16000
    TARGET_CHANNELS = 1
    MIN_DURATION = 1.0  # seconds
    MAX_DURATION = 30.0  # seconds
    
    @staticmethod
    def analyze_audio_file(file_path: str) -> Dict:
        """Analyze audio file and extract metadata and quality metrics."""
        try:
            # Load audio file
            audio, sr = librosa.load(file_path, sr=None)
            duration = len(audio) / sr
            
            # Basic properties
            properties = {
                'duration': duration,
                'sample_rate': sr,
                'channels': 1 if audio.ndim == 1 else audio.shape[0],
                'samples': len(audio),
            }
            
            # Quality metrics
            quality_metrics = AudioProcessor._calculate_quality_metrics(audio, sr)
            
            # Spectral features
            spectral_features = AudioProcessor._extract_spectral_features(audio, sr)
            
            # Speech/silence segmentation
            speech_segments, silence_segments = AudioProcessor._segment_speech_silence(audio, sr)
            
            return {
                'properties': properties,
                'quality_metrics': quality_metrics,
                'spectral_features': spectral_features,
                'speech_segments': speech_segments,
                'silence_segments': silence_segments,
                'is_valid': AudioProcessor._validate_audio_quality(quality_metrics, properties)
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'is_valid': False
            }
    
    @staticmethod
    def _calculate_quality_metrics(audio: np.ndarray, sr: int) -> Dict:
        """Calculate audio quality metrics."""
        # Signal-to-noise ratio estimation
        # Use spectral subtraction method for SNR estimation
        stft = librosa.stft(audio)
        magnitude = np.abs(stft)
        
        # Estimate noise from first and last 10% of the signal
        noise_frames = int(0.1 * magnitude.shape[1])
        noise_spectrum = np.mean(np.concatenate([
            magnitude[:, :noise_frames],
            magnitude[:, -noise_frames:]
        ], axis=1), axis=1, keepdims=True)
        
        # Calculate SNR
        signal_power = np.mean(magnitude ** 2)
        noise_power = np.mean(noise_spectrum ** 2)
        snr = 10 * np.log10(signal_power / (noise_power + 1e-10))
        
        # Clipping detection
        clipping_threshold = 0.95
        clipping_detected = np.any(np.abs(audio) > clipping_threshold)
        clipping_ratio = np.sum(np.abs(audio) > clipping_threshold) / len(audio)
        
        # Silence ratio
        silence_threshold = 0.01
        silence_ratio = np.sum(np.abs(audio) < silence_threshold) / len(audio)
        
        # RMS energy
        rms_energy = np.sqrt(np.mean(audio ** 2))
        
        # Zero crossing rate
        zcr = np.mean(librosa.feature.zero_crossing_rate(audio))
        
        return {
            'snr': float(snr),
            'clipping_detected': bool(clipping_detected),
            'clipping_ratio': float(clipping_ratio),
            'silence_ratio': float(silence_ratio),
            'rms_energy': float(rms_energy),
            'zero_crossing_rate': float(zcr)
        }
    
    @staticmethod
    def _extract_spectral_features(audio: np.ndarray, sr: int) -> Dict:
        """Extract spectral features from audio."""
        # MFCC features
        mfccs = librosa.feature.mfcc(y=audio, sr=sr, n_mfcc=13)
        
        # Spectral features
        spectral_centroids = librosa.feature.spectral_centroid(y=audio, sr=sr)
        spectral_rolloff = librosa.feature.spectral_rolloff(y=audio, sr=sr)
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=audio, sr=sr)
        
        # Pitch features
        pitches, magnitudes = librosa.piptrack(y=audio, sr=sr)
        
        return {
            'mfcc_mean': mfccs.mean(axis=1).tolist(),
            'mfcc_std': mfccs.std(axis=1).tolist(),
            'spectral_centroid_mean': float(np.mean(spectral_centroids)),
            'spectral_rolloff_mean': float(np.mean(spectral_rolloff)),
            'spectral_bandwidth_mean': float(np.mean(spectral_bandwidth)),
            'pitch_mean': float(np.mean(pitches[pitches > 0])) if np.any(pitches > 0) else 0.0,
        }
    
    @staticmethod
    def _segment_speech_silence(audio: np.ndarray, sr: int, 
                               frame_length: int = 2048, 
                               hop_length: int = 512) -> Tuple[List, List]:
        """Segment audio into speech and silence regions."""
        # Calculate RMS energy
        rms = librosa.feature.rms(y=audio, frame_length=frame_length, hop_length=hop_length)[0]
        
        # Adaptive threshold based on audio statistics
        threshold = np.percentile(rms, 30)  # Use 30th percentile as threshold
        
        # Convert frame indices to time
        times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)
        
        # Find speech and silence segments
        is_speech = rms > threshold
        
        speech_segments = []
        silence_segments = []
        
        # Group consecutive frames
        current_type = is_speech[0]
        start_time = times[0]
        
        for i in range(1, len(is_speech)):
            if is_speech[i] != current_type:
                end_time = times[i]
                
                if current_type:  # Was speech
                    speech_segments.append([float(start_time), float(end_time)])
                else:  # Was silence
                    silence_segments.append([float(start_time), float(end_time)])
                
                current_type = is_speech[i]
                start_time = times[i]
        
        # Handle last segment
        end_time = times[-1]
        if current_type:
            speech_segments.append([float(start_time), float(end_time)])
        else:
            silence_segments.append([float(start_time), float(end_time)])
        
        return speech_segments, silence_segments
    
    @staticmethod
    def _validate_audio_quality(quality_metrics: Dict, properties: Dict) -> bool:
        """Validate audio quality based on metrics."""
        # Duration check
        if properties['duration'] < AudioProcessor.MIN_DURATION or properties['duration'] > AudioProcessor.MAX_DURATION:
            return False
        
        # SNR check
        if quality_metrics['snr'] < 10:  # Minimum 10 dB SNR
            return False
        
        # Clipping check
        if quality_metrics['clipping_ratio'] > 0.01:  # Max 1% clipping
            return False
        
        # Silence check
        if quality_metrics['silence_ratio'] > 0.8:  # Max 80% silence
            return False
        
        # Energy check
        if quality_metrics['rms_energy'] < 0.001:  # Minimum energy threshold
            return False
        
        return True
    
    @staticmethod
    def convert_to_standard_format(input_file: str, output_file: str) -> bool:
        """Convert audio to standard format (16kHz, mono, WAV)."""
        try:
            # Load audio with pydub for format flexibility
            audio = AudioSegment.from_file(input_file)
            
            # Convert to mono
            if audio.channels > 1:
                audio = audio.set_channels(1)
            
            # Convert to target sample rate
            if audio.frame_rate != AudioProcessor.TARGET_SAMPLE_RATE:
                audio = audio.set_frame_rate(AudioProcessor.TARGET_SAMPLE_RATE)
            
            # Export as WAV
            audio.export(output_file, format="wav")
            
            return True
            
        except Exception as e:
            print(f"Error converting audio: {e}")
            return False
    
    @staticmethod
    def trim_silence(audio_file: str, output_file: str, silence_threshold: float = 0.01) -> bool:
        """Trim silence from beginning and end of audio file."""
        try:
            audio, sr = librosa.load(audio_file, sr=None)
            
            # Find non-silent regions
            non_silent = np.abs(audio) > silence_threshold
            
            if not np.any(non_silent):
                return False  # Entire audio is silent
            
            # Find start and end of non-silent region
            start_idx = np.argmax(non_silent)
            end_idx = len(audio) - np.argmax(non_silent[::-1]) - 1
            
            # Trim audio
            trimmed_audio = audio[start_idx:end_idx + 1]
            
            # Save trimmed audio
            sf.write(output_file, trimmed_audio, sr)
            
            return True
            
        except Exception as e:
            print(f"Error trimming silence: {e}")
            return False