---
description: Append a fractal episode to raw/fractal/ with required title and description frontmatter (orchestrate/boss boundary capture).
---

# /wiki-capture

Write an append-only episode under `raw/fractal/` without full multi-page ingest.

## Instructions

1. Resolve vault via `wiki-resolve-root.sh`. If missing → warn once; stop capture only
   (never fail the parent task).

2. Collect from conversation / orchestrate result:
   - title, **description** (≤120 chars, required)
   - boss, status (ship|fix-first|rethink|in-progress|cancelled)
   - project, tags, capability_mode, key paths, goal, decisions, outcome, open questions

3. Filename: `raw/fractal/YYYY-MM-DD-HHMMSS-<kebab-slug>.md` (or date-only + slug).

4. Frontmatter **must** include `title`, `description`, `type: episode`, `created`,
   `updated`, `tags` — see wiki-schema Fractal episode section.

5. Append to `wiki/log.md`:

   ```markdown
   ## [YYYY-MM-DD] capture | <title>
   Episode raw/fractal/<filename>. description: <description>
   ```

6. Report path written. Offer `/wiki-ingest` if the user wants entity/concept pages updated now.
