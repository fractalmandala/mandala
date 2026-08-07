---
title: Fractal Agentic Command Definitions — Coding Conventions
description: - Every command file starts with a YAML frontmatter description field summarizing the command's purpose in one sentence.
tags: [packages/fractal_agentic/plugin_core/commands]
type: card
module: packages/fractal_agentic/plugin_core/commands
path: packages/fractal_agentic/plugin_core/commands
created: 2026-08-05
updated: 2026-08-06
---

- Every command file starts with a YAML frontmatter `description` field summarizing the command's purpose in one sentence.
- Commands follow a consistent structure: a header with the slash-trigger in a code block, followed by numbered step-by-step instructions that reference skills and scripts via relative paths.
- Activation commands (`activate-boss-*` always read the startup router first, then load exactly one boss playbook from `docs/bosses/<boss>/INDEX.md`, and defer execution to `/orchestrate`.
- Commands that scaffold or configure state call out shell scripts under the relevant skill directory and document the exact invocation syntax with arguments.
- Non-blocking behavior is explicitly declared when optional features (hooks, wiki, install profiles) are unavailable, directing users to the canonical progression policy.
