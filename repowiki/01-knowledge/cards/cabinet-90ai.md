---
title: Cabinet 90AI (external)
description: External General File Cabinet AI config — 3 agents, 6 plugins, 29 skills (dharmic, fiction, sass, wiki-builder, cabinet-dev) + souls.
tags: [external, cabinet, 90ai, agents, plugins, skills, dharmic, fiction-writer]
type: card
module: external/cabinet-90ai
path: /Users/amrit/100cabinet/90AI
created: 2026-08-04
updated: 2026-08-04
relates_to: [mandala-root, fractal-wiki-vault, conventions]
---

# Cabinet 90AI (external)

- **Path:** `/Users/amrit/100cabinet/90AI` (outside project root; included via `wiki_plan.yaml` strong priors)
- **registry.json:** name "General File Cabinet"; root env `CABINET_ROOT`; default root `/Users/amrit/100cabinet/90AI`.
- **Agents (`agents/`):** `dharma-ai`, `wiki-manager`, `cabinet-manager` (+ `_schema.json`, curated agent subfolders `curated-curor`, `dharmic-rooting`, `wiki-manager`).
- **Plugins (6) → skills (29):**
  - `dharmic-emergence` (3): wiki-civilization-auditor, -emic-tether, -source-navigator
  - `dharmic-rooting` (6): dharmic-epistemology, dharmic-writing-companion, indic-history, scholar-navigator, shatrubodha, vedic-vision
  - `fiction-writer` (9): chapter-outliner, continuity-tracker, dialogue-writer, hard-sf-science-advisor, narrative-structure-frameworks, prose-rewriter, scene-diagnosis, sf-myth-writer, story-bible-generator
  - `sveltekit-sass-styler` (3): sass-syntax, style-consistency, style-sync
  - `wiki-builder` (6): wiki-compiler, contents-generator, wiki-linker, graph-manager, wiki-sync-runner, wiki-ingestor
  - `cabinet-developer` (4): registry-maintainer, skill-creator, plugin-creator, agent-creator
- **Souls (`souls/`):** versioned packaged role definitions — `clawsouls-frontend-dev-1.3.0`, `clawsouls-graphic-designer-1.3.0`, `clawsouls-scifi-writer-1.3.0`, `clawsouls-storyteller-2.1.0`, `graphic-designer`, `spec.json`.
- **Loose docs (root):** writing/rewriting rules + AI process notes — `notes-to-ai.md` (natural-flow "say it once" rewrite rules), `ai-writing-clean.md`, `ai-strict-no.md`, `claude-skill-process.md`, `grand-writer-redrafts.md`, `html-json-flow.md`, `module-graph-report.md`, `display-graph.md`, `analyze-code-module.md`, `analyze-foglamp.md`, `claude-novel.md`, `gemini-writer-gem.md`.
- **Links to monorepo:** `sveltekit-sass-styler` ↔ house SASS rules ([[Coding Conventions]]); `wiki-builder`+`wiki-manager` operate the [[Fractal Wiki Vault]]; `dharmic-*` ↔ Sanskrit/Indic thread (sites/fractaldharma, fractalmem).
