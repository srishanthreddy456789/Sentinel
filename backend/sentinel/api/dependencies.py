from typing import Optional
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.core.exceptions import InvalidCredentialsException, InvalidTokenException
from sentinel.core.security import decode_access_token, hash_sdk_api_key
from sentinel.database.database import get_db
from sentinel.database.models import ApiKey, Developer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_developer(
    token: Optional[str] = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> Developer:
    if not token:
        raise InvalidTokenException()

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise InvalidTokenException()

    developer_id = payload["sub"]
    result = await db.execute(select(Developer).where(Developer.id == developer_id))
    developer = result.scalars().first()

    if not developer:
        raise InvalidCredentialsException()

    return developer

async def verify_sdk_key(
    authorization: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db),
) -> ApiKey:
    """
    Validates developer SDK API key sent in header: Authorization: Bearer sk_sentinel_...
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header (expected 'Bearer sk_sentinel_...')"
        )

    raw_key = authorization.replace("Bearer ", "").strip()
    if not raw_key.startswith("sk_sentinel_"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid SDK API Key format. Must start with 'sk_sentinel_'"
        )

    key_hash = hash_sdk_api_key(raw_key)
    result = await db.execute(select(ApiKey).where(ApiKey.key_hash == key_hash))
    api_key_obj = result.scalars().first()

    if not api_key_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or revoked SDK API Key"
        )

    return api_key_obj
