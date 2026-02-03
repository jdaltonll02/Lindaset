from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Language, TextData, AudioData
from .serializers import LanguageSerializer, TextDataSerializer, AudioDataSerializer

class LanguageViewSet(viewsets.ModelViewSet):
    queryset = Language.objects.filter(is_active=True)
    serializer_class = LanguageSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = []
        return [permission() for permission in permission_classes]

@api_view(['GET'])
def languages_list(request):
    """Public endpoint to list all active languages"""
    languages = Language.objects.filter(is_active=True)
    serializer = LanguageSerializer(languages, many=True)
    return Response({'data': serializer.data})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_language(request):
    """Create a new language (admin only)"""
    if not request.user.is_staff and getattr(request.user, 'role', 'contributor') not in ['admin', 'superuser']:
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    serializer = LanguageSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TextDataViewSet(viewsets.ModelViewSet):
    queryset = TextData.objects.all()
    serializer_class = TextDataSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(contributor=self.request.user)

class AudioDataViewSet(viewsets.ModelViewSet):
    queryset = AudioData.objects.all()
    serializer_class = AudioDataSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(contributor=self.request.user)