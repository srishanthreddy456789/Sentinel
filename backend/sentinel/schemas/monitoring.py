from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel

class HealthStatusOut(BaseModel):
    model_id: str
    status: str
    baseline_accuracy: float
    current_accuracy: float
    total_predictions: int
    drift_detected: bool

class DriftAnalysisOut(BaseModel):
    id: str
    model_id: str
    drift_type: str
    severity: str
    diagnosed_cause: str
    ks_score: Optional[float] = None
    psi_score: Optional[float] = None
    kl_score: Optional[float] = None
    detected_at: datetime

    class Config:
        from_attributes = True

class FeatureDriftOut(BaseModel):
    feature_name: str
    ks_statistic: float
    p_value: float
    psi_score: float
    drift_flag: bool
    top_shap_importance: float
