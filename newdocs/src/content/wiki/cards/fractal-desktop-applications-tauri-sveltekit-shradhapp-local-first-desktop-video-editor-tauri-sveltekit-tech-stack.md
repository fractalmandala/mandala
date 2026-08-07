---
title: Shradhapp — Local-First Desktop Video Editor (Tauri + SvelteKit) — Tech Stack
description: Tauri 2 with Rust 1.77.2 backend (rusqlite bundled, reqwest with rustls, serdejson, uuid, base64); Svelte 5 + SvelteKit 2 + Vite 6 with TypeScript; Tailwind CSS 4 via fractals-styler; FFmpeg/ffprobe…
tags: [apps/shradhapp]
type: card
module: apps/shradhapp
path: apps/shradhapp
created: 2026-08-05
updated: 2026-08-06
---

Tauri 2 with Rust 1.77.2 backend (rusqlite bundled, reqwest with rustls, serde_json, uuid, base64); Svelte 5 + SvelteKit 2 + Vite 6 with TypeScript; Tailwind CSS 4 via fractals-styler; FFmpeg/ffprobe invoked from Rust (found on PATH or platform locations); SQLite database stored under `$APPDATA/media_bank.db` with asset protocol scoped to `$APPDATA/**` for media previews.
