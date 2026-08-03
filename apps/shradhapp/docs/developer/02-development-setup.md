---
title: Development setup
description: Prerequisites, everyday commands for the SvelteKit shell and the real Tauri app, and running the Rust integration tests.
category: developer
id: 2
---

# Development setup

## Prerequisites

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 18+ | for Vite and the Tauri CLI (installed as a devDependency) |
| pnpm | 11.0.4 | package manager; use Corepack or install pnpm directly |
| Rust / Cargo | 1.77.2+ | `rust-version` in `src-tauri/Cargo.toml`; any current stable toolchain works |
| ffmpeg + ffprobe | any recent | must be on `PATH`, or in a platform-typical location (see below) |

**macOS:** `brew install ffmpeg`
**Windows:** install ffmpeg and ensure it's on `PATH` or in `C:\ffmpeg\bin` (other
standard locations — `C:\Program Files\ffmpeg\bin`, `%LOCALAPPDATA%\ffmpeg\bin`,
Chocolatey's bin — are probed automatically; the full list is in
`Ffmpeg::locate` / `fallback_dirs()` in `media_engine.rs`).
**Linux:** install via your package manager; `/usr/bin`, `/usr/local/bin` and
`/snap/bin` are probed.

If ffmpeg is missing the app still launches — `Ffmpeg::locate()` returns `Err`, a
warning is printed to stderr, and every command that needs it returns the friendly
`FFMPEG_MISSING` message.

## Install and run

```bash
pnpm install
```

**SvelteKit browser shell** (no Rust needed):

```bash
pnpm dev        # → http://localhost:1420
```

This starts the frontend only. Media import, recording, cleanup, persistence and
export require the desktop runtime, so the browser view shows a
desktop-runtime-required state. `dev` is a plain `vite` invocation, so CLI args pass through:
`pnpm dev --port 7100 --host`.

**The real desktop app:**

```bash
pnpm tauri dev
```

`tauri.conf.json` wires `beforeDevCommand: pnpm dev` and
`devUrl: http://localhost:1420`, so the frontend hot-reloads while Rust rebuilds on
backend changes.

**Production frontend build:**

```bash
pnpm build      # vite build → dist/ (tauri.conf.json frontendDist: ../dist)
pnpm preview    # optional: serve the built frontend
```

## Rust tests

There is one integration test suite, `src-tauri/tests/media_engine.rs`. It generates
real fixtures with ffmpeg, then exercises thumbnails, waveform rendering, audio
cleanup, concat export (MP4 and MOV), and the cancellation path, asserting durations
with ffprobe. It requires ffmpeg on the machine:

```bash
cd src-tauri && cargo test --test media_engine -- --nocapture
```

## Useful repo facts

- `package.json` scripts: `dev` (vite), `build` (vite build), `preview`
  (vite preview), `tauri` (tauri CLI). All Tauri CLI work goes through
  `pnpm tauri <cmd>`.
- Frontend stack: SvelteKit + Svelte 5 (runes), Vite 6 + TypeScript,
  `@tauri-apps/api` and `@tauri-apps/plugin-dialog` as the runtime Tauri bridge.
- The app uses the recognizable SvelteKit source shape: `src/app.html`,
  `src/routes/+layout.svelte`, `src/routes/+layout.ts`, and
  `src/routes/+page.svelte`. The root layout exports `ssr = false` and
  `prerender = true`, and `@sveltejs/adapter-static` writes to `dist/` for Tauri's
  `frontendDist`.
- Key Rust deps: `tauri 2` (with `protocol-asset`), `tauri-plugin-dialog 2`,
  `rusqlite 0.32` with the `bundled` feature (SQLite is compiled in — nothing to
  install), `serde`/`serde_json`, `uuid` (v4 ids), `base64` (recording upload).
- Tauri identifier: `com.momvideostudio.app`; window 1180×780 (min 900×600).
- Pure layout/style work can usually be checked in the browser shell; any workflow
  that touches media, recording, cleanup, persistence or export should be reproduced
  with `pnpm tauri dev`.

Next: [Rust backend](./03-rust-backend.md) · [Frontend](./04-frontend.md)
