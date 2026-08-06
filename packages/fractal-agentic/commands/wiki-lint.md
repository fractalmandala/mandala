---
description: Health-check the LLM wiki for broken links, orphans, contradictions, missing description frontmatter, and index drift.
---

# /wiki-lint

## Instructions

Resolve vault; then audit:

1. Broken `[[wikilinks]]`
2. Orphan pages (no inbound links)
3. Contradictions / stale claims
4. Missing pages / cross-refs
5. Index consistency
6. **Frontmatter errors:** any wiki page or fractal episode missing `title` or **`description`**
7. Data gaps / suggested articles

Report Errors / Warnings / Info with What / Where / Fix.

Offer to fix; append log:

```markdown
## [YYYY-MM-DD] lint | Health check
Found N errors, N warnings, N info. Fixed: …
```

Schedule: after ~10 ingests, monthly, or before major synthesis.
