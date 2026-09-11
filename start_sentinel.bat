@echo off
title SENTINEL — LLMOps & Self-Healing Platform v2.0.0
echo ===================================================
echo   Starting SENTINEL Platform Services (v2.0.0)...
echo ===================================================
echo.

:: 1. Launch FastAPI Backend Server in background
echo [1/2] Launching Python FastAPI Backend Engine on http://127.0.0.1:8000...
start /b python -m uvicorn sentinel.app:app --host 127.0.0.1 --port 8000 --app-dir backend

:: Wait 2 seconds for backend initialization
timeout /t 2 /nobreak >nul

:: 2. Launch SENTINEL Desktop App
echo [2/2] Opening SENTINEL Desktop App...
if exist "frontend\release\win-unpacked\sentinel-desktop.exe" (
    start "" "frontend\release\win-unpacked\sentinel-desktop.exe"
) else (
    echo [Info] Desktop executable not found. Launching web frontend at http://localhost:3000...
    start http://localhost:3000
)

echo.
echo SENTINEL is running successfully!
