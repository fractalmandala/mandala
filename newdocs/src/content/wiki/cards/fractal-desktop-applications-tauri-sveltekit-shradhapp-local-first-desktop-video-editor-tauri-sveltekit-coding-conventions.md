---
title: Shradhapp — Local-First Desktop Video Editor (Tauri + SvelteKit) — Coding Conventions
description: - Backend capabilities are exposed exclusively through typed Tauri commands listed in a single tauri::generatehandler![...] macro in lib.rs; the frontend accesses them only via the src/lib/backend/ t…
tags: [apps/shradhapp]
type: card
module: apps/shradhapp
path: apps/shradhapp
created: 2026-08-05
updated: 2026-08-06
---

- Backend capabilities are exposed exclusively through typed Tauri commands listed in a single `tauri::generate_handler![...]` macro in `lib.rs`; the frontend accesses them only via the `src/lib/backend/` type layer.
- Rust modules follow a clear separation of concerns: `db.rs` handles SQLite CRUD, `media_engine.rs` is the sole FFmpeg shelling-out module, and `commands.rs` maps Tauri invocations to those layers.
- Frontend state is managed through Svelte 5 stores (`*.svelte.ts` files) using the `$state`/`$derived` runes, with undo/redo implemented as a command-stack pattern in `undo.svelte.ts`.
- App data is always written under the OS app-data directory (`data_dir.join("library")`, `thumb_dir`, `media_bank.db` and originals are never mutated — copies are made into the library folder.
- Project files use a versioned JSON schema (the `version` field drives migration helpers like `map_project_v1_to_v2`, and all project edits autosave via debounced updates.
