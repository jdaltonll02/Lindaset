from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('consent/', views.ConsentView.as_view(), name='consent'),
    path('stats/', views.user_stats, name='user-stats'),
    path('users/', views.UserListView.as_view(), name='user-list'),
]