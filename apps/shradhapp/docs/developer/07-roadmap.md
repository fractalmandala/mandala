---
title: Roadmap
description: Phase 2 timeline editor and Phase 3 AI layer, and the design seeds Phase 1 already planted for them.
category: developer
id: 7
---

# Roadmap

The project follows the 3-phase plan in `plan.md`. **Phase 1 — "Assembler" is what
exists today** and is fully described in these docs. This page summarizes what comes
next and, more importantly, the constraints Phase 1 already imposes on it.

## Phase 2 — "Real Editor"

A full timeline, scoped to the user's actual workflow (explicitly *not* CapCut):

- Multi-track drag-and-drop timeline: edge-trim, split at playhead, snapping, zoom.
- Real preview via low-res proxies generated with FFmpeg for smooth scrubbing.
- Audio upgrades: waveforms in the timeline, volume envelopes, fades, better
  denoise, per-clip gain.
- Titles and simple transitions — *only if the user asks*.
- Project conveniences: reusing old sequences; export queue plus format options.

**Called out in the plan as the hardest part:** compiling the timeline into an
FFmpeg render pipeline (filtergraph or segment-concat). Phase 1's export
(`media_engine::export`) is the proof of concept for the segment-concat approach —
normalize per segment → concat → audio finishing — and the natural starting point.

**Deferred-from-Phase-1 items that land here** (from the README): the visual
timeline with edge-trim/split/snapping/proxies, whole-sequence preview (Phase 1
previews individual trimmed clips only), waveform editing, transitions, titles,
export queue, and bundled per-platform ffmpeg in installers.

## Phase 3 — "AI Studio"

Make the app fully all-in-one; the user never leaves it:

- Settings for the user's own API keys, stored in the OS keychain,
  provider-agnostic. Network access is used **only** for these opt-in AI APIs —
  the app stays local-first (a locked decision).
- An AI chat sidebar that acts on the timeline **via the same command stack as the
  UI** — the plan's key rule is *"AI layer calls the same typed commands as the UI.
  No parallel code path."*
- Text-to-image / text-to-video via APIs, with results landing straight in the media
  bank.
- Assistive AI: Whisper transcription (with a local option), silence auto-cut,
  auto-captions.

## Design seeds already planted in Phase 1

These exist specifically so Phases 2–3 don't require rewrites — respect them when
extending the code:

1. **Versioned project format.** `ProjectData.version` is `1` and the write path in
   `update_project` forces it. A timeline-capable v2 (tracks, envelopes, transitions)
   gets a clean migration hook instead of a format break. See
   [Data model](./05-data-model-and-project-format.md).
2. **Single typed `media_engine` surface.** All ffmpeg work is already behind typed
   functions on `Ffmpeg` — proxy generation, waveform rendering and denser timeline
   rendering are new functions in that module, not new shell-outs elsewhere. The AI
   layer will drive these same functions through the same commands. See
   [Rust backend](./03-rust-backend.md).
3. **Command-stack undo/redo.** `UndoStack`/`snapshotCommand` in
   `lib/undo.svelte.ts` is an actor-agnostic `Command` interface: the AI sidebar will
   push the same commands the UI pushes, so AI actions are undoable like any edit.
   See [Frontend](./04-frontend.md).
4. **One backend interface.** `Backend` in `src/lib/backend/types.ts` is the only UI
   surface. Phase 3 features should use that same typed command boundary instead of
   adding a parallel browser-only path.

## Locked decisions (from plan.md)

1. Tauri 2 + Svelte; FFmpeg bundled in the installer (she installs nothing).
2. SQLite from day one — the media bank is the backbone.
3. Project format versioned from v1.
4. Local-first: no accounts, no cloud; network only for opt-in AI APIs.
