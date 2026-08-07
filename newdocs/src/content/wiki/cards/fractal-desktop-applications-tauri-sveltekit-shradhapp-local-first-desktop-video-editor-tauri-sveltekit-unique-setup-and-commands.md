---
title: Shradhapp — Local-First Desktop Video Editor (Tauri + SvelteKit) — Unique Setup and Commands
description: Requires Node 18+, Rust/Cargo, and ffmpeg + ffprobe on PATH (brew install ffmpeg on macOS; Windows needs ffmpeg on PATH or C:\ffmpeg\bin). Development: pnpm install then pnpm tauri dev for the full d…
tags: [apps/shradhapp]
type: card
module: apps/shradhapp
path: apps/shradhapp
created: 2026-08-05
updated: 2026-08-06
---

Requires Node 18+, Rust/Cargo, and ffmpeg + ffprobe on PATH (`brew install ffmpeg` on macOS; Windows needs ffmpeg on PATH or `C:\ffmpeg\bin`. Development: `pnpm install` then `pnpm tauri dev` for the full desktop app, or `pnpm dev` for the SvelteKit browser shell at http://localhost:1420. Building installers: `pnpm tauri build` (produces .app/.dmg on macOS, .msi/NSIS on Windows). Media-engine integration tests: `cd src-tauri && cargo test --test media_engine -- --nocapture`.
