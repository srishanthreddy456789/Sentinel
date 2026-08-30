from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import verify_sdk_key
from sentinel.database.database import get_db
from sentinel.database.models import ApiKey, Prediction
from sentinel.schemas.prediction import BatchPredictionPayload, LabelPayload, PredictionOut, PredictionPayload

router = APIRouter(prefix="/predict", tags=["Predictions (SDK)"])

@router.post("", response_model=PredictionOut, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PredictionOut, status_code=status.HTTP_201_CREATED)
async def capture_prediction(
    payload: PredictionPayload,
    api_key: ApiKey = Depends(verify_sdk_key),
    db: AsyncSession = Depends(get_db)
):
    pred = Prediction(
        model_id=payload.model_id,
        input=payload.input,
        output=payload.output,
        actual=payload.actual,
        confidence=payload.confidence
    )
    db.add(pred)
    await db.commit()
    await db.refresh(pred)
    return pred

@router.post("/batch", status_code=status.HTTP_201_CREATED)
async def capture_batch_predictions(
    payload: BatchPredictionPayload,
    api_key: ApiKey = Depends(verify_sdk_key),
    db: AsyncSession = Depends(get_db)
):
    preds = [
        Prediction(
            model_id=item.model_id,
            input=item.input,
            output=item.output,
            actual=item.actual,
            confidence=item.confidence
        )
        for item in payload.predictions
    ]
    db.add_all(preds)
    await db.commit()
    return {"status": "success", "count": len(preds)}

@router.post("/label", status_code=status.HTTP_200_OK)
async def update_prediction_label(
    payload: LabelPayload,
    api_key: ApiKey = Depends(verify_sdk_key),
    db: AsyncSession = Depends(get_db)
):
    pred = await db.get(Prediction, payload.prediction_id)
    if pred:
        pred.actual = payload.actual
        await db.commit()
    return {"status": "updated", "prediction_id": payload.prediction_id}
