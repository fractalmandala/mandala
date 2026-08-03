---
description: Show resolved LLM wiki root, config capture flags, directory counts, and recent log entries.
---

# /wiki-status

## Instructions

1. Resolve root:

   ```sh
   sh <plugin>/skills/llm-wiki/scripts/wiki-resolve-root.sh
   ```

   On failure: say wiki not configured; suggest `/wiki-init`. Do not block other work.

2. Report:
   - Absolute root
   - Config path / `FRACTAL_WIKI_ROOT` if set
   - Counts: raw files (exclude assets), `raw/fractal/` episodes, wiki pages per folder
   - Last 5 entries from `wiki/log.md` (if present)
   - Whether `description` appears missing on a quick sample (optional grep)

3. Print capture flags from config when available (`orchestrate`, `boss_handoff`, `santa_ship`).
