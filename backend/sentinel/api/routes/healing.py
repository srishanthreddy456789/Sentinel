from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.database.database import get_db
from sentinel.database.models import ConnectedApi, Developer, HealingEvent
from ai.healing.prompt_healer import prompt_healer
from ai.healing.verifier import healing_verifier

router = APIRouter(prefix="/healing", tags=["Self-Healing Engine"])

class ManualHealingTriggerSchema(BaseModel):
    connected_api_id: str
    original_prompt: str
    failing_input: str
    failing_output: str
    expected_output: Optional[str] = None
    reason: Optional[str] = "Manual trigger for self-healing verification"

@router.get("/{connected_api_id}")
async def list_healing_events(
    connected_api_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(HealingEvent)
        .where(HealingEvent.connected_api_id == connected_api_id)
        .order_by(HealingEvent.healed_at.desc())
    )
    return result.scalars().all()

@router.post("/trigger")
async def trigger_healing(
    payload: ManualHealingTriggerSchema,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(ConnectedApi).where(
            ConnectedApi.id == payload.connected_api_id,
            ConnectedApi.developer_id == current_developer.id
        )
    )
    api_obj = result.scalars().first()
    if not api_obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Connected API connection not found")

    # Generate candidate artifact
    candidate_prompt = await prompt_healer.generate_healed_prompt(
        original_prompt=payload.original_prompt,
        failing_input=payload.failing_input,
        failing_output=payload.failing_output,
        expected_output=payload.expected_output,
        diagnosis_reason=payload.reason or "Manual optimization request",
    )

    # Verify Candidate against baseline test suite (Score A vs Score B)
    verification = healing_verifier.verify_healing_candidate(
        original_artifact=payload.original_prompt,
        candidate_artifact=candidate_prompt,
        test_cases=[{
            "input_text": payload.failing_input,
            "expected_output": payload.expected_output,
        }]
    )

    healing_event = HealingEvent(
        connected_api_id=api_obj.id,
        healing_type="PROMPT_HEALING",
        original_artifact=payload.original_prompt,
        candidate_artifact=candidate_prompt,
        score_before=verification.score_before,
        score_after=verification.score_after,
        improvement=verification.improvement,
        decision=verification.decision,
        reasoning=verification.reasoning,
    )
    db.add(healing_event)
    await db.commit()
    await db.refresh(healing_event)

    return healing_event
