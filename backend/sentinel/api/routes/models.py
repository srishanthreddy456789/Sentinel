from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.database.database import get_db
from sentinel.database.models import Developer, Model

router = APIRouter(prefix="/models", tags=["Models"])

@router.get("/")
async def list_models(
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Model).where(Model.developer_id == current_developer.id)
    )
    return result.scalars().all()

@router.get("/{model_id}")
async def get_model(
    model_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Model).where(
            Model.id == model_id,
            Model.developer_id == current_developer.id
        )
    )
    model = result.scalars().first()
    if not model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")
    return model
