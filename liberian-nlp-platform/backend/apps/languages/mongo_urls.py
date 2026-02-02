from django.urls import path
from . import mongo_views

urlpatterns = [
    path('api/languages/', mongo_views.languages_api, name='languages-api'),
    path('api/translations/', mongo_views.translations_api, name='translations-api'),
    path('api/audio/', mongo_views.audio_api, name='audio-api'),
    path('api/stats/', mongo_views.stats_api, name='stats-api'),
]