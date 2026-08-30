from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.core.security import generate_sdk_api_key
from sentinel.database.database import get_db
from sentinel.database.models import ApiKey, Developer
from sentinel.schemas.api_key import ApiKeyCreate, ApiKeyOut

router = APIRouter(prefix="/keys", tags=["API Keys"])

@router.get("/", response_model=List[ApiKeyOut])
async def list_keys(
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.developer_id == current_developer.id)
    )
    return result.scalars().all()

@router.post("/generate", response_model=ApiKeyOut, status_code=status.HTTP_201_CREATED)
async def generate_key(
    payload: ApiKeyCreate,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    raw_key, key_prefix, key_hash = generate_sdk_api_key()
    api_key_obj = ApiKey(
        developer_id=current_developer.id,
        name=payload.name,
        key_prefix=key_prefix,
        key_hash=key_hash,
    )
    db.add(api_key_obj)
    await db.commit()
    await db.refresh(api_key_obj)

    out = ApiKeyOut.model_validate(api_key_obj)
    out.raw_key = raw_key
    return out

@router.delete("/{key_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_key(
    key_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ApiKey).where(
            ApiKey.id == key_id,
            ApiKey.developer_id == current_developer.id
        )
    )
    key_obj = result.scalars().first()
    if not key_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="API Key not found")
    
    await db.delete(key_obj)
    await db.commit()
