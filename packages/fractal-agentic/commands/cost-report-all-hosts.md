---
description: Aggregate cost report across all hosts — Claude, Codex, OpenCode, and any other registered host.
---

# /cost-report --all-hosts

Merges cost data from all registered hosts into a single report.

## Usage

```
/cost-report --all-hosts
/cost-report --all-hosts --since 7d
/cost-report --all-hosts --by-project
```

## Flow

1. Scan host cost directories:
   - Claude: ~/.claude/projects/*/cost-tracker/
   - Codex: ~/.codex/cost/
   - OpenCode: ~/.opencode/cost/
   - Custom hosts: scan FRACTAL_HOST_DIRS list
2. Parse cost JSONL from each host
3. Merge by timestamp, dedupe overlapping sessions
4. Report: total cost per host, per project, per day
5. Flag: most expensive session, cost trend (up/down), budget alerts

## Output format

```
============================================================
  COST REPORT — last 7 days (all hosts)
============================================================
  Claude:   $12.34 (8 sessions, 2 projects)
  Codex:    $4.56  (3 sessions, 1 project)
  OpenCode: $1.23  (1 session,  1 project)
  ────────────────────────────────────────
  Total:    $18.13 (12 sessions, 3 hosts)

  By project:
    mandala:       $14.50 (fractalengine, fracta)
    personal-site: $3.63

  Most expensive: claude:mandala:fractalengine — $5.20 (Jul 15)

  Trend: up 15% week-over-week
  Budget: 72% of $25/week limit
============================================================
```

## Arguments
- --since <duration> optional (default 7d)
- --by-project optional
- --by-host optional (default)
- --raw optional (skip formatting)
