#!/usr/bin/env bash
# Tiny static dev server for the Cockpit prototype.
# Usage: ./serve.sh [port]
set -euo pipefail
PORT="${1:-8765}"
cd "$(dirname "$0")"
echo "Robby OS Cockpit → http://localhost:${PORT}"
python3 -m http.server "${PORT}"
