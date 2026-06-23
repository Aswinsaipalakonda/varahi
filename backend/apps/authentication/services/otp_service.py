import random
from django.core.cache import cache

def send_otp(mobile_number):
    # Generate 6-digit OTP
    otp = f"{random.randint(100000, 999999)}"
    
    # Store OTP in cache with 5-minute (300 seconds) TTL
    cache_key = f"otp_{mobile_number}"
    cache.set(cache_key, otp, timeout=300)
    
    # Log to console for demo fallback
    print(f"\n======================================")
    print(f"DEMO OTP FOR {mobile_number}: {otp}")
    print(f"======================================\n")
    
    return otp

def verify_otp(mobile_number, otp):
    cache_key = f"otp_{mobile_number}"
    stored_otp = cache.get(cache_key)
    if stored_otp and stored_otp == str(otp):
        cache.delete(cache_key)
        return True
    return False
