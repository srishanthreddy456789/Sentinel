from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.database.database import get_db
from sentinel.database.models import Developer, DriftEvent, HealingLog, Model
from sentinel.schemas.healing import HealingLogOut, HealingTrigger
from sentinel.services.healing_service import AutonomousHealingEngine

router = APIRouter(prefix="/heal", tags=["Autonomous Healing"])

@router.get("/{model_id}/history", response_model=List[HealingLogOut])
async def get_healing_history(
    model_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(HealingLog)
        .join(DriftEvent)
        .where(DriftEvent.model_id == model_id)
        .order_by(HealingLog.healed_at.desc())
    )
    return result.scalars().all()

@router.post("/{model_id}/trigger", response_model=HealingLogOut, status_code=status.HTTP_201_CREATED)
async def trigger_autonomous_healing(
    model_id: str,
    payload: HealingTrigger,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    model = await db.get(Model, model_id)
    if not model or model.developer_id != current_developer.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    # Fetch latest drift event or create a trigger event
    result = await db.execute(
        select(DriftEvent)
        .where(DriftEvent.model_id == model_id)
        .order_by(DriftEvent.detected_at.desc())
    )
    drift_event = result.scalars().first()

    if not drift_event:
        drift_event = DriftEvent(
            model_id=model.id,
            drift_type=payload.force_fix_type or "Data Drift",
            severity="High",
            diagnosed_cause="Manual or Scheduled Autonomous Remediation Trigger",
            ks_score=0.35,
            psi_score=0.22,
            kl_score=0.18
        )
        db.add(drift_event)
        await db.flush()

    fix_type, fix_applied, score_before, score_after, time_to_heal = AutonomousHealingEngine.heal_model(
        drift_type=drift_event.drift_type,
        diagnosed_cause=drift_event.diagnosed_cause,
        baseline_accuracy=model.baseline_accuracy,
        current_accuracy=model.current_accuracy
    )

    # Update model state to Healthy & Healed
    model.status = "Healthy"
    model.current_accuracy = score_after

    healing_log = HealingLog(
        drift_event_id=drift_event.id,
        fix_type=fix_type,
        fix_applied=fix_applied,
        score_before=score_before,
        score_after=score_after,
        outcome="Success",
        time_to_heal_seconds=time_to_heal
    )
    db.add(healing_log)
    await db.commit()
    await db.refresh(healing_log)
    return healing_log
