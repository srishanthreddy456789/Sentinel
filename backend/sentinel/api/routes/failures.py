from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.database.database import get_db
from sentinel.database.models import ConnectedApi, Developer, Diagnosis, Failure

router = APIRouter(prefix="/failures", tags=["Failures & Diagnosis"])

@router.get("/{connected_api_id}")
async def list_failures(
    connected_api_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Failure)
        .options(selectinload(Failure.diagnosis))
        .where(Failure.connected_api_id == connected_api_id)
        .order_by(Failure.created_at.desc())
    )
    failures = result.scalars().all()
    
    out = []
    for f in failures:
        diag_dict = None
        if f.diagnosis:
            diag_dict = {
                "id": f.diagnosis.id,
                "diagnosis_type": f.diagnosis.diagnosis_type,
                "confidence": f.diagnosis.confidence,
                "reason": f.diagnosis.reason,
                "evidence": f.diagnosis.evidence,
            }
        out.append({
            "id": f.id,
            "connected_api_id": f.connected_api_id,
            "failure_type": f.failure_type,
            "severity": f.severity,
            "input_text": f.input_text,
            "output_text": f.output_text,
            "expected_output": f.expected_output,
            "created_at": f.created_at,
            "diagnosis": diag_dict,
        })
    return out

@router.get("/details/{failure_id}")
async def get_failure_details(
    failure_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Failure)
        .options(selectinload(Failure.diagnosis))
        .where(Failure.id == failure_id)
    )
    failure = result.scalars().first()
    if not failure:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Failure record not found")

    return {
        "id": failure.id,
        "failure_type": failure.failure_type,
        "severity": failure.severity,
        "input_text": failure.input_text,
        "output_text": failure.output_text,
        "expected_output": failure.expected_output,
        "created_at": failure.created_at,
        "diagnosis": {
            "diagnosis_type": failure.diagnosis.diagnosis_type,
            "confidence": failure.diagnosis.confidence,
            "reason": failure.diagnosis.reason,
            "evidence": failure.diagnosis.evidence,
        } if failure.diagnosis else None,
    }
