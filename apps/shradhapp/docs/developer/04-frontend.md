---
title: Frontend
description: Svelte 5 component map, the Tauri Backend abstraction, the media store, the undo command stack, and drag-drop handling.
category: developer
id: 4
---

# Frontend

The frontend is **SvelteKit + Svelte 5 (runes) + TypeScript + Vite 6** under `src/`.
It uses the SvelteKit route-file structure, but remains a single-screen Tauri app:
one root route, one small reactive store and one backend interface.

## Component map

```
src/
  app.html                              SvelteKit HTML template
  app.css                               global styles (warm palette CSS vars)
  routes/
    +layout.svelte                      imports app.css and renders child routes
    +layout.ts                          ssr = false, prerender = true for static Tauri output
    +page.svelte                        shell: header, 3 tabs, desktop-runtime guard
  lib/
    backend/
      types.ts        Backend interface + MediaItem, Clip, ProjectData, ProjectRecord,
                      ExportPreset, ExportProgress, CleanupResult
      tauri.ts        real impl → invoke() + convertFileSrc + plugin-dialog + listen()
      index.ts        Tauri backend export + runtime detection
    components/
      MediaBank.svelte     grid, import (picker + drag-drop), search, kind & tag filters
      MediaDetail.svelte   preview, rename, tag chips, notes, two-step delete
      Recorder.svelte      getUserMedia + MediaRecorder, save, "Clean up" flow
      Assembler.svelte     projects sidebar, clip list + trims, preview, voiceover,
                           undo/redo, autosave, export UI
    stores.svelte.ts       MediaStore (reactive media cache)
    undo.svelte.ts         UndoStack + snapshotCommand
    utils.ts               fmtDur, fmtDate, kindEmoji/kindLabel, sanitizeFileName,
                           timestampName, clone, SVG fallback thumbnails
```

`routes/+page.svelte` holds `tab: 'bank' | 'record' | 'make'` and swaps the three tab
components; on mount it calls `mediaStore.load()` only inside Tauri. When `isTauri`
is false it shows a desktop-runtime-required state, because media operations are
not available in a plain browser.

## The Backend abstraction

`types.ts` defines `interface Backend` — **the only surface components use**. It
groups into: media bank (`listMedia`, `pickImport`, `importDropped`, `renameMedia`,
`deleteMedia`, `setTags`, `setNotes`, `mediaUrl`, `thumbUrl`), voiceover
(`saveRecording`, `cleanupAudio`), projects (`listProjects`, `createProject`,
`updateProject`, `deleteProject`, `duplicateProject`) and export (`pickSavePath`,
`exportProject`, `onExportProgress`, `cancelExport`), plus the `isTauri` flag.

**`tauri.ts`** is a thin, 1:1 proxy:

- commands via `invoke()` from `@tauri-apps/api/core` (camelCase args map to the Rust
  snake_case parameters automatically, e.g. `dataB64` → `data_b64`);
- file pickers via `open`/`save` from `@tauri-apps/plugin-dialog`, with the extension
  filter list `MEDIA_EXTENSIONS` mirroring the Rust `kind_from_ext` table;
- playable URLs via `convertFileSrc(item.path)` (asset protocol, `$APPDATA` scope);
- `saveRecording` converts the `Blob` to base64 with a `FileReader`;
- `onExportProgress` wraps `listen('export-progress', …)` and returns an unlisten fn.

**`index.ts`** exposes the Tauri implementation and detects whether the current
window is running in the desktop runtime:

```ts
export const isTauri = '__TAURI_INTERNALS__' in w || '__TAURI__' in w;
export const backend: Backend = tauriBackend;
```

## Media store

`stores.svelte.ts` exports a singleton `mediaStore` (`items`, `loaded`, `error`,
`load()`, `byId(id)`) built on `$state`. Components call `await mediaStore.load()`
after any mutation (import, rename, cleanup…) — there is no fine-grained sync; the
bank is small and reloads are cheap.

