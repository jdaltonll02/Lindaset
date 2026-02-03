from django.urls import path
from . import views
from . import registration_views
from . import admin_views
from . import auth_views
from . import language_admin_views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.ProfileView.as_view(), name='profile'),
    path('consent/', views.ConsentView.as_view(), name='consent'),
    path('stats/', views.user_stats, name='user-stats'),
    path('users/', views.UserListView.as_view(), name='user-list'),
    # Registration API endpoints
    path('api/register/', registration_views.register_user, name='api-register'),
    path('api/check-username/', registration_views.check_username, name='check-username'),
    path('api/check-email/', registration_views.check_email, name='check-email'),
    # Admin API endpoints
    path('api/admin/users/', admin_views.admin_users, name='admin-users'),
    path('api/admin/users/<int:user_id>/', admin_views.admin_user_detail, name='admin-user-detail'),
    path('api/admin/languages/', language_admin_views.admin_languages, name='admin-languages'),
    path('api/admin/languages/<int:language_id>/', language_admin_views.admin_language_detail, name='admin-language-detail'),
    # Auth API endpoints
    path('forgot-password/', auth_views.forgot_password, name='forgot-password'),
    path('reset-password/', auth_views.reset_password, name='reset-password'),
    path('2fa/send-code/', auth_views.send_2fa_code, name='send-2fa-code'),
    path('2fa/verify/', auth_views.verify_2fa_code, name='verify-2fa-code'),
]