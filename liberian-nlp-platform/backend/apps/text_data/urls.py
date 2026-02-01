from django.urls import path
from . import views

urlpatterns = [
    path('corpora/', views.CorpusListView.as_view(), name='corpus-list'),
    path('corpora/<int:pk>/', views.CorpusDetailView.as_view(), name='corpus-detail'),
    path('sentences/', views.SentenceListView.as_view(), name='sentence-list'),
    path('sentences/<uuid:pk>/', views.SentenceDetailView.as_view(), name='sentence-detail'),
    path('sentences/<uuid:sentence_id>/metadata/', views.SentenceMetadataView.as_view(), name='sentence-metadata'),
    path('translations/', views.TranslationListView.as_view(), name='translation-list'),
    path('translation-pairs/', views.create_translation_pair, name='create-translation-pair'),
    path('stats/', views.corpus_stats, name='corpus-stats'),
    path('random-sentence/', views.random_sentence, name='random-sentence'),
]