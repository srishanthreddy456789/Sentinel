# SENTINEL Deployment Guide

## Local Electron Desktop Startup
Run start batch file:
```cmd
start_sentinel.bat
```

## Docker Compose Deployment
```bash
docker-compose up -d
```
Services:
- `postgres` (Port 5432)
- `redis` (Port 6379)
- `mlflow` (Port 5000)
- `backend` (Port 8000)
- `worker` (Background Job Worker)
