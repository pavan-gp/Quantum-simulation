#!/usr/bin/env bash
# ==============================================================================
# SHIELD // Post-Quantum Military Communication Portal Runner
# ==============================================================================
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "======================================================================"
echo "🛡️  STARTING SHIELD POST-QUANTUM MILITARY COMMUNICATION PORTAL"
echo "======================================================================"

# Determine Python binary (prefer backend virtual environment)
if [ -f "$DIR/backend/venv/bin/python" ]; then
    PYTHON="$DIR/backend/venv/bin/python"
    UVICORN="$DIR/backend/venv/bin/uvicorn"
elif command -v python3 &>/dev/null; then
    PYTHON="python3"
    UVICORN="uvicorn"
else
    echo "❌ Error: Python 3 not found. Please install Python 3.11+."
    exit 1
fi

# Check Node & npm
if ! command -v npm &>/dev/null; then
    echo "❌ Error: npm / Node.js not found. Please install Node.js."
    exit 1
fi

echo "✓ Using Python: $("$PYTHON" --version)"
echo "✓ Using Node.js: $(node -v)"
echo "----------------------------------------------------------------------"

# Trap CTRL+C to cleanly kill background processes
cleanup() {
    echo ""
    echo "🛑 Shutting down SHIELD portal services..."
    kill $(jobs -p) 2>/dev/null || true
    echo "✓ All services stopped."
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI Backend Server
echo "🚀 [1/2] Launching FastAPI Backend on http://localhost:8000 ..."
cd "$DIR/backend"
PYTHONPATH="$DIR/backend" "$UVICORN" app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd "$DIR"

# Wait a moment for backend to initialize
sleep 2

# 2. Start React/Vite Frontend Portal
echo "🚀 [2/2] Launching React Web Portal on http://localhost:3000 ..."
cd "$DIR/frontend"
npm run dev -- --host 0.0.0.0 --port 3000 &
FRONTEND_PID=$!
cd "$DIR"

echo "======================================================================"
echo "✅ SHIELD SYSTEM IS LIVE & OPERATIONAL!"
echo "======================================================================"
echo "🌐 React Web Portal:         http://localhost:3000"
echo "📑 FastAPI Swagger Docs:     http://localhost:8000/docs"
echo "----------------------------------------------------------------------"
echo "🔑 PRE-SEEDED MILITARY CREDENTIALS (Auto-filled on Login screen):"
echo "  1. 🇺🇸 Node A Commander:     sender.countrya@mil.gov    | SecureA123!"
echo "  2. 🇬🇧 Node B General:       receiver.countryb@mil.gov  | SecureB123!"
echo "  3. 🛡️ SHIELD HQ Director:   admin.shield@mil.gov       | AdminShield2026!"
echo "======================================================================"
echo "Press CTRL+C at any time to stop both servers."

wait
