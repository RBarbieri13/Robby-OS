#!/bin/bash
# PostToolUse hook: warn (don't block) when a CSS edit introduces 1px borders.
# Operating rule: "2px borders and layered shadows are the house style. Not 1px."

input=$(cat)
file=$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("file_path",""))' 2>/dev/null || true)

case "$file" in
  *styles-*.css|*theme-*.css) ;;
  *) exit 0 ;;
esac

[ -f "$file" ] || exit 0

# Look for 1px solid/dashed/dotted border rules. Ignore border-radius and
# rules where 1px is part of a shadow.
hits=$(grep -nE 'border(-top|-bottom|-left|-right)?:\s*1px\s+(solid|dashed|dotted)' "$file" 2>/dev/null | head -10 || true)

if [ -n "$hits" ]; then
  printf '\n[check-border-2px] %d 1px border(s) found in %s — house style is 2px:\n' "$(printf '%s\n' "$hits" | wc -l | tr -d ' ')" "$file" >&2
  printf '%s\n' "$hits" >&2
fi
exit 0
