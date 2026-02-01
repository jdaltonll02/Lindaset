from django.urls import path
from . import views

urlpatterns = [
    path('recordings/', views.AudioRecordingListView.as_view(), name='recording-list'),
    path('recordings/<uuid:pk>/', views.AudioRecordingDetailView.as_view(), name='recording-detail'),
    path('recordings/<uuid:recording_id>/processing/', views.AudioProcessingResultView.as_view(), name='processing-result'),
    path('upload/', views.upload_audio, name='upload-audio'),
    path('speaker-profile/', views.SpeakerProfileView.as_view(), name='speaker-profile'),
    path('datasets/', views.AudioDatasetListView.as_view(), name='dataset-list'),
    path('stats/', views.audio_stats, name='audio-stats'),
    path('sentence/<uuid:sentence_id>/recordings/', views.recording_for_sentence, name='sentence-recordings'),
]