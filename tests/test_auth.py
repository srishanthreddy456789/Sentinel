import pytest
from sentinel.core.security import create_access_token, decode_access_token, get_password_hash, verify_password

def test_password_hashing():
    raw_pwd = "SecurePassword123!"
    hashed = get_password_hash(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False

def test_jwt_token_flow():
    user_id = "test-user-uuid-1234"
    token = create_access_token(subject=user_id)
    assert isinstance(token, str)

    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded["sub"] == user_id
