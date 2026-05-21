#!/bin/bash
# SessionStart hook: if the dev server is running on localhost:8765, capture
# a fresh cockpit baseline screenshot so this session has a visual anchor.
# Silent skip if server is not up — we never block session start.

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0

# Probe the server. 2s max timeout so we never delay session start.
code=$(curl -s --max-time 2 -o /dev/null -w '%{http_code}' http://localhost:8765 2>/dev/null || echo "000")
if [ "$code" != "200" ]; then
  exit 0
fi

mkdir -p "Claude Design/screenshots"
out="Claude Design/screenshots/session-baseline.png"

CHROME_BIN=""
if command -v google-chrome >/dev/null 2>&1; then
  CHROME_BIN="google-chrome"
elif [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
  CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [ -x "/Applications/Chromium.app/Contents/MacOS/Chromium" ]; then
  CHROME_BIN="/Applications/Chromium.app/Contents/MacOS/Chromium"
fi

[ -z "$CHROME_BIN" ] && exit 0

"$CHROME_BIN" --headless --disable-gpu --no-sandbox \
  --screenshot="$out" \
  --window-size=1440,900 \
  http://localhost:8765 >/dev/null 2>&1 || exit 0

if [ -f "$out" ]; then
  printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"Cockpit baseline screenshot captured at Claude Design/screenshots/session-baseline.png — read it with the Read tool if you need a visual reference for current state."}}\n'
fi
exit 0
