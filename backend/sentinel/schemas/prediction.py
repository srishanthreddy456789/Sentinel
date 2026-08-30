from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel

class PredictionPayload(BaseModel):
    model_id: str
    input: Dict[str, Any]
    output: Dict[str, Any]
    actual: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None

class BatchPredictionPayload(BaseModel):
    predictions: List[PredictionPayload]

class LabelPayload(BaseModel):
    prediction_id: str
    actual: Dict[str, Any]

class PredictionOut(BaseModel):
    id: str
    model_id: str
    input: Dict[str, Any]
    output: Dict[str, Any]
    actual: Optional[Dict[str, Any]] = None
    confidence: Optional[float] = None
    timestamp: datetime

    class Config:
        from_attributes = True
