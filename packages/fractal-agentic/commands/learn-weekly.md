---
description: Cross-project weekly synthesis — promotion candidates, new instincts, stale instincts, global health.
---

# /learn-weekly

Scans instinct DBs across all known projects and produces a weekly synthesis:
promotion candidates, new instincts, stale instincts, global health.

## Usage

```
/learn-weekly
/learn-weekly --raw
```

## Flow

1. Run instinct-cli.py weekly --json to collect cross-project data
2. If --raw: print the JSON with basic formatting
3. Otherwise: pass JSON to weekly-synthesizer agent for formatted report
4. Agent produces 5-section markdown: promotion candidates, new this week,
   stale, global health, recommendation

## Sections produced

1. **Promotion Candidates** — instincts appearing in 2+ projects with >=80% avg confidence,
   not yet promoted to global.
2. **New This Week** — instincts created in the last 7 days, grouped by project.
3. **Stale** — instincts with no file activity in 30+ days.
4. **Global Health** — total global instincts, new, stale.
5. **Recommendation** — what to promote, what to prune.

## Arguments
- --raw optional (skip agent, print JSON directly)
