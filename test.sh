#!/usr/bin/env bash
# ==============================================================================
# SHIELD // Cryptographic Suite & Build Parity Validator
# ==============================================================================
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "======================================================================"
echo "🛡️  RUNNING SHIELD FULL SYSTEM VALIDATION SUITE"
echo "======================================================================"

# Determine Python
if [ -f "$DIR/backend/venv/bin/python" ]; then
    PYTHON="$DIR/backend/venv/bin/python"
else
    PYTHON="python3"
fi

echo ">> Step 1/2: Running Cryptographic & Threat Detector Parity Tests..."
cd "$DIR/backend"
PYTHONPATH="$DIR/backend" "$PYTHON" test_crypto.py
cd "$DIR"

echo ""
echo ">> Step 2/2: Validating React Frontend Production Bundle..."
cd "$DIR/frontend"
npm run build
cd "$DIR"

echo ""
echo "======================================================================"
echo "✅ ALL VALIDATION CHECKS PASSED WITH 0 ERRORS!"
echo "======================================================================"
