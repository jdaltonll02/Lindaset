from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from apps.languages.models import Language
from apps.languages.serializers import LanguageSerializer

def is_admin_or_superuser(user):
    """Check if user has admin privileges"""
    return hasattr(user, 'role') and user.role in ['admin', 'superuser']

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def admin_languages(request):
    """List all languages or create a new language (admin/superuser only)"""
    if not is_admin_or_superuser(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    if request.method == 'GET':
        languages = Language.objects.all().order_by('name')
        serializer = LanguageSerializer(languages, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = LanguageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def admin_language_detail(request, language_id):
    """Get, update, or delete a specific language (admin/superuser only)"""
    if not is_admin_or_superuser(request.user):
        return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
    
    try:
        language = Language.objects.get(id=language_id)
    except Language.DoesNotExist:
        return Response({'error': 'Language not found'}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serializer = LanguageSerializer(language)
        return Response(serializer.data)
    
    elif request.method in ['PUT', 'PATCH']:
        serializer = LanguageSerializer(language, data=request.data, partial=request.method == 'PATCH')
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        if not (hasattr(request.user, 'role') and request.user.role == 'superuser'):
            return Response({'error': 'Only superusers can delete languages'}, status=status.HTTP_403_FORBIDDEN)
        
        language.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)