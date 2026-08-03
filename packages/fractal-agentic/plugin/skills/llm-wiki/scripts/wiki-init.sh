#!/bin/sh
# Scaffold an LLM wiki vault. Usage: wiki-init.sh <vault-path> [vault-name]
set -eu

VAULT_ROOT="${1:-}"
VAULT_NAME="${2:-fractal-wiki}"
DOMAIN="${3:-Engineering and product knowledge}"

if [ -z "$VAULT_ROOT" ]; then
  printf '%s\n' "Usage: wiki-init.sh <vault-path> [vault-name] [domain-description]" >&2
  exit 2
fi

# Expand ~
case "$VAULT_ROOT" in
  ~/*) VAULT_ROOT=$HOME${VAULT_ROOT#\~} ;;
esac

mkdir -p "$VAULT_ROOT/raw/assets" \
  "$VAULT_ROOT/raw/fractal" \
  "$VAULT_ROOT/wiki/sources" \
  "$VAULT_ROOT/wiki/entities" \
  "$VAULT_ROOT/wiki/concepts" \
  "$VAULT_ROOT/wiki/synthesis" \
  "$VAULT_ROOT/output"

TODAY=$(date +%Y-%m-%d)

if [ ! -f "$VAULT_ROOT/.fractal-wiki.json" ]; then
  cat > "$VAULT_ROOT/.fractal-wiki.json" <<EOF
{
  "version": 1,
  "name": "$VAULT_NAME",
  "domain": "$DOMAIN",
  "created": "$TODAY",
  "schema": "fractal-agentic/llm-wiki"
}
EOF
fi

if [ ! -f "$VAULT_ROOT/wiki/index.md" ]; then
  cat > "$VAULT_ROOT/wiki/index.md" <<'EOF'
# Index

Master catalog of all wiki pages. Each line uses the page **description** (≤120 chars).
Updated on every ingest or page create.

## Sources

## Entities

## Concepts

## Synthesis
EOF
fi

if [ ! -f "$VAULT_ROOT/wiki/log.md" ]; then
  cat > "$VAULT_ROOT/wiki/log.md" <<EOF
# Log

Chronological record of operations. Append-only.

## [$TODAY] setup | Vault initialized
Created vault "$VAULT_NAME" ($DOMAIN).
EOF
fi

ABS=$(CDPATH= cd "$VAULT_ROOT" && pwd -P)

# User config default (skip when FRACTAL_WIKI_SKIP_USER_CONFIG=1 — tests/CI)
if [ "${FRACTAL_WIKI_SKIP_USER_CONFIG:-}" != "1" ]; then
  CFG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/fractal-agentic"
  mkdir -p "$CFG_DIR"
  CFG="$CFG_DIR/wiki.json"
  if [ ! -f "$CFG" ]; then
    cat > "$CFG" <<EOF
{
  "version": 1,
  "wiki_root": "$ABS",
  "capture": {
    "orchestrate": true,
    "boss_handoff": false,
    "santa_ship": true
  },
  "defaults": {
    "project": null
  }
}
EOF
    printf '%s\n' "Wrote config: $CFG" >&2
  else
    printf '%s\n' "Config exists (not overwritten): $CFG" >&2
    printf '%s\n' "Set wiki_root manually or export FRACTAL_WIKI_ROOT=$ABS" >&2
  fi
fi

printf '%s\n' "$ABS"
