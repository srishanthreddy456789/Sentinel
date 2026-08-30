from datetime import datetime
from typing import Optional
from pydantic import BaseModel

class HealingTrigger(BaseModel):
    model_id: str
    force_fix_type: Optional[str] = None

class HealingLogOut(BaseModel):
    id: str
    drift_event_id: str
    fix_type: str
    fix_applied: str
    score_before: float
    score_after: float
    outcome: str
    time_to_heal_seconds: int
    healed_at: datetime

    class Config:
        from_attributes = True
