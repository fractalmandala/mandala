---
title: Fractal Desktop Applications (Tauri + SvelteKit) — Coding Conventions
description: - Frontend lives in src/ using SvelteKit route files (+page.svelte, +layout.svelte, +layout.ts) with shared UI in src/lib/.
tags: [apps]
type: card
module: apps
path: apps
created: 2026-08-05
updated: 2026-08-06
---

- Frontend lives in `src/` using SvelteKit route files (`+page.svelte`, `+layout.svelte`, `+layout.ts` with shared UI in `src/lib/`.
- Native capabilities are declared per-app in `src-tauri/capabilities/default.json` and the Rust entry point is `src-tauri/src/lib.rs` exposing Tauri commands.
- Both apps consume the shared `fractalsvelte` component library for consistent UI primitives across desktop apps.
- Build and dev tooling follows the standard Tauri+SvelteKit convention: Vite for the frontend, Cargo for the Rust backend, and a `tauri.conf.json` manifest.
