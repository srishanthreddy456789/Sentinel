import httpx
import logging
from typing import Any, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from sentinel.core.config import settings
from sentinel.database.database import get_db
from sentinel.workers.job_manager import job_manager
from sentinel.services.alert_service import alert_service

router = APIRouter(prefix="/health", tags=["Infrastructure Health & Observability"])

@router.get("")
async def general_health():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }

@router.get("/database")
async def health_database(db: AsyncSession = Depends(get_db)):
    try:
        res = await db.execute(text("SELECT 1"))
        return {"component": "PostgreSQL/Database", "status": "Healthy", "details": "DB connection ping successful"}
    except Exception as e:
        return {"component": "PostgreSQL/Database", "status": "Unavailable", "error": str(e)}

@router.get("/redis")
async def health_redis():
    r = await job_manager.get_redis()
    if r:
        return {"component": "Redis", "status": "Healthy", "details": "Redis connection active"}
    return {"component": "Redis", "status": "Unavailable", "details": "Operating on in-memory fallback queue"}

@router.get("/ollama")
async def health_ollama():
    ollama_url = getattr(settings, "OLLAMA_BASE_URL", "http://localhost:11434")
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{ollama_url}/api/tags")
            if resp.status_code == 200:
                models = [m.get("name") for m in resp.json().get("models", [])]
                return {"component": "Ollama", "status": "Healthy", "models_available": models}
    except Exception as e:
        pass
    return {"component": "Ollama", "status": "Unavailable", "details": f"Local Ollama daemon unreachable at {ollama_url}"}

@router.get("/mlflow")
async def health_mlflow():
    mlflow_url = getattr(settings, "MLFLOW_TRACKING_URI", "http://localhost:5000")
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(f"{mlflow_url}/health")
            if resp.status_code in [200, 302, 404]:
                return {"component": "MLflow", "status": "Healthy", "url": mlflow_url}
    except Exception as e:
        pass
    return {"component": "MLflow", "status": "Unavailable", "details": f"MLflow tracking server unreachable at {mlflow_url}"}

@router.get("/all")
async def health_all(db: AsyncSession = Depends(get_db)):
    db_res = await health_database(db)
    redis_res = await health_redis()
    ollama_res = await health_ollama()
    mlflow_res = await health_mlflow()

    overall_status = "Healthy"
    if db_res["status"] == "Unavailable":
        overall_status = "Degraded"

    return {
        "status": overall_status,
        "components": {
            "database": db_res,
            "redis": redis_res,
            "ollama": ollama_res,
            "mlflow": mlflow_res,
            "backend": {"component": "FastAPI Backend", "status": "Healthy"},
        }
    }

# Alert management routes
alerts_router = APIRouter(prefix="/alerts", tags=["Alerts"])

@alerts_router.get("")
async def get_alerts():
    return alert_service.get_alert_history()

@alerts_router.post("/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    success = alert_service.acknowledge_alert(alert_id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert ID not found")
    return {"status": "success", "alert_id": alert_id, "acknowledged": True}
