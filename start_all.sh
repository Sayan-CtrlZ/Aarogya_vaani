#!/usr/bin/env bash
# ==============================================================================
# AarogyaVaani — Unified Service Launcher
# Launches FastAPI Backend, LiveKit Voice Agent, and React Client concurrently.
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==========================================================================="
echo "   AarogyaVaani — Starting All Services"
echo "==========================================================================="

cleanup() {
    echo ""
    echo "Shutting down all AarogyaVaani services..."
    kill $(jobs -p) 2>/dev/null || true
    wait 2>/dev/null || true
    echo "All services stopped."
}
trap cleanup SIGINT SIGTERM

# 1. Start FastAPI Backend (Port 8001)
echo "▶ Starting FastAPI Backend (http://localhost:8001)..."
cd "$PROJECT_ROOT/server"
if [ -d ".venv/Scripts" ]; then
    .venv/Scripts/python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload &
elif [ -d ".venv/bin" ]; then
    .venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload &
else
    uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload &
fi
SERVER_PID=$!

# Wait 2 seconds for server to bind
sleep 2

# 2. Start LiveKit Voice Agent
echo "▶ Starting LiveKit Voice Agent (Worker listening to LiveKit Cloud)..."
cd "$PROJECT_ROOT/ai_service"
if command -v uv >/dev/null 2>&1; then
    uv run python agent.py dev &
elif [ -d ".venv/Scripts" ]; then
    .venv/Scripts/python.exe agent.py dev &
elif [ -d ".venv/bin" ]; then
    .venv/bin/python agent.py dev &
else
    python agent.py dev &
fi
AGENT_PID=$!

# 3. Start React Frontend (Port 5173)
echo "▶ Starting React/Vite Client (http://localhost:5173)..."
cd "$PROJECT_ROOT/client"
npm run dev &
CLIENT_PID=$!

echo ""
echo "==========================================================================="
echo "   ✓ All 3 AarogyaVaani services are running!"
echo "   • Frontend UI:    http://localhost:5173"
echo "   • Backend API:    http://localhost:8001 (Docs: http://localhost:8001/docs)"
echo "   • Voice Agent:    Connected & Listening to LiveKit Cloud"
echo "   Press Ctrl+C to stop all services simultaneously."
echo "==========================================================================="

# Keep script running and wait for background jobs
wait
