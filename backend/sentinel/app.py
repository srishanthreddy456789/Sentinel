from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from sentinel.api.routes import apis, auth, dashboard, heal, keys, models, monitor, predict
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
    description="SENTINEL — Autonomous ML Monitoring & Self-Healing Platform API",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

# Include API v1 Router Endpoints
api_v1_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_v1_prefix)
app.include_router(keys.router, prefix=api_v1_prefix)
app.include_router(apis.router, prefix=api_v1_prefix)
app.include_router(models.router, prefix=api_v1_prefix)
app.include_router(predict.router, prefix=api_v1_prefix)
app.include_router(monitor.router, prefix=api_v1_prefix)
app.include_router(heal.router, prefix=api_v1_prefix)
app.include_router(dashboard.router, prefix=api_v1_prefix)
