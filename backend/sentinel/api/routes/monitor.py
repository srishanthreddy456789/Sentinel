from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.database.database import get_db
from sentinel.database.models import Developer, DriftEvent, Model, Prediction
from sentinel.schemas.monitoring import DriftAnalysisOut, FeatureDriftOut, HealthStatusOut
from sentinel.services.drift_service import DriftDetectionEngine

router = APIRouter(prefix="/monitor", tags=["Monitoring & Drift"])

@router.get("/{model_id}/health", response_model=HealthStatusOut)
async def get_health(
    model_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    model = await db.get(Model, model_id)
    if not model or model.developer_id != current_developer.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Model not found")

    pred_count = await db.scalar(
        select(func.count(Prediction.id)).where(Prediction.model_id == model_id)
    ) or 0

    return HealthStatusOut(
        model_id=model.id,
        status=model.status,
        baseline_accuracy=model.baseline_accuracy,
        current_accuracy=model.current_accuracy,
        total_predictions=pred_count,
        drift_detected=(model.status in ["Degraded", "Healing", "Critical"])
    )

@router.get("/{model_id}/drift", response_model=List[DriftAnalysisOut])
async def get_drift_events(
    model_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(DriftEvent)
        .where(DriftEvent.model_id == model_id)
        .order_by(DriftEvent.detected_at.desc())
    )
    return result.scalars().all()

@router.get("/{model_id}/features", response_model=List[FeatureDriftOut])
async def get_feature_drift(
    model_id: str,
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    # Simulated feature distribution analysis over predictions
    features = [
        FeatureDriftOut(
            feature_name="transaction_amount",
            ks_statistic=0.342,
            p_value=0.001,
            psi_score=0.245,
            drift_flag=True,
            top_shap_importance=0.48
        ),
        FeatureDriftOut(
            feature_name="user_account_age",
            ks_statistic=0.112,
            p_value=0.245,
            psi_score=0.042,
            drift_flag=False,
            top_shap_importance=0.18
        ),
        FeatureDriftOut(
            feature_name="login_ip_country_risk",
            ks_statistic=0.289,
            p_value=0.012,
            psi_score=0.185,
            drift_flag=False,
            top_shap_importance=0.34
        ),
    ]
    return features
