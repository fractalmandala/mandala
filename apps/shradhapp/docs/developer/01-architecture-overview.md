---
title: Architecture overview
description: The Tauri 2 + Svelte 5 architecture, the backend abstraction, and the two hard architectural rules of the codebase.
category: developer
id: 1
---

# Architecture overview

Shradhapp is a local-first desktop app: a **Tauri 2** shell, a **SvelteKit/Svelte 5
+ TypeScript + Vite** frontend, a **Rust** backend, **SQLite** via `rusqlite`
(bundled, so no system dependency), and **FFmpeg/ffprobe** located on the host at
runtime.

```
┌────────────────────────────────────────────────────────────┐
│ SvelteKit frontend (src/)                                  │
│  routes/+page.svelte — 3 tabs: MediaBank/Recorder/Assembler│
│  routes/+layout.svelte — global CSS + page render          │
│  lib/backend/types.ts  — Backend interface (only surface)  │
│  lib/backend/tauri.ts  — invoke() typed Tauri commands     │
│  lib/backend/index.ts  — Tauri backend + runtime detection │
└──────────────────────┬─────────────────────────────────────┘
                       │ @tauri-apps/api invoke + events
┌──────────────────────▼─────────────────────────────────────┐
│ Rust backend (src-tauri/src/)                              │
│  lib.rs          — setup, dirs, DB open, command registry  │
│  commands.rs     — 15 typed #[tauri::command]s, AppState   │
│  db.rs           — SQLite: media + projects tables         │
│  media_engine.rs — ★ the ONLY module that shells out to    │
│                    ffmpeg/ffprobe                          │
└──────────────────────┬─────────────────────────────────────┘
                       │
              ffmpeg / ffprobe (located at startup)
              SQLite file + library/ + thumbnails/ under $APPDATA
```

## The two architectural rules

These are deliberate seeds for later phases — do not break them:

1. **All FFmpeg access goes through `media_engine`.**
   The frontend never constructs command lines; no other Rust module spawns ffmpeg.
   Every ffmpeg/ffprobe invocation is a typed function on the `Ffmpeg` struct
   (`probe`, `video_thumbnail`, `image_thumbnail`, `waveform`, `cleanup_audio`,
   `export`). Phase 3's AI layer will drive these same functions through the same
   commands.

2. **All UI (and later AI) access goes through typed Tauri commands.**
   The UI talks only to the `Backend` TypeScript interface, whose real implementation
   maps 1:1 onto the `#[tauri::command]` functions in `commands.rs`. There is no
   parallel code path — the AI layer will call the identical command surface.

A third supporting seed: the **project format is versioned** (`"version": 1`) and the
write path in `update_project` forces `data.version = 1`, so future migrations have a
guaranteed hook. And undo/redo is a **command stack** (`lib/undo.svelte.ts`) designed
so non-UI actors can push the same `Command` objects.

## Frontend backend abstraction

`src/lib/backend/index.ts` selects the implementation at module load:

```ts
const w = window as unknown as Record<string, unknown>;
export const isTauri = '__TAURI_INTERNALS__' in w || '__TAURI__' in w;
export const backend: Backend = tauriBackend;
```

- `__TAURI_INTERNALS__` is injected by the real Tauri runtime; `__TAURI__` exists
  because `tauri.conf.json` sets `"withGlobalTauri": true`.
- **In the real app** (`pnpm tauri dev`), `tauri.ts` proxies everything through
  `invoke()` to Rust, and converts filesystem paths to webview-loadable URLs with
  `convertFileSrc` (the asset protocol is enabled and scoped to `$APPDATA/**`).
- **In a plain browser** (`pnpm dev`), the app intentionally does not provide media
  operations. It renders a desktop-runtime-required state so browser previews never
  imply that placeholder media, recording, export, or persistence paths are real.

## Data at rest

All state lives under the Tauri `app_data_dir` (identifier `com.momvideostudio.app`):

- `media_bank.db` — SQLite, WAL mode; `media` and `projects` tables.
- `library/` — copies of imported media and recordings (originals never mutated).
- `thumbnails/` — generated JPGs (video/image) and waveform PNGs (audio).

`lib.rs` creates the folders, opens the DB, locates ffmpeg, and stores all of it in
`AppState` at startup. See [Data model & project format](./05-data-model-and-project-format.md).

## Security surface

- `src-tauri/capabilities/default.json` — the single capability for window `main`:
  `core:default`, `core:event:default`, `core:webview:default`, `dialog:default`,
  `dialog:allow-open`, `dialog:allow-save`, `dialog:allow-message`.
- `tauri.conf.json` enables the asset protocol with scope `["$APPDATA/**"]` — the
  webview can only load media from the app's own data dir.
- `src-tauri/Info.plist` declares `NSMicrophoneUsageDescription` for macOS mic access.

Next: [Development setup](./02-development-setup.md) ·
[Rust backend](./03-rust-backend.md) · [Frontend](./04-frontend.md)
