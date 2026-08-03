#!/usr/bin/env bash
# smriti-metrics.sh — quick, dependency-light health check of a project's
# smriti store. Needs only sqlite3, no Python. Meant to be run often
# (manually, or via cron/CI) — see run_probes.py and behavioral_probes.py
# for the deeper, Python-based checks.
#
# Usage: ./scripts/smriti-metrics.sh [path/to/smriti.db]

set -euo pipefail

DB_PATH="${1:-.skaa/smriti.db}"
LOG_PATH="${SKAA_LOG_PATH:-docs/metrics/SMRITI-LOG.md}"

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 CLI not found. Install it (e.g. apt-get install sqlite3 / brew install sqlite3)." >&2
  exit 1
fi

if [ ! -f "$DB_PATH" ]; then
  echo "No smriti.db found at $DB_PATH — has install.sh been run / has skaa_server.py started at least once?" >&2
  exit 1
fi

TOTAL=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM smriti;")
LAST_24H=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM smriti WHERE created_at >= datetime('now','-1 day');")
LAST_7D=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM smriti WHERE created_at >= datetime('now','-7 day');")
PENDING_PROPOSALS=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM samskara_proposals WHERE status='pending';")
APPLIED_RULES=$(sqlite3 "$DB_PATH" "SELECT COUNT(*) FROM samskara_rules;")

echo "SKAA smriti metrics — $DB_PATH"
echo "========================================"
echo "Total entries:            $TOTAL"
echo "New in last 24h:          $LAST_24H"
echo "New in last 7 days:       $LAST_7D"
echo "Pending samskara proposals: $PENDING_PROPOSALS"
echo "Applied samskara rules:    $APPLIED_RULES"
echo
echo "Pramana distribution:"
sqlite3 "$DB_PATH" "SELECT '  ' || pramana || ': ' || COUNT(*) FROM smriti GROUP BY pramana ORDER BY COUNT(*) DESC;"
echo
echo "Top dhatu_cluster tags:"
sqlite3 "$DB_PATH" "SELECT '  ' || CASE WHEN dhatu_cluster='' THEN '(untagged)' ELSE dhatu_cluster END || ': ' || COUNT(*) FROM smriti GROUP BY dhatu_cluster ORDER BY COUNT(*) DESC LIMIT 10;"
echo
echo "Top karma prefixes (before first '/'):"
sqlite3 "$DB_PATH" "SELECT '  ' || CASE WHEN instr(karma,'/')>0 THEN substr(karma,1,instr(karma,'/')-1) ELSE karma END AS prefix, COUNT(*) AS n FROM smriti GROUP BY prefix ORDER BY n DESC LIMIT 10;"

mkdir -p "$(dirname "$LOG_PATH")"
if [ ! -f "$LOG_PATH" ]; then
  {
    echo "# Smrti Log"
    echo
    echo "| Date | Total entries | New (24h) | Pending proposals | Notes |"
    echo "|---|---|---|---|---|"
  } > "$LOG_PATH"
fi
echo "| $(date +%Y-%m-%d) | $TOTAL | $LAST_24H | $PENDING_PROPOSALS | smriti-metrics.sh |" >> "$LOG_PATH"
echo
echo "Appended a row to $LOG_PATH"
