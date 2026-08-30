import base64
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Tuple

from cryptography.fernet import Fernet
from jose import JWTError, jwt
from passlib.context import CryptContext

from sentinel.core.config import settings

# Password Hashing
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# JWT Authentication
def create_access_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

# Fernet Symmetric Encryption for External Provider API Keys
def _get_fernet_key() -> bytes:
    # Ensure valid 32-byte urlsafe base64 key
    raw_key = settings.FERNET_SECRET_KEY.encode("utf-8")
    return base64.urlsafe_b64encode(hashlib.sha256(raw_key).digest())

def encrypt_provider_key(plain_api_key: str) -> str:
    if not plain_api_key:
        return ""
    f = Fernet(_get_fernet_key())
    return f.encrypt(plain_api_key.encode("utf-8")).decode("utf-8")

def decrypt_provider_key(encrypted_api_key: str) -> str:
    if not encrypted_api_key:
        return ""
    try:
        f = Fernet(_get_fernet_key())
        return f.decrypt(encrypted_api_key.encode("utf-8")).decode("utf-8")
    except Exception:
        return ""

# SDK Developer API Key Management
def generate_sdk_api_key() -> Tuple[str, str, str]:
    """
    Generates a developer SDK key.
    Returns: (raw_key, key_prefix, key_hash)
    Example raw_key: sk_sentinel_8f9a2b4c1d3e5f7a...
    """
    random_bytes = secrets.token_hex(24)
    raw_key = f"sk_sentinel_{random_bytes}"
    prefix = raw_key[:16]
    key_hash = hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
    return raw_key, prefix, key_hash

def hash_sdk_api_key(raw_key: str) -> str:
    return hashlib.sha256(raw_key.encode("utf-8")).hexdigest()
