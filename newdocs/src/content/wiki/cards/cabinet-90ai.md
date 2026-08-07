---
title: Cabinet 90AI
description: External General File Cabinet AI config at 100cabinet/90AI — 3 agents, 6 plugins, 29 skills (dharmic, fiction, sass, wiki-builder, cabinet-dev) + souls.
tags: [external, cabinet, 90ai, agents, plugins, skills, dharmic, fiction-writer, wiki-builder]
type: card
module: external/cabinet-90ai
path: external/cabinet-90ai
created: 2026-08-04
updated: 2026-08-06
---

**Path:** `/Users/amrit/100cabinet/90AI` — **outside** the mandala project root, included in this knowledge base via `wiki_plan.yaml` strong priors. `registry.json` names it "General File Cabinet"; root env var `CABINET_ROOT`, default root `/Users/amrit/100cabinet/90AI`.

## Agents (`agents/`
- `dharma-ai` (`./agents/dharma-ai`
- `wiki-manager` (`./agents/wiki-manager`
- `cabinet-manager` (`./agents/cabinet-manager`

Also holds `agents/_schema.json` and curated agent subfolders (`curated-curor`, `dharmic-rooting`, `wiki-manager`.

## Plugins & their skills (`plugins/` + `skills/` — 29 skills across 6 plugins
| Plugin | Skills |
|---|---|
| **dharmic-emergence** | wiki-civilization-auditor, wiki-civilization-emic-tether, wiki-civilization-source-navigator |
| **dharmic-rooting** | dharmic-epistemology, dharmic-writing-companion, indic-history, scholar-navigator, shatrubodha, vedic-vision |
| **fiction-writer** | chapter-outliner, continuity-tracker, dialogue-writer, hard-sf-science-advisor, narrative-structure-frameworks, prose-rewriter, scene-diagnosis, sf-myth-writer, story-bible-generator |
| **sveltekit-sass-styler** | sass-syntax, style-consistency, style-sync |
| **wiki-builder** | wiki-compiler, contents-generator, wiki-linker, graph-manager, wiki-sync-runner, wiki-ingestor |
| **cabinet-developer** | registry-maintainer, skill-creator, plugin-creator, agent-creator |

The skill set is oriented around: Indic/dharmic knowledge & writing, fiction writing, SvelteKit SASS styling, wiki building/compiling/linking, and cabinet meta-development (creating skills/plugins/agents).

## Souls (`souls/`
Packaged soul/role definitions, versioned: `clawsouls-frontend-dev-1.3.0`, `clawsouls-graphic-designer-1.3.0`, `clawsouls-scifi-writer-1.3.0`, `clawsouls-storyteller-2.1.0`, `graphic-designer`, plus `spec.json`.

## Loose skill/prompt docs (root)
Markdown docs at the 90AI root define writing/rewriting rules and AI process notes — e.g. `ai-writing-clean.md`, `ai-strict-no.md`, `claude-skill-process.md`, `grand-writer-redrafts.md`, `notes-to-ai.md` (a "complete rewriting rules" guide: natural flow, remove overused words, eliminate awkward contrasts, holistic essay format, "say it once" rule, preserve technical accuracy), `html-json-flow.md`, `module-graph-report.md`, `display-graph.md`, `analyze-code-module.md`, `analyze-foglamp.md`, `claude-novel.md`, `gemini-writer-gem.md`.

## Relationship to this monorepo
- The `sveltekit-sass-styler` plugin mirrors the monorepo's house SASS rules (see [Coding Conventions](conventions.md)).
- The `wiki-builder` plugin and `wiki-manager` agent operate the [Fractal Wiki Vault](fractal-wiki-vault.md) sibling folder.
- The `dharmic-*` plugins connect to the Sanskrit/Indic thread also seen in `sites/fractaldharma` and `sites/fractalmem`.
