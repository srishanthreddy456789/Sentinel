import sys
from pathlib import Path

# Add backend and root to path
sys.path.insert(0, str(Path(__file__).parent.parent))
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from sentinel.core.security import (
    encrypt_provider_key,
    decrypt_provider_key,
    generate_sdk_api_key,
    hash_sdk_api_key,
    redact_secrets,
    mask_api_key,
    create_access_token,
    decode_access_token,
)

def test_security_hardening():
    print("Testing Phase 11 Security Hardening, Secret Management & Redaction...")

    # 1. Fernet Encryption / Decryption Test
    raw_secret = "sk-proj-super-secret-openai-api-key-12345678"
    enc = encrypt_provider_key(raw_secret)
    print(f"  [OK] Encrypted Provider Key: {enc[:20]}...")
    assert enc != raw_secret
    
    dec = decrypt_provider_key(enc)
    print(f"  [OK] Decrypted Provider Key matches original: {dec == raw_secret}")
    assert dec == raw_secret

    # 2. SDK API Key Generation
    raw_key, prefix, key_hash = generate_sdk_api_key()
    print(f"  [OK] Generated SDK Key Prefix: {prefix}")
    assert raw_key.startswith("sk_sentinel_")
    assert hash_sdk_api_key(raw_key) == key_hash

    # 3. Secret Redaction Test
    log_dict = {
        "user_email": "developer@sentinel.ai",
        "api_key": raw_key,
        "password": "super_secret_password_123",
        "metadata": {
            "token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.123456789",
            "nested_log": f"Sending request with header authorization: sk_sentinel_abcdef1234567890"
        }
    }
    redacted = redact_secrets(log_dict)
    print(f"  [OK] Redacted API Key: {redacted['api_key']}")
    print(f"  [OK] Redacted Password: {redacted['password']}")
    assert raw_key not in str(redacted)
    assert "super_secret_password_123" not in str(redacted)

    # 4. JWT Token Authentication
    jwt_token = create_access_token("dev-user-123")
    payload = decode_access_token(jwt_token)
    print(f"  [OK] JWT Subject Decoded: {payload['sub']}")
    assert payload["sub"] == "dev-user-123"

    print("Phase 11 Security Test PASSED!")

if __name__ == "__main__":
    test_security_hardening()
