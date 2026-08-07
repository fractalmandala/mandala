---
title: shradhapp
description: SvelteKit app with evolving styling; enforces indented-SASS, reusable general classes, and divergence/drift self-check.
tags: [app, shradhapp, sveltekit, sass, design-tokens]
type: card
module: apps/shradhapp
path: apps/shradhapp
created: 2026-08-04
updated: 2026-08-06
---

- **Path:** `apps/shradhapp`
- **What:** A SvelteKit app whose styling system is still evolving; carries strict SASS discipline.
- **Stack:** SvelteKit + Svelte 5 + Tauri + TypeScript (package manager pnpm).
- **Mandatory SASS rules:** (1) indented SASS only — never SCSS/CSS; (2) no singular-element classes — create reusable general classes (borders/gaps) from `src/lib/styles`; (3) after every styling change, self-check whether divergence/drift increased — if so, reverse it.
- **Key artifacts:** `DESIGN.md`, `design-tokens.json`, `AGENTS.md`, `audit/drag-drop-*` review folder, `svelte-video-editor-ref/` reference.
- **Tauri scripts:** `desktop:dev/check/tauri/build`, plus `guardrails`.
