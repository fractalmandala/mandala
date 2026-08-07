---
title: Fractal Agentic Command Definitions — Architecture Design
description: Each command is a standalone Markdown file under commands/ with a YAML frontmatter description field and a human-readable instruction set. Commands are not executable code — they serve as agent-facin…
tags: [packages/fractal_agentic/plugin_core/commands]
type: card
module: packages/fractal_agentic/plugin_core/commands
path: packages/fractal_agentic/plugin_core/commands
created: 2026-08-05
updated: 2026-08-06
---

Each command is a standalone Markdown file under `commands/` with a YAML frontmatter `description` field and a human-readable instruction set. Commands are not executable code — they serve as agent-facing documentation that tells an LLM how to invoke the corresponding skill or script. The `INDEX.md` acts as the canonical inventory table mapping command titles to their trigger paths and descriptions. Commands reference sibling resources via relative paths: boss playbooks under `../docs/bosses/`, runtime skills under `../skills/`, and shared references like `AGENTS.md`. Activation commands (`activate-boss-*` pair with the central `/orchestrate` runtime command, which delegates to skills in `skills/boss-orchestration/`. Many commands bootstrap shell scripts (e.g., `wiki-init.sh`, `check-armory.sh` located under the referenced skill directories, establishing a clear dependency direction: commands → skills → scripts/tools.
