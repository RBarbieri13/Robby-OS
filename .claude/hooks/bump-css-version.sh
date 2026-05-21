#!/bin/bash
# PostToolUse hook: bump `?v=N` in index.html whenever a CSS file is edited.
# Operating rule from skills-bootstrap.md: "After any CSS edit, bump ?v=N on
# the corresponding <link> in index.html. The browser will serve stale CSS
# otherwise."

set -e
input=$(cat)
file=$(printf '%s' "$input" | python3 -c 'import json,sys; d=json.load(sys.stdin); print(d.get("tool_input",{}).get("file_path",""))' 2>/dev/null || true)

case "$file" in
  *.css) ;;
  *) exit 0 ;;
esac

basename=$(basename "$file")
index="${CLAUDE_PROJECT_DIR:-$(pwd)}/index.html"
[ -f "$index" ] || exit 0

python3 - "$index" "$basename" <<'PYEOF'
import re, sys
index_path, css_basename = sys.argv[1], sys.argv[2]
with open(index_path) as f:
    html = f.read()
pattern = re.compile(r'(href="' + re.escape(css_basename) + r'\?v=)(\d+)')
def bump(m):
    return m.group(1) + str(int(m.group(2)) + 1)
new = pattern.sub(bump, html, count=1)
if new != html:
    with open(index_path, "w") as f:
        f.write(new)
    print(f"[bump-css-version] bumped ?v= for {css_basename}", file=sys.stderr)
PYEOF
exit 0
