---
description: Cross-host daily summary from session ledger + git status.
---

# /daily-brief

Scans session ledger across all hosts, git status on known repos,
and active handoff. Prints a compact what-to-do-next brief.

## Usage

```
/daily-brief
/daily-brief --since 48h
/daily-brief --repo mandala
```

## Flow

1. Read ~/.fractal/sessions/ledger.jsonl, filter last 24h
2. Check ~/.fractal/sessions/active/handoff.md status
3. Scan known monorepo paths for dirty git trees
4. Print 5-line brief: sessions, handoff, dirty repos, open loops, recommendation
5. Optionally delegate to context-broker agent for summarization

## Arguments
- --since <duration> optional (default 24h)
- --repo <name> optional
- --raw optional (skip context-broker)
