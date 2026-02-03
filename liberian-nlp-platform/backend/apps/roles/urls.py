from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PermissionViewSet, CustomRoleViewSet, UserRoleViewSet

router = DefaultRouter()
router.register(r'permissions', PermissionViewSet)
router.register(r'roles', CustomRoleViewSet)
router.register(r'user-roles', UserRoleViewSet)

urlpatterns = [
    path('', include(router.urls)),
]