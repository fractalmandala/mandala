---
description: Answer questions against the LLM wiki using index descriptions, optional qmd, and wikilink citations; offer to file valuable answers into synthesis/.
---

# /wiki-query

## Instructions

1. Resolve vault; if missing, answer from session only and mention wiki is unconfigured.

2. Search strategy:
   - Read `wiki/index.md` (descriptions) first
   - If `qmd` exists: `qmd search "…" --path "$FRACTAL_WIKI_ROOT/wiki"`
   - Else: ripgrep over `wiki/**/*.md` including frontmatter `description:`
   - Read relevant pages; follow `[[wikilinks]]`
   - Raw only as last resort

3. Answer with `[[wikilink]]` citations. Match format to question type.

4. If the answer is a durable comparison/analysis, offer to save under
   `wiki/synthesis/` with full frontmatter (**description** required), update index + log.
