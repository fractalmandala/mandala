#!/usr/bin/env bash
# install.sh — install SKAA into any project directory.
#
# Usage:
#   ./scripts/install.sh /path/to/your/project
#   ./scripts/install.sh            # installs into the current directory
#
# What it does:
#   1. Copies server/, scripts/, docs/, config/ into <project>/.skaa/
#   2. Sets up a Python environment for the server (uv if available, else venv)
#   3. Initializes the SQLite smriti store and runs a self-test
#   4. Logs the install itself + the schema decision into smriti (pratyaksa),
#      so run_probes.py's two starter probes have something real to recall
#   5. Prints the MCP config block to add to Claude Desktop / Claude Code

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PACKAGE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TARGET_DIR="$(cd "${1:-.}" && pwd)"
SKAA_DIR="$TARGET_DIR/.skaa"

echo "Installing SKAA into: $TARGET_DIR"
echo "  (package source: $PACKAGE_ROOT)"

if [ -d "$SKAA_DIR/server" ]; then
  echo "Warning: $SKAA_DIR already exists. Re-running will overwrite server/scripts/docs/config"
  echo "but will NOT touch $SKAA_DIR/smriti.db. Ctrl-C now to abort."
  sleep 2
fi

mkdir -p "$SKAA_DIR"
cp -R "$PACKAGE_ROOT/server" "$SKAA_DIR/server"
cp -R "$PACKAGE_ROOT/scripts" "$SKAA_DIR/scripts"
cp -R "$PACKAGE_ROOT/docs" "$SKAA_DIR/docs"
cp -R "$PACKAGE_ROOT/config" "$SKAA_DIR/config"
cp "$PACKAGE_ROOT/README.md" "$SKAA_DIR/README.md"
cp "$PACKAGE_ROOT/CHECKLIST.md" "$SKAA_DIR/CHECKLIST.md"

# The project-facing SMRITI-LOG lives at the project's own docs/metrics
# path by convention (so it's easy to find alongside other project docs),
# not buried in .skaa/. Copy the template there if nothing exists yet.
PROJECT_LOG_DIR="$TARGET_DIR/docs/metrics"
mkdir -p "$PROJECT_LOG_DIR"
if [ ! -f "$PROJECT_LOG_DIR/SMRITI-LOG.md" ]; then
  cp "$PACKAGE_ROOT/docs/metrics/SMRITI-LOG.md" "$PROJECT_LOG_DIR/SMRITI-LOG.md"
fi

chmod +x "$SKAA_DIR/scripts/"*.sh "$SKAA_DIR/scripts/"*.py "$SKAA_DIR/server/skaa_server.py"

cd "$SKAA_DIR/server"

if command -v uv >/dev/null 2>&1; then
  echo "Using uv to set up the environment..."
  uv sync --quiet
  RUN_PREFIX="uv run"
elif command -v python3 >/dev/null 2>&1; then
  echo "uv not found, falling back to python3 -m venv..."
  python3 -m venv .venv
  # shellcheck disable=SC1091
  source .venv/bin/activate
  pip install --quiet --upgrade pip
  pip install --quiet mcp pyyaml pytest
  RUN_PREFIX=".venv/bin/python"
else
  echo "Neither uv nor python3 found. Install Python 3.10+ and re-run." >&2
  exit 1
fi

echo
echo "Running self-test..."
SKAA_DB_PATH="$SKAA_DIR/smriti.db" $RUN_PREFIX skaa_server.py --selftest

echo
echo "Logging the install + schema decision to smriti..."
SKAA_DB_PATH="$SKAA_DIR/smriti.db" $RUN_PREFIX python3 - <<'PYEOF'
import os, sys
sys.path.insert(0, os.getcwd())
from skaa.tools import SkaaContext, skaa_memory_write

ctx = SkaaContext(db_path=os.environ["SKAA_DB_PATH"])
skaa_memory_write(
    ctx,
    content="SKAA package installed into this project via install.sh.",
    pramana="pratyaksa", karta="install.sh", karma="skaa/install",
    dhatu_cluster="kr", tags="install",
)
skaa_memory_write(
    ctx,
    content=(
        "Schema decision: this project's smriti store uses SQLite at "
        ".skaa/smriti.db with pramana/karta/karma/karana/sampradana/"
        "apadana/adhikarana/dhatu_cluster/karaka_role/tags columns, "
        "per docs/ADR-001-schema.md."
    ),
    pramana="pratyaksa", karta="install.sh", karma="skaa/install",
    dhatu_cluster="dhr", tags="install,schema",
)
ctx.close()
print("Logged 2 install-time smriti entries.")
PYEOF

echo
echo "============================================================"
echo "SKAA installed at: $SKAA_DIR"
echo "============================================================"
echo
echo "Next steps:"
echo "  1. Add this to your Claude Desktop / Claude Code MCP config"
echo "     (see $SKAA_DIR/config/mcp.config.example.json for the file"
echo "     this block goes into):"
echo
if command -v uv >/dev/null 2>&1; then
  cat <<EOF
  "skaa": {
    "command": "uv",
    "args": ["run", "--directory", "$SKAA_DIR/server", "skaa_server.py"],
    "env": { "SKAA_DB_PATH": "$SKAA_DIR/smriti.db" }
  }
EOF
else
  cat <<EOF
  "skaa": {
    "command": "$SKAA_DIR/server/.venv/bin/python",
    "args": ["$SKAA_DIR/server/skaa_server.py"],
    "env": { "SKAA_DB_PATH": "$SKAA_DIR/smriti.db" }
  }
EOF
fi
echo
echo "  2. Restart Claude / reload MCP servers, then call skaa_status to confirm."
echo "  3. Set up the measurement harness cadence — see $SKAA_DIR/CHECKLIST.md"
echo "     and $PROJECT_LOG_DIR/SMRITI-LOG.md"
echo "  4. Read $SKAA_DIR/docs/ARCHITECTURE.md and $SKAA_DIR/docs/SUTRAS.md"
