# Shradhapp

A friendly, local-first desktop app for assembling personal videos: a permanent
media bank, a one-click voiceover recorder with automatic sound cleanup, a
simple clip assembler, and mom-proof export presets. No jargon, no accounts,
no cloud.

**Stack:** Tauri 2 · SvelteKit/Svelte 5 + Vite + TypeScript · SQLite
(rusqlite, bundled) · FFmpeg (found on PATH or platform-typical locations) ·
Rust backend.

## Running it

```bash
pnpm install

# Real desktop app (macOS now; Windows via the same codebase)
pnpm tauri dev

# SvelteKit browser shell only; real media features require Tauri
pnpm dev        # → http://localhost:1420
```

`pnpm dev` is a plain `vite` invocation, so `--host` / `--port` CLI args
pass straight through (e.g. `pnpm dev --port 7100`).

**Requires:** Node 18+, Rust/Cargo, and ffmpeg + ffprobe on your PATH
(`brew install ffmpeg` on macOS; on Windows install ffmpeg and make sure it's
on PATH or in `C:\ffmpeg\bin`). If ffmpeg is missing, the app still opens and
shows a friendly error on actions that need it.

## Building installers

```bash
pnpm tauri build
```

Produces a `.app` + `.dmg` on macOS, and an `.msi` / NSIS installer on Windows
(build on Windows for the Windows targets). Bundling ffmpeg per-platform into
the installers is planned for a later phase — for now it must be installed on
the machine.

## Architecture map

```
src/                              Svelte 5 + TypeScript frontend
  app.html                        SvelteKit HTML template
  routes/
    +layout.svelte                Global CSS + root layout render
    +layout.ts                    Static/client-only page options for Tauri
    +page.svelte                  Shell with 3 tabs: Media Bank / Record Voiceover / Make a Video
  lib/components/
    MediaBank.svelte              Grid, import (picker + drag-drop), search, kind/tag filters
    MediaDetail.svelte            Preview, rename, tags, notes, delete
    Recorder.svelte               getUserMedia + MediaRecorder, "Clean up" button, before/after
    Assembler.svelte              Projects, clip list + trims, voiceover pick, undo/redo, export
  lib/backend/
    types.ts                    Backend interface — the ONLY surface the UI uses
    tauri.ts                    Real implementation → typed Tauri commands
    index.ts                    Uses the Tauri command backend; detects desktop runtime
  lib/undo.svelte.ts              Command-stack undo/redo (snapshot commands; Phase 3 reuses it)
  lib/stores.svelte.ts            Reactive media store

src-tauri/
  src/lib.rs                      App setup: app-data dirs, DB open, ffmpeg locate, command registry
  src/db.rs                       SQLite (rusqlite): media + projects tables, CRUD
  src/commands.rs                 Typed Tauri commands — import, thumbs, cleanup, projects,
                                  export (progress via "export-progress" events), cancel
  src/media_engine.rs             ★ The ONLY module that shells out to ffmpeg/ffprobe.
                                  probe / video_thumbnail / image_thumbnail / waveform /
                                  cleanup_audio / export (segment-normalise → concat →
                                  voiceover mix). Frontend never builds command lines;
                                  Phase 3 AI drives these same functions.
  tests/media_engine.rs           Integration test: generates fixtures with real ffmpeg,
                                  runs thumbnails, waveform, cleanup, concat-export, MOV,
                                  and the cancellation path; asserts ffprobe durations.
  tauri.conf.json                 asset protocol scoped to $APPDATA (media previews)
  Info.plist                      macOS microphone usage description
```

Data lives in the app's app-data dir: `media_bank.db`, `library/` (copies —
originals are never mutated), `thumbnails/`.

**Project format (versioned):**

```json
{ "version": 1, "name": "...", "clips": [{ "media_id": "...", "trim_start": 0, "trim_end": 4.2 }],
  "voiceover_media_id": null, "created_at": 0, "updated_at": 0 }
```

For photos, `trim_end - trim_start` is the still-segment length (default 3 s,
adjustable per clip). Projects are stored in SQLite as JSON blobs and autosave
(debounced) on every edit.

**Export presets** (no codec jargon in the UI):

| Button | Canvas | Quality |
| --- | --- | --- |
| MP4 — Full quality (1080p) | 1920×1080 | CRF 18 |
| MP4 — Small (for WhatsApp) | 1280×720 | CRF 28 |
| MOV | 1920×1080 | CRF 18, .mov container |

Pipeline: each clip is trimmed and normalised to the preset canvas
(scale/pad, 30 fps, yuv420p, AAC 44.1 kHz) → segments joined with the concat
demuxer (stream copy, re-encode fallback) → voiceover mixed
(ducked original at 35% when "Keep original sound" is on, or replaced) →
final encode. Progress streams to the UI via Tauri events; cancel kills
ffmpeg.

## Testing

```bash
cd src-tauri && cargo test --test media_engine -- --nocapture
```

## Deferred to Phase 2 / Phase 3

- Full multi-track timeline with edge-trim, split, snapping, proxies
- Whole-sequence preview (Phase 1 previews individual trimmed clips only)
- Waveform editing, volume envelopes, transitions, titles
- Export queue + more formats
- Bundled per-platform ffmpeg in installers
- Phase 3: AI chat sidebar driving the same typed commands + undo stack,
  text-to-media APIs into the bank, Whisper transcription / auto-captions,
  API keys in the OS keychain
