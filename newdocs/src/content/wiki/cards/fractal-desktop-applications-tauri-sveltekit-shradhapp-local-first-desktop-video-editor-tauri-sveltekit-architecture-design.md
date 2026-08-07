---
title: Shradhapp — Local-First Desktop Video Editor (Tauri + SvelteKit) — Architecture Design
description: Two-layer desktop application: the Rust backend (src-tauri/) implements Tauri commands for file I/O, SQLite persistence (rusqlite), and FFmpeg orchestration, while the SvelteKit frontend (src/) rende…
tags: [apps/shradhapp]
type: card
module: apps/shradhapp
path: apps/shradhapp
created: 2026-08-05
updated: 2026-08-06
---

Two-layer desktop application: the Rust backend (`src-tauri/` implements Tauri commands for file I/O, SQLite persistence (rusqlite), and FFmpeg orchestration, while the SvelteKit frontend (`src/` renders the UI in a Tauri-hosted Chromium window. `src-tauri/src/main.rs` is a thin entry that delegates to `mom_video_studio_lib::run()` defined in `lib.rs`, which wires up the app state (DB handle, data/library/thumbnail dirs, ffmpeg probe result, cancellation map) via `app.manage()`. Commands are declared centrally in `commands.rs` and registered through `tauri::generate_handler![]`. The media engine lives in `media_engine.rs` as the single module that shells out to ffmpeg/ffprobe; the frontend never constructs command lines directly. Frontend code under `src/lib/` is organized into `backend/` (typed Tauri command bindings), `components/` (MediaBank, Recorder, Assembler), `editor/`, `timeline/`, and shared stores (`stores.svelte.ts`, `undo.svelte.ts`, `settings.svelte.ts`. Routes are minimal: `+layout.svelte` injects global styles and Toaster, `+page.svelte` hosts three tabs, and `routes/editor/+page.svelte` mounts the timeline editor spike. Static adapter + mdsvex are used so the same codebase can run as a pure SvelteKit dev server or as a bundled Tauri app.
