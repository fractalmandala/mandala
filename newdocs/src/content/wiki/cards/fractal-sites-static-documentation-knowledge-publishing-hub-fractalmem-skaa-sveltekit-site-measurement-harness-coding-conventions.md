---
title: fractalmem — SKAA SvelteKit Site & Measurement Harness — Coding Conventions
description: - Svelte components use Svelte 5 runes ($state, $derived, $effect, $props()) and import types from generated $types modules rather than manual declarations.
tags: [sites/fractalmem]
type: card
module: sites/fractalmem
path: sites/fractalmem
created: 2026-08-05
updated: 2026-08-06
---

- Svelte components use Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props()` and import types from generated `$types` modules rather than manual declarations.
- Documentation pages follow a frontmatter convention (`title`, `description`, `id` consumed by `docs/[doc]/+page.ts` loaders, with navigation built from the sorted list returned by `lib/index.ts::allDocs()`.
- The Python SKAA layer separates concerns strictly: `skaa_server.py` only wires FastMCP tool decorators to pure functions in `tools.py`, while `models.py`/`db.py`/`samskara.py` own data and heuristics, keeping the transport layer dependency-free.
- Installer and utility scripts are self-contained and idempotent: they detect `uv` first, fall back to `python3 -m venv`, set `SKAA_DB_PATH` via environment variables, and never modify existing user data without explicit confirmation.
- Static assets (fonts, images, robots.txt) live under `static/` and are referenced through absolute `/images/...` paths, while CSS is centralized in `src/lib/styles/index.sass` and imported once at the root layout.
