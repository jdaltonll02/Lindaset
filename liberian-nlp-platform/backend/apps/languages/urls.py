from django.urls import path
from . import views

urlpatterns = [
    path('', views.LanguageListView.as_view(), name='language-list'),
    path('<int:pk>/', views.LanguageDetailView.as_view(), name='language-detail'),
    path('scripts/', views.ScriptListView.as_view(), name='script-list'),
    path('orthographies/', views.OrthographyListView.as_view(), name='orthography-list'),
    path('variants/', views.LanguageVariantListView.as_view(), name='variant-list'),
    path('pairs/', views.LanguagePairListView.as_view(), name='pair-list'),
    path('stats/', views.language_stats, name='language-stats'),
    path('liberian/', views.liberian_languages, name='liberian-languages'),
]