from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
import uuid

User = get_user_model()


class Review(models.Model):
    """Human reviews for sentences, translations, and audio recordings."""
    
    class ReviewType(models.TextChoices):
        SENTENCE = 'sentence', 'Sentence Review'
        TRANSLATION = 'translation', 'Translation Review'
        AUDIO = 'audio', 'Audio Review'
    
    class ReviewDecision(models.TextChoices):
        APPROVE = 'approve', 'Approve'
        REJECT = 'reject', 'Reject'
        REQUEST_CHANGES = 'request_changes', 'Request Changes'
        NEEDS_MORE_REVIEWS = 'needs_more_reviews', 'Needs More Reviews'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Generic foreign key to review any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=255)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Review metadata
    review_type = models.CharField(max_length=20, choices=ReviewType.choices)
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews_given')
    decision = models.CharField(max_length=20, choices=ReviewDecision.choices)
    
    # Review content
    comments = models.TextField(blank=True)
    confidence = models.FloatField(
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Reviewer's confidence in their decision (0-1)"
    )
    
    # Quality ratings (1-5 scale)
    accuracy_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    fluency_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    cultural_appropriateness = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        null=True, blank=True
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['content_type', 'object_id', 'reviewer']
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
            models.Index(fields=['reviewer']),
            models.Index(fields=['decision']),
        ]
    
    def __str__(self) -> str:
        return f"Review by {self.reviewer.username} - {self.decision}"


class ReviewAssignment(models.Model):
    """Assign items to reviewers for validation."""
    
    class AssignmentStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        SKIPPED = 'skipped', 'Skipped'
        EXPIRED = 'expired', 'Expired'
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Generic foreign key to assign any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=255)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Assignment details
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_assignments')
    status = models.CharField(max_length=20, choices=AssignmentStatus.choices, default=AssignmentStatus.PENDING)
    priority = models.PositiveIntegerField(default=1)
    
    # Timestamps
    assigned_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        unique_together = ['content_type', 'object_id', 'reviewer']
        indexes = [
            models.Index(fields=['reviewer', 'status']),
            models.Index(fields=['due_date']),
        ]
    
    def __str__(self) -> str:
        return f"Assignment for {self.reviewer.username} - {self.status}"


class ReviewCriteria(models.Model):
    """Criteria for reviewing different types of content."""
    
    review_type = models.CharField(max_length=20, choices=Review.ReviewType.choices)
    language = models.ForeignKey('languages.Language', on_delete=models.CASCADE)
    
    # Criteria definitions
    criteria_name = models.CharField(max_length=100)
    description = models.TextField()
    weight = models.FloatField(default=1.0, validators=[MinValueValidator(0.0)])
    
    # Scoring guidelines
    scoring_guidelines = models.JSONField(default=dict, blank=True)
    examples = models.JSONField(default=list, blank=True)
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['review_type', 'language', 'criteria_name']
    
    def __str__(self) -> str:
        return f"{self.criteria_name} ({self.review_type} - {self.language.name})"


class ReviewerQualification(models.Model):
    """Track reviewer qualifications and performance."""
    
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, related_name='qualifications')
    language = models.ForeignKey('languages.Language', on_delete=models.CASCADE)
    review_type = models.CharField(max_length=20, choices=Review.ReviewType.choices)
    
    # Qualification status
    is_qualified = models.BooleanField(default=False)
    qualification_date = models.DateTimeField(null=True, blank=True)
    
    # Performance metrics
    reviews_completed = models.PositiveIntegerField(default=0)
    average_confidence = models.FloatField(default=0.0)
    agreement_rate = models.FloatField(default=0.0)  # Agreement with other reviewers
    
    # Quality scores
    accuracy_score = models.FloatField(default=0.0)
    consistency_score = models.FloatField(default=0.0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['reviewer', 'language', 'review_type']
    
    def __str__(self) -> str:
        status = "Qualified" if self.is_qualified else "Not Qualified"
        return f"{self.reviewer.username} - {self.language.name} {self.review_type} ({status})"


class ReviewConsensus(models.Model):
    """Track consensus across multiple reviews for the same item."""
    
    class ConsensusStatus(models.TextChoices):
        PENDING = 'pending', 'Pending'
        CONSENSUS_REACHED = 'consensus_reached', 'Consensus Reached'
        DISPUTED = 'disputed', 'Disputed'
        ESCALATED = 'escalated', 'Escalated'
    
    # Generic foreign key to track consensus for any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.CharField(max_length=255)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Consensus details
    status = models.CharField(max_length=20, choices=ConsensusStatus.choices, default=ConsensusStatus.PENDING)
    final_decision = models.CharField(
        max_length=20, 
        choices=Review.ReviewDecision.choices,
        null=True, blank=True
    )
    
    # Statistics
    total_reviews = models.PositiveIntegerField(default=0)
    approve_count = models.PositiveIntegerField(default=0)
    reject_count = models.PositiveIntegerField(default=0)
    request_changes_count = models.PositiveIntegerField(default=0)
    
    # Consensus metrics
    agreement_percentage = models.FloatField(default=0.0)
    average_confidence = models.FloatField(default=0.0)
    
    # Resolution
    resolved_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, blank=True,
        related_name='resolved_consensuses'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['content_type', 'object_id']
        verbose_name_plural = 'review consensuses'
    
    def __str__(self) -> str:
        return f"Consensus for {self.content_type.model} {self.object_id} - {self.status}"


class ReviewFeedback(models.Model):
    """Feedback on reviews for quality improvement."""
    
    review = models.OneToOneField(Review, on_delete=models.CASCADE, related_name='feedback')
    feedback_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='review_feedback_given')
    
    # Feedback content
    is_helpful = models.BooleanField()
    accuracy_feedback = models.TextField(blank=True)
    suggestions = models.TextField(blank=True)
    
    # Ratings
    review_quality_rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self) -> str:
        helpful = "Helpful" if self.is_helpful else "Not Helpful"
        return f"Feedback on review {self.review.id} - {helpful}"