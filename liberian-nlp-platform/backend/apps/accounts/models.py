from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from typing import Optional


class User(AbstractUser):
    """Extended user model with NLP platform specific fields."""
    
    class UserRole(models.TextChoices):
        CONTRIBUTOR = 'contributor', 'Contributor'
        REVIEWER = 'reviewer', 'Reviewer'
        LANGUAGE_LEAD = 'language_lead', 'Language Lead'
        ADMIN = 'admin', 'Admin'
    
    role = models.CharField(
        max_length=20,
        choices=UserRole.choices,
        default=UserRole.CONTRIBUTOR
    )
    
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='nlp_users',
        related_query_name='nlp_user',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='nlp_users',
        related_query_name='nlp_user',
    )
    reputation_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    preferred_languages = models.ManyToManyField(
        'languages.Language',
        blank=True,
        related_name='preferred_by_users'
    )
    consent_given = models.BooleanField(default=False)
    consent_date = models.DateTimeField(null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self) -> str:
        return f"{self.username} ({self.role})"

    @property
    def can_review(self) -> bool:
        """Check if user can perform reviews."""
        return self.role in [self.UserRole.REVIEWER, self.UserRole.LANGUAGE_LEAD, self.UserRole.ADMIN]

    @property
    def can_approve_datasets(self) -> bool:
        """Check if user can approve dataset releases."""
        return self.role in [self.UserRole.LANGUAGE_LEAD, self.UserRole.ADMIN]


class UserProfile(models.Model):
    """Additional user profile information."""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(max_length=500, blank=True)
    location = models.CharField(max_length=100, blank=True)
    native_languages = models.ManyToManyField(
        'languages.Language',
        blank=True,
        related_name='native_speakers'
    )
    contribution_count = models.PositiveIntegerField(default=0)
    review_count = models.PositiveIntegerField(default=0)
    
    def __str__(self) -> str:
        return f"Profile for {self.user.username}"


class ConsentRecord(models.Model):
    """Track user consent for data usage."""
    
    class ConsentType(models.TextChoices):
        DATA_COLLECTION = 'data_collection', 'Data Collection'
        RESEARCH_USE = 'research_use', 'Research Use'
        COMMERCIAL_USE = 'commercial_use', 'Commercial Use'
        PUBLIC_RELEASE = 'public_release', 'Public Release'
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='consent_records')
    consent_type = models.CharField(max_length=20, choices=ConsentType.choices)
    granted = models.BooleanField()
    granted_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    class Meta:
        unique_together = ['user', 'consent_type']
    
    def __str__(self) -> str:
        status = "granted" if self.granted else "denied"
        return f"{self.user.username} - {self.consent_type} ({status})"