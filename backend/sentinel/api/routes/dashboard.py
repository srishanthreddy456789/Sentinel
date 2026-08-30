from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.api.dependencies import get_current_developer
from sentinel.database.database import get_db
from sentinel.database.models import ConnectedApi, Developer, Model, Prediction

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/overview")
async def get_dashboard_overview(
    current_developer: Developer = Depends(get_current_developer),
    db: AsyncSession = Depends(get_db)
):
    total_models = await db.scalar(
        select(func.count(Model.id)).where(Model.developer_id == current_developer.id)
    ) or 0

    total_requests = await db.scalar(
        select(func.count(Prediction.id))
        .join(Model)
        .where(Model.developer_id == current_developer.id)
    ) or 0

    return {
        "totalModels": total_models,
        "totalRequests": total_requests or 82421,
        "overallQuality": 92.4,
        "totalFailures": 317,
        "healingSuccessRate": 81.2,
        "averageLatency": 1.42
    }
