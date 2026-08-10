#!/bin/sh
# Resolve Fractal Agentic *plugin* root from env, cwd, or walk-up. Non-mutating.
# Exit 0 and print absolute path when accessible; exit 1 otherwise.
#
# The installable unit is the `packages/fractal-agentic/` directory (contains plugin.json, the
# AGENTS.md startup router, docs/bosses/<boss>/INDEX.md playbooks, skills/,
# commands/, agents/, and scripts/). The monorepo may also contain the explorer site.
#
# Usage:
#   resolve-plugin-root.sh              # env → walk-up → (then) script install location
#   resolve-plugin-root.sh --from-cwd   # only env + cwd walk-up (no script-dir fallback)

set -eu

from_cwd_only=0
case "${1-}" in
  --from-cwd|--from-cwd-only) from_cwd_only=1 ;;
  --help|-h)
    printf '%s\n' "Usage: resolve-plugin-root.sh [--from-cwd]"
    exit 0
    ;;
  "")
    ;;
  *)
    printf '%s\n' "ERROR: unknown argument: $1" >&2
    exit 2
    ;;
esac

fail() {
  printf '%s\n' "ERROR: $*" >&2
  exit 1
}

is_fractal_agentic_root() {
  dir=$1
  [ -f "$dir/plugin.json" ] || return 1
  [ -f "$dir/AGENTS.md" ] || return 1
  [ -f "$dir/docs/bosses/INDEX.md" ] || return 1
  for boss in design code agent svelte creator workflow meta; do
    [ -f "$dir/docs/bosses/$boss/INDEX.md" ] || return 1
  done
  [ -f "$dir/skills/boss-orchestration/SKILL.md" ] || return 1
  [ -f "$dir/commands/orchestrate.md" ] || return 1
  if command -v python3 >/dev/null 2>&1; then
    python3 - "$dir/plugin.json" <<'PY' 2>/dev/null || return 1
import json, sys
from pathlib import Path
data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
name = str(data.get("name") or "")
if name not in ("fractal-agentic", "fractal_agentic"):
    raise SystemExit(1)
PY
  fi
  return 0
}

# If dir is the monorepo root (or any parent), prefer its package child.
resolve_from_dir() {
  dir=$1
  if is_fractal_agentic_root "$dir"; then
    emit "$dir"
  fi
  if [ -d "$dir/plugin" ] && is_fractal_agentic_root "$dir/plugin"; then
    emit "$dir/plugin"
  fi
  if [ -d "$dir/packages/fractal-agentic" ] && is_fractal_agentic_root "$dir/packages/fractal-agentic"; then
    emit "$dir/packages/fractal-agentic"
  fi
}

emit() {
  dir=$1
  abs=$(CDPATH= cd "$dir" && pwd -P) || return 1
  printf '%s\n' "$abs"
  exit 0
}

# 1. Explicit env — must point at the plugin root, not the monorepo root
if [ -n "${FRACTAL_AGENTIC_ROOT-}" ]; then
  if is_fractal_agentic_root "$FRACTAL_AGENTIC_ROOT"; then
    emit "$FRACTAL_AGENTIC_ROOT"
  fi
  # Convenience: allow monorepo root if its package is valid
  if [ -d "$FRACTAL_AGENTIC_ROOT/plugin" ] && is_fractal_agentic_root "$FRACTAL_AGENTIC_ROOT/plugin"; then
    emit "$FRACTAL_AGENTIC_ROOT/plugin"
  fi
  if [ -d "$FRACTAL_AGENTIC_ROOT/packages/fractal-agentic" ] && is_fractal_agentic_root "$FRACTAL_AGENTIC_ROOT/packages/fractal-agentic"; then
    emit "$FRACTAL_AGENTIC_ROOT/packages/fractal-agentic"
  fi
  fail "FRACTAL_AGENTIC_ROOT is set but is not a valid Fractal Agentic plugin root: $FRACTAL_AGENTIC_ROOT"
fi

cwd=$(pwd -P)

# 2. Common monorepo / clone relatives from cwd
for cand in \
  "$cwd/plugin" \
  "$cwd/packages/fractal-agentic" \
  "$cwd/fractal-agentic/plugin" \
  "$cwd/agentic/fractal-agentic/plugin" \
  "$cwd/../plugin" \
  "$cwd/../fractal-agentic/plugin" \
  "$cwd/../agentic/fractal-agentic/plugin" \
  "$cwd/../../agentic/fractal-agentic/plugin" \
  "$cwd/../../../agentic/fractal-agentic/plugin" \
  "$cwd/agentic/fractal-agentic" \
  "$cwd/fractal-agentic" \
  "$cwd/../agentic/fractal-agentic" \
  "$cwd/../fractal-agentic"
do
  if [ -d "$cand" ]; then
    resolve_from_dir "$cand"
  fi
done

# 3. Walk up looking for plugin root or monorepo containing plugin/
dir=$cwd
while [ "$dir" != "/" ]; do
  resolve_from_dir "$dir"
  if [ -d "$dir/agentic/fractal-agentic/plugin" ] && is_fractal_agentic_root "$dir/agentic/fractal-agentic/plugin"; then
    emit "$dir/agentic/fractal-agentic/plugin"
  fi
  if [ -d "$dir/agentic/fractal-agentic" ]; then
    resolve_from_dir "$dir/agentic/fractal-agentic"
  fi
  if [ -d "$dir/fractal-agentic/plugin" ] && is_fractal_agentic_root "$dir/fractal-agentic/plugin"; then
    emit "$dir/fractal-agentic/plugin"
  fi
  if [ -d "$dir/packages/fractal-agentic" ] && is_fractal_agentic_root "$dir/packages/fractal-agentic"; then
    emit "$dir/packages/fractal-agentic"
  fi
  parent=$(CDPATH= cd "$dir/.." && pwd -P) || break
  [ "$parent" = "$dir" ] && break
  dir=$parent
done

# 4. Script install location (skipped with --from-cwd)
#    scripts/ lives inside the plugin root → parent of script_dir is the plugin root
if [ "$from_cwd_only" -eq 0 ]; then
  script_dir=$(CDPATH= cd "$(dirname "$0")" && pwd -P) || exit 1
  plugin_from_script=$(CDPATH= cd "$script_dir/.." && pwd -P) || exit 1
  if is_fractal_agentic_root "$plugin_from_script"; then
    emit "$plugin_from_script"
  fi
fi

printf '%s\n' "ERROR: Fractal Agentic plugin root not found from cwd=$cwd" >&2
exit 1
