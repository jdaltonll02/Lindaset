from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.http import JsonResponse
from django.conf import settings

try:
    from apps.languages.mongo_models import Language, TextData, AudioData
    MONGODB_AVAILABLE = getattr(settings, 'MONGODB_AVAILABLE', True)
except ImportError:
    MONGODB_AVAILABLE = False

@api_view(['GET', 'POST'])
def languages_api(request):
    if not MONGODB_AVAILABLE:
        return Response({'error': 'MongoDB not available'}, status=503)
        
    if request.method == 'GET':
        languages = Language.objects.all()
        data = [{
            'id': str(lang.id),
            'name': lang.name,
            'iso_code': lang.iso_code,
            'family': lang.family,
            'is_active': lang.is_active,
            'regions': lang.regions,
            'estimated_speakers': lang.estimated_speakers,
            'endangerment_level': lang.endangerment_level
        } for lang in languages]
        return Response(data)
    
    elif request.method == 'POST':
        data = request.data
        language = Language(
            name=data['name'],
            iso_code=data.get('iso_code'),
            family=data.get('family', 'niger_congo'),
            regions=data.get('regions', 'Liberia'),
            endangerment_level=data.get('endangerment_level', 'safe')
        )
        language.save()
        return Response({'id': str(language.id), 'message': 'Language created'}, status=201)

@api_view(['GET', 'POST'])
def translations_api(request):
    if not MONGODB_AVAILABLE:
        return Response({'error': 'MongoDB not available'}, status=503)
        
    if request.method == 'GET':
        translations = TextData.objects.all()[:20]
        data = [{
            'id': str(trans.id),
            'source_text': trans.source_text,
            'target_text': trans.target_text,
            'source_language': trans.source_language,
            'target_language': trans.target_language,
            'contributor': trans.contributor,
            'status': trans.status,
            'created_at': trans.created_at.isoformat()
        } for trans in translations]
        return Response(data)
    
    elif request.method == 'POST':
        data = request.data
        translation = TextData(
            source_text=data['source_text'],
            target_text=data['target_text'],
            source_language=data['source_language'],
            target_language=data['target_language'],
            contributor=data.get('contributor', 'anonymous')
        )
        translation.save()
        return Response({'id': str(translation.id), 'message': 'Translation saved'}, status=201)

@api_view(['GET', 'POST'])
def audio_api(request):
    if not MONGODB_AVAILABLE:
        return Response({'error': 'MongoDB not available'}, status=503)
        
    if request.method == 'GET':
        audio_data = AudioData.objects.all()[:20]
        data = [{
            'id': str(audio.id),
            'text': audio.text,
            'language': audio.language,
            'file_path': audio.file_path,
            'duration': audio.duration,
            'speaker_gender': audio.speaker_gender,
            'quality_score': audio.quality_score,
            'contributor': audio.contributor,
            'status': audio.status,
            'created_at': audio.created_at.isoformat()
        } for audio in audio_data]
        return Response(data)
    
    elif request.method == 'POST':
        data = request.data
        audio = AudioData(
            text=data['text'],
            language=data['language'],
            file_path=data.get('file_path', '/tmp/audio.wav'),
            duration=data.get('duration', 0),
            speaker_gender=data.get('speaker_gender'),
            quality_score=data.get('quality_score', 3),
            contributor=data.get('contributor', 'anonymous')
        )
        audio.save()
        return Response({'id': str(audio.id), 'message': 'Audio saved'}, status=201)

@api_view(['GET'])
def stats_api(request):
    if not MONGODB_AVAILABLE:
        return Response({
            'total_languages': 0,
            'total_translations': 0,
            'total_audio': 0,
            'pending_reviews': 0,
            'mongodb_status': 'unavailable'
        })
        
    return Response({
        'total_languages': Language.objects.count(),
        'total_translations': TextData.objects.count(),
        'total_audio': AudioData.objects.count(),
        'pending_reviews': TextData.objects(status='pending').count() + AudioData.objects(status='pending').count(),
        'mongodb_status': 'connected'
    })