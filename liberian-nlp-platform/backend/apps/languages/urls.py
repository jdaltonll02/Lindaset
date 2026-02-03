from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'languages', views.LanguageViewSet)
router.register(r'text-data', views.TextDataViewSet)
router.register(r'audio-data', views.AudioDataViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('languages/', views.languages_list, name='languages-list'),
    path('languages/create/', views.create_language, name='create-language'),
]