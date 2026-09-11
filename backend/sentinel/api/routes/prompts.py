import hashlib
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.database.database import get_db
from sentinel.database.models import ConnectedApi, Developer, PromptVersion

router = APIRouter(prefix="/prompts", tags=["Prompt Versioning"])

class PromptVersionCreateSchema(BaseModel):
    connected_api_id: str
    content: str
    change_summary: Optional[str] = "Manual prompt version creation"

@router.get("/{connected_api_id}")
async def list_prompt_versions(
    connected_api_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PromptVersion)
        .where(PromptVersion.connected_api_id == connected_api_id)
        .order_by(PromptVersion.version.desc())
    )
    return result.scalars().all()

@router.post("/")
async def create_prompt_version(
    payload: PromptVersionCreateSchema,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(PromptVersion)
        .where(PromptVersion.connected_api_id == payload.connected_api_id)
        .order_by(PromptVersion.version.desc())
    )
    existing_versions = result.scalars().all()
    next_version = (existing_versions[0].version + 1) if existing_versions else 1

    content_hash = hashlib.sha256(payload.content.encode('utf-8')).hexdigest()

    prompt_ver = PromptVersion(
        connected_api_id=payload.connected_api_id,
        version=next_version,
        content=payload.content,
        content_hash=content_hash,
        score=0.88,
        status="active",
        change_summary=payload.change_summary,
    )
    db.add(prompt_ver)
    await db.commit()
    await db.refresh(prompt_ver)
    return prompt_ver

@router.get("/compare/{v1_id}/{v2_id}")
async def compare_prompt_versions(
    v1_id: str,
    v2_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    res1 = await db.execute(select(PromptVersion).where(PromptVersion.id == v1_id))
    p1 = res1.scalars().first()
    res2 = await db.execute(select(PromptVersion).where(PromptVersion.id == v2_id))
    p2 = res2.scalars().first()

    if not p1 or not p2:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="One or both prompt versions not found")

    return {
        "version_1": {
            "id": p1.id,
            "version": p1.version,
            "content": p1.content,
            "score": p1.score,
            "created_at": p1.created_at,
        },
        "version_2": {
            "id": p2.id,
            "version": p2.version,
            "content": p2.content,
            "score": p2.score,
            "created_at": p2.created_at,
        },
        "score_diff": round((p2.score or 0.0) - (p1.score or 0.0), 4),
    }
