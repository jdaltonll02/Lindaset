from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from django.db import transaction
from .models import Corpus, Sentence, Translation, SentenceMetadata
from .serializers import (
    CorpusSerializer, SentenceSerializer, SentenceListSerializer,
    TranslationSerializer, TranslationPairSerializer, CorpusStatsSerializer,
    SentenceMetadataSerializer
)


class CorpusListView(generics.ListCreateAPIView):
    """List and create corpora."""
    
    serializer_class = CorpusSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Corpus.objects.all()
        
        # Filter by language
        language = self.request.query_params.get('language')
        if language:
            queryset = queryset.filter(language_id=language)
        
        # Filter by type
        corpus_type = self.request.query_params.get('type')
        if corpus_type:
            queryset = queryset.filter(corpus_type=corpus_type)
        
        # Filter by public/private
        is_public = self.request.query_params.get('public')
        if is_public is not None:
            queryset = queryset.filter(is_public=is_public.lower() == 'true')
        
        return queryset.order_by('-created_at')


class CorpusDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a corpus."""
    
    queryset = Corpus.objects.all()
    serializer_class = CorpusSerializer
    permission_classes = [permissions.IsAuthenticated]


class SentenceListView(generics.ListCreateAPIView):
    """List and create sentences."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return SentenceListSerializer
        return SentenceSerializer
    
    def get_queryset(self):
        queryset = Sentence.objects.select_related('language', 'corpus', 'contributed_by')
        
        # Filter by corpus
        corpus = self.request.query_params.get('corpus')
        if corpus:
            queryset = queryset.filter(corpus_id=corpus)
        
        # Filter by language
        language = self.request.query_params.get('language')
        if language:
            queryset = queryset.filter(language_id=language)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by contributor
        contributor = self.request.query_params.get('contributor')
        if contributor:
            queryset = queryset.filter(contributed_by_id=contributor)
        
        return queryset.order_by('-created_at')


class SentenceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a sentence."""
    
    queryset = Sentence.objects.all()
    serializer_class = SentenceSerializer
    permission_classes = [permissions.IsAuthenticated]


class TranslationListView(generics.ListCreateAPIView):
    """List and create translations."""
    
    queryset = Translation.objects.select_related(
        'source_sentence__language', 'target_sentence__language', 'translated_by'
    )
    serializer_class = TranslationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by source language
        source_lang = self.request.query_params.get('source_language')
        if source_lang:
            queryset = queryset.filter(source_sentence__language_id=source_lang)
        
        # Filter by target language
        target_lang = self.request.query_params.get('target_language')
        if target_lang:
            queryset = queryset.filter(target_sentence__language_id=target_lang)
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-created_at')


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_translation_pair(request):
    """Create a translation pair (source + target sentences + translation)."""
    
    serializer = TranslationPairSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    data = serializer.validated_data
    
    try:
        with transaction.atomic():
            # Create source sentence
            source_sentence = Sentence.objects.create(
                text=data['source_text'],
                language_id=data['source_language_id'],
                corpus_id=data['corpus_id'],
                difficulty_level=data['difficulty_level'],
                contributed_by=request.user,
                status=Sentence.SentenceStatus.SUBMITTED
            )
            
            # Create target sentence
            target_sentence = Sentence.objects.create(
                text=data['target_text'],
                language_id=data['target_language_id'],
                corpus_id=data['corpus_id'],
                difficulty_level=data['difficulty_level'],
                source_text=data['source_text'],
                source_language_id=data['source_language_id'],
                contributed_by=request.user,
                status=Sentence.SentenceStatus.SUBMITTED
            )
            
            # Create translation
            translation = Translation.objects.create(
                source_sentence=source_sentence,
                target_sentence=target_sentence,
                translation_type=data['translation_type'],
                translated_by=request.user,
                status=Translation.TranslationStatus.SUBMITTED
            )
            
            return Response({
                'translation': TranslationSerializer(translation).data,
                'message': 'Translation pair created successfully'
            }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response({
            'error': f'Failed to create translation pair: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def corpus_stats(request):
    """Get corpus and sentence statistics."""
    
    total_corpora = Corpus.objects.count()
    total_sentences = Sentence.objects.count()
    total_translations = Translation.objects.count()
    validated_sentences = Sentence.objects.filter(status='validated').count()
    
    # Statistics by language
    by_language = dict(
        Sentence.objects.values('language__name')
        .annotate(count=Count('id'))
        .values_list('language__name', 'count')
    )
    
    # Statistics by status
    by_status = dict(
        Sentence.objects.values('status')
        .annotate(count=Count('id'))
        .values_list('status', 'count')
    )
    
    # Statistics by corpus type
    by_corpus_type = dict(
        Corpus.objects.values('corpus_type')
        .annotate(count=Count('id'))
        .values_list('corpus_type', 'count')
    )
    
    stats = {
        'total_corpora': total_corpora,
        'total_sentences': total_sentences,
        'total_translations': total_translations,
        'validated_sentences': validated_sentences,
        'by_language': by_language,
        'by_status': by_status,
        'by_corpus_type': by_corpus_type,
    }
    
    serializer = CorpusStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def random_sentence(request):
    """Get a random sentence for translation."""
    
    language_id = request.query_params.get('language')
    corpus_id = request.query_params.get('corpus')
    
    queryset = Sentence.objects.filter(status='validated')
    
    if language_id:
        queryset = queryset.filter(language_id=language_id)
    if corpus_id:
        queryset = queryset.filter(corpus_id=corpus_id)
    
    # Get random sentence
    sentence = queryset.order_by('?').first()
    
    if sentence:
        serializer = SentenceSerializer(sentence)
        return Response(serializer.data)
    else:
        return Response({'message': 'No sentences available'}, 
                       status=status.HTTP_404_NOT_FOUND)


class SentenceMetadataView(generics.RetrieveUpdateAPIView):
    """Manage sentence metadata."""
    
    serializer_class = SentenceMetadataSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        sentence_id = self.kwargs['sentence_id']
        sentence = Sentence.objects.get(id=sentence_id)
        metadata, created = SentenceMetadata.objects.get_or_create(sentence=sentence)
        return metadata