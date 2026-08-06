---
description: Process unprocessed raw/ sources (and fractal episodes) into structured wiki pages with description frontmatter, index, and log updates.
---

# /wiki-ingest

## Instructions

Follow [skills/llm-wiki/SKILL.md](../skills/llm-wiki/SKILL.md) and
[references/wiki-schema.md](../skills/llm-wiki/references/wiki-schema.md).

1. Resolve vault root; abort ingest only if missing (suggest `/wiki-init`).

2. Identify sources:
   - User-specified files, or
   - Files under `raw/` (not `raw/assets/`) not yet mentioned in `wiki/log.md` ingest/capture processing lines

3. For each source (prefer one-at-a-time with user confirmation on large batches):
   - Read fully
   - Share 3–5 takeaways; wait if interactive
   - Create/update `wiki/sources/`, entities, concepts with **required frontmatter including description**
   - Wikilinks, index (description-backed), log

4. Fractal episodes under `raw/fractal/` use the same pipeline but lean on `boss` /
   `project` / `status` fields when promoting to concepts/entities.

5. Report pages created/updated and any contradictions noted.
