import sys
from pathlib import Path

# Add project root directory to sys.path so 'sentinel' package is discoverable
_project_root = Path(__file__).resolve().parent.parent.parent
if str(_project_root) not in sys.path:
    sys.path.insert(0, str(_project_root))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sentinel.api.routes import (
    apis,
    auth,
    benchmarks,
    dashboard,
    embeddings,
    evaluations,
    failures,
    heal,
    healing,
    keys,
    models,
    monitor,
    predict,
    prompts,
    requests,
    research,
)
from sentinel.core.config import settings
from sentinel.database.database import Base, engine

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create tables on startup if not present
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SENTINEL — Autonomous LLMOps & Self-Healing Platform API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow local developer frontend connections
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": f"Internal Server Error: {str(exc)}"}
    )

# Health Check Routes
@app.get("/", tags=["Health"])
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }

from sentinel.api.routes import health

# Include API v1 Router Endpoints
api_v1_prefix = settings.API_V1_STR
app.include_router(health.router, prefix=api_v1_prefix)
app.include_router(health.alerts_router, prefix=api_v1_prefix)
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(keys.router, prefix=api_v1_prefix)
app.include_router(apis.router, prefix=api_v1_prefix)
app.include_router(models.router, prefix=api_v1_prefix)
app.include_router(requests.router, prefix=api_v1_prefix)
app.include_router(evaluations.router, prefix=api_v1_prefix)
app.include_router(failures.router, prefix=api_v1_prefix)
app.include_router(healing.router, prefix=api_v1_prefix)
app.include_router(prompts.router, prefix=api_v1_prefix)
app.include_router(predict.router, prefix=api_v1_prefix)
app.include_router(monitor.router, prefix=api_v1_prefix)
app.include_router(heal.router, prefix=api_v1_prefix)
app.include_router(dashboard.router, prefix=api_v1_prefix)
app.include_router(embeddings.router, prefix=api_v1_prefix)
app.include_router(benchmarks.router, prefix=api_v1_prefix)
app.include_router(research.router, prefix=api_v1_prefix)
