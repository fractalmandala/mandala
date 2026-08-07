---
title: Mandala Monorepo — Coding Conventions
description: - All styling uses single-tab indented pure SASS (no braces, no colons); SCSS is forbidden everywhere.
tags: [repo]
type: card
module: repo
path: repo
created: 2026-08-05
updated: 2026-08-06
---

- All styling uses single-tab indented pure SASS (no braces, no colons); SCSS is forbidden everywhere.
- Each child project ships its own `AGENTS.md` that augments the root's agent bootstrap rules with project-specific overrides.
- Learnings captured via `capture this learning` / `document this error` follow the frontmatter schema in `LEARNINGS.md` and are stored under `docs/learnings/` with an INDEX.md registry.
- AI assistant configuration files (`CLAUDE.md`, `GEMINI.md`, `.windsurfrules` are kept as thin shims that `@include` the canonical `AGENTS.md` instead of duplicating instructions.
