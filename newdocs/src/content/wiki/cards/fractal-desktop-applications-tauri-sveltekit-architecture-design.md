---
title: Fractal Desktop Applications (Tauri + SvelteKit) — Architecture Design
description: Each app under apps/ is an independent Tauri project with its own src/ (SvelteKit frontend), src-tauri/ (Rust binary via Cargo), and package.json. The two apps share no code between them; they are pa…
tags: [apps]
type: card
module: apps
path: apps
created: 2026-08-05
updated: 2026-08-06
---

Each app under apps/ is an independent Tauri project with its own `src/` (SvelteKit frontend), `src-tauri/` (Rust binary via Cargo), and `package.json`. The two apps share no code between them; they are parallel implementations of the same platform pattern: SvelteKit routes expose UI, Tauri commands in `src-tauri/src/lib.rs` call into Rust crates for filesystem, search, media, or AI operations, and the frontend communicates through `@tauri-apps/api`. Both apps use the shared `fractalsvelte` component library and follow the same directory layout (`src/routes`, `src/lib`, `src-tauri/capabilities/default.json`, `tauri.conf.json`, making them interchangeable templates for new desktop apps.
