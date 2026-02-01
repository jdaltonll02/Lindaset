from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/accounts/', include('apps.accounts.urls')),
    path('api/v1/languages/', include('apps.languages.urls')),
    path('api/v1/tasks/', include('apps.tasks.urls')),
    path('api/v1/text-data/', include('apps.text_data.urls')),
    path('api/v1/audio-data/', include('apps.audio_data.urls')),
    path('api/v1/reviews/', include('apps.reviews.urls')),
    path('api/v1/quality/', include('apps.quality.urls')),
    path('api/v1/datasets/', include('apps.datasets.urls')),
    path('api/v1/governance/', include('apps.governance.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)