from django.db import models
from django.conf import settings

class Language(models.Model):
    FAMILY_CHOICES = [
        ('niger_congo', 'Niger-Congo'),
        ('mande', 'Mande'),
        ('kru', 'Kru'),
        ('atlantic', 'Atlantic'),
        ('other', 'Other'),
    ]
    
    ENDANGERMENT_CHOICES = [
        ('safe', 'Safe'),
        ('vulnerable', 'Vulnerable'),
        ('definitely_endangered', 'Definitely Endangered'),
        ('severely_endangered', 'Severely Endangered'),
        ('critically_endangered', 'Critically Endangered'),
        ('extinct', 'Extinct'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    iso_code = models.CharField(max_length=10, blank=True, null=True)
    family = models.CharField(max_length=20, choices=FAMILY_CHOICES, default='niger_congo')
    estimated_speakers = models.IntegerField(blank=True, null=True)
    endangerment_level = models.CharField(max_length=25, choices=ENDANGERMENT_CHOICES, default='safe')
    regions = models.TextField(blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self):
        return self.name

class TextData(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    source_text = models.TextField()
    target_text = models.TextField()
    source_language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='source_texts')
    target_language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='target_texts')
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.source_text[:50]} -> {self.target_text[:50]}"

class AudioData(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    text = models.TextField()
    language = models.ForeignKey(Language, on_delete=models.CASCADE)
    file_path = models.CharField(max_length=500)
    duration = models.IntegerField(blank=True, null=True)  # in seconds
    speaker_gender = models.CharField(max_length=10, choices=GENDER_CHOICES, blank=True)
    speaker_age_range = models.CharField(max_length=20, blank=True)
    quality_score = models.IntegerField(blank=True, null=True)  # 1-5
    contributor = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.text[:50]} ({self.language.name})"