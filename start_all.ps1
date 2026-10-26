# ==============================================================================
# AarogyaVaani — Windows PowerShell Unified Service Launcher
# ==============================================================================

$PROJECT_ROOT = $PSScriptRoot

Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host "   AarogyaVaani — Starting All Services (Windows)" -ForegroundColor Cyan
Write-Host "===========================================================================" -ForegroundColor Cyan

# 1. FastAPI Backend (Port 8001)
Write-Host "▶ Starting FastAPI Backend (http://localhost:8001)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'AarogyaVaani Backend [8001]'; cd '$PROJECT_ROOT\server'; & '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

Start-Sleep -Seconds 2

# 2. LiveKit Voice Agent
Write-Host "▶ Starting LiveKit Voice Agent Worker..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'AarogyaVaani Voice Agent'; cd '$PROJECT_ROOT\ai_service'; & '.\.venv\Scripts\python.exe' agent.py dev"

Start-Sleep -Seconds 1

# 3. React Vite Frontend (Port 5173)
Write-Host "▶ Starting React/Vite Client (http://localhost:5173)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$Host.UI.RawUI.WindowTitle = 'AarogyaVaani Frontend [5173]'; cd '$PROJECT_ROOT\client'; npm run dev"

Write-Host ""
Write-Host "===========================================================================" -ForegroundColor Cyan
Write-Host "   ✓ All 3 AarogyaVaani services launched in separate windows!" -ForegroundColor Green
Write-Host "   • Frontend UI:    http://localhost:5173"
Write-Host "   • Backend API:    http://localhost:8001 (Docs: http://localhost:8001/docs)"
Write-Host "   • Voice Agent:    Connected & Listening to LiveKit Cloud"
Write-Host "===========================================================================" -ForegroundColor Cyan
