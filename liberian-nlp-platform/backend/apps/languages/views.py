from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Language, Script, Orthography, LanguageVariant, LanguagePair
from .serializers import (
    LanguageSerializer, LanguageListSerializer, ScriptSerializer,
    OrthographySerializer, LanguageVariantSerializer, LanguagePairSerializer,
    LanguageStatsSerializer
)


class LanguageListView(generics.ListCreateAPIView):
    """List and create languages."""
    
    queryset = Language.objects.filter(is_active=True)
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return LanguageListSerializer
        return LanguageSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        family = self.request.query_params.get('family')
        endangerment = self.request.query_params.get('endangerment')
        
        if family:
            queryset = queryset.filter(family=family)
        if endangerment:
            queryset = queryset.filter(endangerment_level=endangerment)
        
        return queryset.order_by('name')


class LanguageDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update, or delete a language."""
    
    queryset = Language.objects.all()
    serializer_class = LanguageSerializer
    permission_classes = [permissions.IsAuthenticated]


class ScriptListView(generics.ListCreateAPIView):
    """List and create scripts."""
    
    queryset = Script.objects.all()
    serializer_class = ScriptSerializer
    permission_classes = [permissions.IsAuthenticated]


class OrthographyListView(generics.ListCreateAPIView):
    """List and create orthographies."""
    
    serializer_class = OrthographySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        language_id = self.request.query_params.get('language')
        queryset = Orthography.objects.all()
        
        if language_id:
            queryset = queryset.filter(language_id=language_id)
        
        return queryset.order_by('-is_primary', '-is_official', 'name')


class LanguageVariantListView(generics.ListCreateAPIView):
    """List and create language variants."""
    
    serializer_class = LanguageVariantSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        language_id = self.request.query_params.get('language')
        queryset = LanguageVariant.objects.all()
        
        if language_id:
            queryset = queryset.filter(language_id=language_id)
        
        return queryset.order_by('-is_standard', 'name')


class LanguagePairListView(generics.ListCreateAPIView):
    """List and create language pairs."""
    
    queryset = LanguagePair.objects.filter(is_active=True)
    serializer_class = LanguagePairSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        source = self.request.query_params.get('source')
        target = self.request.query_params.get('target')
        
        if source:
            queryset = queryset.filter(source_language_id=source)
        if target:
            queryset = queryset.filter(target_language_id=target)
        
        return queryset.order_by('-priority', 'source_language__name')


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def language_stats(request):
    """Get language statistics."""
    
    total_languages = Language.objects.count()
    active_languages = Language.objects.filter(is_active=True).count()
    total_pairs = LanguagePair.objects.filter(is_active=True).count()
    
    # Get sentence counts from text_data app (will be implemented later)
    total_sentences = 0  # TODO: Implement when text_data app is ready
    validated_sentences = 0  # TODO: Implement when reviews app is ready
    
    # Statistics by family
    by_family = dict(
        Language.objects.values('family')
        .annotate(count=Count('id'))
        .values_list('family', 'count')
    )
    
    # Statistics by endangerment level
    by_endangerment = dict(
        Language.objects.values('endangerment_level')
        .annotate(count=Count('id'))
        .values_list('endangerment_level', 'count')
    )
    
    stats = {
        'total_languages': total_languages,
        'active_languages': active_languages,
        'total_pairs': total_pairs,
        'total_sentences': total_sentences,
        'validated_sentences': validated_sentences,
        'by_family': by_family,
        'by_endangerment': by_endangerment,
    }
    
    serializer = LanguageStatsSerializer(stats)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def liberian_languages(request):
    """Get all 16 Liberian tribal languages."""
    
    # Pre-populate with known Liberian languages
    liberian_languages = [
        'Bassa', 'Kpelle', 'Gio', 'Mano', 'Krahn', 'Grebo',
        'Vai', 'Gola', 'Kissi', 'Gbandi', 'Loma', 'Mandingo',
        'Mende', 'Kru', 'Sapo', 'Belleh'
    ]
    
    languages = Language.objects.filter(
        name__in=liberian_languages,
        is_active=True
    ).order_by('name')
    
    serializer = LanguageListSerializer(languages, many=True)
    return Response(serializer.data)