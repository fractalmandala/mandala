#!/usr/bin/env bash
# uninstall.sh — remove SKAA from a project.
#
# Usage: ./scripts/uninstall.sh /path/to/your/project
#
# By default this KEEPS smriti.db (your actual memory) and only removes
# the code/scripts/docs, since those can be reinstalled but the memory
# can't be regenerated. Pass --purge to delete everything including
# smriti.db and the project's docs/metrics/SMRITI-LOG.md.

set -euo pipefail

TARGET_DIR="$(cd "${1:-.}" && pwd)"
SKAA_DIR="$TARGET_DIR/.skaa"
PURGE=false

for arg in "$@"; do
  if [ "$arg" = "--purge" ]; then
    PURGE=true
  fi
done

if [ ! -d "$SKAA_DIR" ]; then
  echo "No .skaa directory found at $SKAA_DIR — nothing to do."
  exit 0
fi

if [ "$PURGE" = true ]; then
  echo "Purging everything, including smriti.db, from $SKAA_DIR"
  rm -rf "$SKAA_DIR"
  rm -f "$TARGET_DIR/docs/metrics/SMRITI-LOG.md"
  echo "Done. All smriti data has been deleted."
else
  echo "Removing SKAA code/scripts/docs from $SKAA_DIR, keeping smriti.db"
  find "$SKAA_DIR" -mindepth 1 -maxdepth 1 ! -name 'smriti.db' -exec rm -rf {} +
  echo "Done. Your memory is preserved at $SKAA_DIR/smriti.db"
  echo "Re-run install.sh at any point and it will pick that database back up."
fi
