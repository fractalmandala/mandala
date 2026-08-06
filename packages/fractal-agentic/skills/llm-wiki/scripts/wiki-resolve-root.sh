#!/bin/sh
# Resolve FRACTAL_WIKI_ROOT / config / project marker. Print absolute path; exit 1 if none.
set -eu

fail() {
  printf '%s\n' "ERROR: $*" >&2
  exit 1
}

is_vault() {
  dir=$1
  [ -d "$dir" ] || return 1
  # Prefer explicit marker or wiki/ + raw/
  if [ -f "$dir/.fractal-wiki.json" ]; then
    return 0
  fi
  [ -d "$dir/wiki" ] && [ -d "$dir/raw" ]
}

emit() {
  abs=$(CDPATH= cd "$1" && pwd -P) || return 1
  printf '%s\n' "$abs"
  exit 0
}

# 1. Env
if [ -n "${FRACTAL_WIKI_ROOT-}" ]; then
  if is_vault "$FRACTAL_WIKI_ROOT" || [ -d "$FRACTAL_WIKI_ROOT" ]; then
    # Allow pre-init empty dir if env points there
    emit "$FRACTAL_WIKI_ROOT"
  fi
  fail "FRACTAL_WIKI_ROOT is set but not a usable directory: $FRACTAL_WIKI_ROOT"
fi

# 2. User config files
for cfg in \
  "${XDG_CONFIG_HOME:-}/fractal-agentic/wiki.json" \
  "$HOME/.config/fractal-agentic/wiki.json" \
  "$HOME/.fractal-agentic/wiki.json"
do
  [ -n "$cfg" ] && [ -f "$cfg" ] || continue
  if command -v python3 >/dev/null 2>&1; then
    root=$(python3 - "$cfg" <<'PY' 2>/dev/null || true
import json, sys
from pathlib import Path
p = Path(sys.argv[1])
data = json.loads(p.read_text(encoding="utf-8"))
print(data.get("wiki_root") or "")
PY
)
    if [ -n "$root" ] && { is_vault "$root" || [ -d "$root" ]; }; then
      emit "$root"
    fi
  fi
done

# 3. Walk up for project marker
dir=$(pwd -P)
while [ "$dir" != "/" ]; do
  if [ -f "$dir/.fractal-wiki" ]; then
    target=$(head -1 "$dir/.fractal-wiki" | tr -d '\r\n')
    case "$target" in
      /*) ;;
      ~/*) target=$HOME${target#\~} ;;
      *) target=$dir/$target ;;
    esac
    if is_vault "$target" || [ -d "$target" ]; then
      emit "$target"
    fi
  fi
  if is_vault "$dir"; then
    emit "$dir"
  fi
  parent=$(CDPATH= cd "$dir/.." && pwd -P) || break
  [ "$parent" = "$dir" ] && break
  dir=$parent
done

printf '%s\n' "ERROR: LLM wiki root not found (set FRACTAL_WIKI_ROOT or run /wiki-init)" >&2
exit 1
