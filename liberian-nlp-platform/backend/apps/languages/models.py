from django.db import models
from django.core.validators import MinLengthValidator


class Language(models.Model):
    """Liberian languages and dialects."""
    
    class LanguageFamily(models.TextChoices):
        MANDE = 'mande', 'Mande'
        KRU = 'kru', 'Kru'
        MEL = 'mel', 'Mel'
        NIGER_CONGO = 'niger_congo', 'Niger-Congo'
        CREOLE = 'creole', 'Creole'
    
    name = models.CharField(max_length=100, unique=True)
    iso_code = models.CharField(max_length=10, unique=True, null=True, blank=True)
    family = models.CharField(max_length=20, choices=LanguageFamily.choices)
    is_active = models.BooleanField(default=True)
    description = models.TextField(blank=True)
    
    # Geographic and demographic info
    regions = models.TextField(help_text="Comma-separated list of regions")
    estimated_speakers = models.PositiveIntegerField(null=True, blank=True)
    
    # Language status
    endangerment_level = models.CharField(
        max_length=20,
        choices=[
            ('safe', 'Safe'),
            ('vulnerable', 'Vulnerable'),
            ('definitely_endangered', 'Definitely Endangered'),
            ('severely_endangered', 'Severely Endangered'),
            ('critically_endangered', 'Critically Endangered'),
            ('extinct', 'Extinct'),
        ],
        default='safe'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['name']
    
    def __str__(self) -> str:
        return self.name


class Script(models.Model):
    """Writing systems used for languages."""
    
    name = models.CharField(max_length=50, unique=True)
    unicode_range = models.CharField(max_length=100, blank=True)
    direction = models.CharField(
        max_length=10,
        choices=[('ltr', 'Left-to-Right'), ('rtl', 'Right-to-Left')],
        default='ltr'
    )
    description = models.TextField(blank=True)
    
    def __str__(self) -> str:
        return self.name


class Orthography(models.Model):
    """Orthographic conventions for languages."""
    
    language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='orthographies')
    script = models.ForeignKey(Script, on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    is_official = models.BooleanField(default=False)
    is_primary = models.BooleanField(default=False)
    
    # Character mappings and rules
    alphabet = models.TextField(help_text="Characters used in this orthography")
    tone_marking = models.BooleanField(default=False)
    tone_system = models.TextField(blank=True)
    
    # Validation rules
    character_set = models.TextField(blank=True, help_text="Allowed characters (regex)")
    normalization_rules = models.JSONField(default=dict, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['language', 'name']
        ordering = ['-is_primary', '-is_official', 'name']
    
    def __str__(self) -> str:
        return f"{self.language.name} - {self.name}"


class LanguageVariant(models.Model):
    """Dialects and regional variants."""
    
    language = models.ForeignKey(Language, on_delete=models.CASCADE, related_name='variants')
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=100)
    is_standard = models.BooleanField(default=False)
    
    # Linguistic features
    phonological_notes = models.TextField(blank=True)
    lexical_notes = models.TextField(blank=True)
    grammatical_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['language', 'name']
    
    def __str__(self) -> str:
        return f"{self.language.name} ({self.name})"


class LanguagePair(models.Model):
    """Translation pairs for MT tasks."""
    
    source_language = models.ForeignKey(
        Language, 
        on_delete=models.CASCADE, 
        related_name='source_pairs'
    )
    target_language = models.ForeignKey(
        Language, 
        on_delete=models.CASCADE, 
        related_name='target_pairs'
    )
    is_active = models.BooleanField(default=True)
    priority = models.PositiveIntegerField(default=1)
    
    # Statistics
    sentence_count = models.PositiveIntegerField(default=0)
    validated_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['source_language', 'target_language']
        ordering = ['-priority', 'source_language__name']
    
    def __str__(self) -> str:
        return f"{self.source_language.name} → {self.target_language.name}"