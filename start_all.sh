#!/usr/bin/env bash
# ==============================================================================
# AarogyaVaani — Resilient Unified Service Launcher
# Launches FastAPI Backend, LiveKit Voice Agent, and React Client concurrently.
# ==============================================================================

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==========================================================================="
echo "   AarogyaVaani — Starting All Services"
echo "==========================================================================="

# Clean up stale processes on ports 8001 and 5173 if any exist
cleanup_stale() {
    echo "▶ Checking for stale processes on ports 8001 and 5173..."
    fuser -k 8001/tcp 2>/dev/null || true
    fuser -k 5173/tcp 2>/dev/null || true
    pkill -f "python agent.py dev" 2>/dev/null || true
    sleep 1
}

cleanup_stale

SERVER_PID=""
AGENT_PID=""
CLIENT_PID=""

cleanup() {
    echo ""
    echo "==========================================================================="
    echo "   Shutting down all AarogyaVaani services..."
    echo "==========================================================================="
    [ -n "$SERVER_PID" ] && kill -TERM "$SERVER_PID" 2>/dev/null || true
    [ -n "$AGENT_PID" ] && kill -TERM "$AGENT_PID" 2>/dev/null || true
    [ -n "$CLIENT_PID" ] && kill -TERM "$CLIENT_PID" 2>/dev/null || true
    kill $(jobs -p) 2>/dev/null || true
    wait 2>/dev/null || true
    echo "   ✓ All services stopped cleanly."
    exit 0
}
# Trap user interrupts only (Ctrl+C or kill signals), NOT benign script exit
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

# Verify server is listening
for i in {1..10}; do
    if curl -s http://localhost:8001/health >/dev/null 2>&1; then
        echo "   ✓ FastAPI Backend is healthy on port 8001"
        break
    fi
    sleep 0.5
done

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

sleep 1

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

# Keep script running and wait for signals
wait
