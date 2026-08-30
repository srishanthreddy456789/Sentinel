from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.core.security import encrypt_provider_key
from sentinel.database.database import get_db
from sentinel.database.models import ConnectedApi, Developer, Model
from sentinel.schemas.connected_api import ConnectedApiCreate, ConnectedApiOut

router = APIRouter(prefix="/apis", tags=["Connected APIs"])

@router.get("/", response_model=List[ConnectedApiOut])
async def list_apis(
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ConnectedApi).where(ConnectedApi.developer_id == current_developer.id)
    )
    return result.scalars().all()

@router.post("/add", response_model=ConnectedApiOut, status_code=status.HTTP_201_CREATED)
async def add_api(
    payload: ConnectedApiCreate,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    encrypted_key = encrypt_provider_key(payload.api_key) if payload.api_key else None
    
    connected_api = ConnectedApi(
        developer_id=current_developer.id,
        name=payload.name,
        provider=payload.provider,
        encrypted_api_key=encrypted_key,
        task_type=payload.task_type or "llm_chat",
        status="Healthy"
    )
    db.add(connected_api)
    await db.flush()

    # Automatically initialize default model for this API
    model_obj = Model(
        connected_api_id=connected_api.id,
        developer_id=current_developer.id,
        name=payload.name,
        task=payload.task_type or "general",
        model_type="custom" if payload.provider != "sentinel_free" else "default",
        status="Healthy",
        baseline_accuracy=98.5,
        current_accuracy=98.5,
    )
    db.add(model_obj)
    await db.commit()
    await db.refresh(connected_api)
    return connected_api

@router.delete("/{api_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_api(
    api_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ConnectedApi).where(
            ConnectedApi.id == api_id,
            ConnectedApi.developer_id == current_developer.id
        )
    )
    api_obj = result.scalars().first()
    if not api_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connected API not found")
    
    await db.delete(api_obj)
    await db.commit()
