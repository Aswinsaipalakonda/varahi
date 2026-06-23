from django.db import models
from django.contrib.auth import get_user_model
import uuid

User = get_user_model()

class KycDocument(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='kyc_document')
    aadhaar_front = models.FileField(upload_to='kyc/aadhaar/', blank=True, null=True)
    aadhaar_back = models.FileField(upload_to='kyc/aadhaar/', blank=True, null=True)
    pan = models.FileField(upload_to='kyc/pan/', blank=True, null=True)
    selfie = models.FileField(upload_to='kyc/selfie/', blank=True, null=True)
    
    bank_account_number = models.CharField(max_length=50)
    ifsc_code = models.CharField(max_length=20)
    bank_name = models.CharField(max_length=100)
    
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_kycs')
    review_remarks = models.TextField(blank=True, null=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    reviewed_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return f"KYC for {self.user.mobile_number}"
