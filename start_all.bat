@echo off
title AarogyaVaani Launcher
echo ===========================================================================
echo    AarogyaVaani -- Starting All Services (Windows Batch)
echo ===========================================================================

echo Starting FastAPI Backend (Port 8001)...
start "AarogyaVaani Backend [8001]" cmd /k "cd /d "%~dp0server" && .venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 2 /nobreak >nul

echo Starting LiveKit Voice Agent Worker...
start "AarogyaVaani Voice Agent" cmd /k "cd /d "%~dp0ai_service" && .venv\Scripts\python.exe agent.py dev"

timeout /t 1 /nobreak >nul

echo Starting React/Vite Client (Port 5173)...
start "AarogyaVaani Frontend [5173]" cmd /k "cd /d "%~dp0client" && npm run dev"

echo.
echo ===========================================================================
echo    All 3 AarogyaVaani services launched in separate windows!
echo    - Frontend UI: http://localhost:5173
echo    - Backend API: http://localhost:8001 (Docs: http://localhost:8001/docs)
echo    - Voice Agent: Connected and Listening to LiveKit Cloud
echo ===========================================================================