## Undo/redo: command stack

`undo.svelte.ts` implements the classic two-stack pattern with Svelte 5 reactive
arrays (`past`, `future`):

- `Command { label, redo(), undo() }` — the interface Phase 3's AI layer will reuse.
- `UndoStack.execute(cmd)` runs-then-pushes; `record(cmd)` pushes an already-applied
  command; `undo()`/`redo()` pop/push across stacks and return the label; `clear()`;
  getters `canUndo`/`canRedo`.
- `snapshotCommand(label, before, after, apply)` builds a command from deep-cloned
  snapshots (`JSON.parse(JSON.stringify(...))`).

`Assembler.svelte` wraps **every** project mutation in a `mutate(label, fn)` helper:
clone `data` → apply `fn` → clone again → `undo.record(snapshotCommand(...))`.
Opening a project calls `undo.clear()`. This covers add/remove/move clip, trims,
photo length, voiceover change and rename — all undoable.

## Autosave

`Assembler.svelte` autosaves explicitly from the project mutation paths instead of
watching all `data` changes with an `$effect`. `mutate()`, undo and redo each call a
600 ms debounced `scheduleAutosave()`, which snapshots the current project and calls
`backend.updateProject(current.id, snapshot)`, then flashes "✓ Saved" for 1.5 s.
Opening another project clears any pending save timer so stale project data is never
written after selection changes. Export additionally flushes `updateProject` first so
the exported JSON matches the stored one.

## Recorder specifics

`Recorder.svelte` uses `getUserMedia({ audio: true })` + `MediaRecorder` with a mime
preference list `['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg']`
(first supported wins; `extFromMime` maps to webm/m4a/ogg). Chunks are collected on a
500 ms timeslice; stopping resolves a single `Blob` that is sent to
`backend.saveRecording` with a `timestampName('Voiceover')` filename. The cleanup
button calls `backend.cleanupAudio(rawItem.id)` and renders the
`{ before_duration, after_duration }` comparison. A mic-denied path sets a friendly
error; streams/timers are released in `onDestroy`.

## Assembler specifics

- **Trim model:** a `Clip` is `{ media_id, trim_start, trim_end }` (seconds). For
  images, `trim_start` is always 0 and `trim_end` is the still duration (default
  `IMAGE_DEFAULT_LEN = 3`, clamped 0.5–600 s; media trims clamp to the probed
  duration with a 0.1 s minimum segment). Values round to 0.1 s.
- **Trimmed preview:** per-row ▶ opens a `<video>`; the metadata/timeupdate event
  target is used to seek to `trim_start` and pause at `trim_end`.
  Imported user clips do not have caption sidecars in the current data model, so
  the preview-only `<video>` includes a targeted `svelte-ignore
  a11y_media_has_caption` comment until captions become a first-class media asset.
- **Total duration:** derived sum of `trim_end - trim_start` over clips.
- **Export UI:** `presetInfo` maps `'mp4-full' | 'mp4-small' | 'mov'` to
  labels/descriptions/extensions; progress arrives via `onExportProgress` filtered by
  a per-export `crypto.randomUUID()`; cancel calls `backend.cancelExport(exportId)`;
  errors containing "cancel" render as "Export cancelled."

`MediaDetail.svelte` uses the same caption-warning treatment for its video detail
preview. If captions become a first-class media asset later, replace both ignores with
real `<track kind="captions">` entries sourced from the stored sidecars.

## Drag and drop

`MediaBank.svelte` uses `getCurrentWebview().onDragDropEvent(...)` from
`@tauri-apps/api/webview`. Payloads `over`/`leave` toggle the dashed overlay, and
`drop` carries absolute `paths` which go straight to `backend.importDropped(paths)`
→ `import_files`. Plain browser drops are ignored because the real import pipeline
requires the desktop runtime.

Related: [Architecture overview](./01-architecture-overview.md) ·
[Rust backend](./03-rust-backend.md) · [Data model](./05-data-model-and-project-format.md)
