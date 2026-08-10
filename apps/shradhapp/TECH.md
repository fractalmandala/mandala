# Shradhapp — Unified Editor: Technical Spec

## Context

**What's being built:** A local-first desktop video editor by forking [OpenReel Video](https://github.com/Augani/openreel-video) (MIT, ~125k lines TypeScript, React + WebCodecs + WebGPU) and wrapping it with the existing shradhapp Tauri 2 + Rust backend. See `PRODUCT.md` for user-facing behavior.

**Current shradhapp** (commit [`87d293dc1`](https://github.com/user/mandala/tree/87d293dc1/apps/shradhapp)):
- Rust backend ([`src-tauri/src/lib.rs`](src-tauri/src/lib.rs)): SQLite project persistence (`db.rs`), FFmpeg media processing (`media_engine.rs`), typed Tauri commands ([`commands.rs`](src-tauri/src/commands.rs))
- SvelteKit frontend ([`src/`](src/)): media bank, recorder, assembler, vendored ref-editor timeline
- Key backend files: [`src/lib/backend/types.ts`](src/lib/backend/types.ts) (192-line `Backend` interface), [`src/lib/backend/tauri.ts`](src/lib/backend/tauri.ts) (Tauri command bindings)

**OpenReel Video** ([`Augani/openreel-video@main`](https://github.com/Augani/openreel-video)):
- `packages/core/src/` (~59k lines, framework-agnostic engines): 20+ modules — `audio/` (noise-reduction.ts, beat-detection, effects engine, FFT, volume automation), `video/` (WebGPU rendering), `export/` (WebCodecs encoder + compression), `storage/` (IndexedDB project serializer), `timeline/`, `effects/`, `graphics/`, `text/`, `animation/`, `media/`, `playback/`, `wasm/`
- `apps/web/src/` (~66k lines, React frontend): `components/editor/` (timeline, preview, inspector), `stores/` (Zustand state), `services/` (auto-save, shortcuts, screen recording), `desktop/` (desktop app shell)
- Stack: React 18, Zustand, Mediabunny (media demux/mux), WebCodecs, WebGPU, THREE.js, TailwindCSS
- Build: pnpm monorepo, Vite, Node ≥18, WASM build step
- Storage: IndexedDB with project serializer (`storage-engine.ts`, `project-serializer.ts`)
- Export: WebCodecs with dual backends (`webcodecs-backend.ts`, `encoder-backend.ts`), compression pipeline, worker-based

**Why fork OpenReel:** It already implements every feature in `PRODUCT.md` (multi-track timeline, audio effects with noise reduction/EQ/gate, waveform visualization, undo/redo, keyframe animations, transitions, color grading, export to MP4/WebM/ProRes) and is MIT-licensed. Building equivalent functionality from scratch would take months.

## Proposed Changes

### 1. Repository Structure — Fork as Tauri App

Fork OpenReel Video into `apps/shradhapp/`. The existing SvelteKit frontend is **replaced** by OpenReel's React + Vite frontend. The existing Rust backend (`src-tauri/`) is **kept and extended**.

```
apps/shradhapp/
├── src-tauri/              # KEEP: existing Rust backend
│   ├── src/
│   │   ├── lib.rs          # Tauri setup + command registration
│   │   ├── commands.rs     # Tauri command handlers
│   │   ├── db.rs           # SQLite project CRUD
│   │   └── media_engine.rs # FFmpeg orchestration
│   └── Cargo.toml
├── packages/
│   └── core/               # FROM OPENREEL: framework-agnostic engines
│       └── src/
│           ├── audio/       # noise-reduction, effects, beat detection
│           ├── export/      # WebCodecs encoder
│           ├── storage/     # → REPLACED with platform adapter
│           ├── timeline/
│           ├── video/       # WebGPU rendering
│           └── ...          # all other engine modules
├── apps/
│   └── web/                # FROM OPENREEL: React frontend
│       └── src/
│           ├── components/  # editor UI (timeline, preview, inspector)
│           ├── stores/      # Zustand state management
│           ├── services/    # auto-save, shortcuts
│           ├── desktop/     # desktop shell → EXTENDED for Tauri
│           └── platform/    # NEW: Tauri platform bridge
├── package.json            # OpenReel's root package.json (pnpm monorepo)
├── pnpm-workspace.yaml
└── vite.config.ts          # OpenReel's Vite config
```

The existing `src/` directory (SvelteKit frontend) is **archived** to `src-archive/` for reference. Components like `MediaBank.svelte`, `Recorder.svelte`, `AudioEditor.svelte` serve as behavioral reference for the React replacements.

**Tauri config changes** (`src-tauri/tauri.conf.json`):
- `build.distDir` points to OpenReel's Vite build output (`apps/web/dist/`)
- `build.devPath` points to Vite dev server (`http://localhost:5173`)
- `build.beforeBuildCommand` runs `pnpm build` (OpenReel's build)
- `build.beforeDevCommand` runs `pnpm dev` (OpenReel's dev server)

### 2. Platform Bridge — Tauri ↔ OpenReel

New module `apps/web/src/platform/` provides the bridge between OpenReel's engine calls and Tauri's native capabilities. This is the **only** new code that's shradhapp-specific.

```typescript
// apps/web/src/platform/tauri-bridge.ts
export const platform = {
  isDesktop: boolean,          // true when window.__TAURI__ exists

  // File system
  pickFiles(filters): Promise<string[]>,
  pickSavePath(defaultName, ext): Promise<string | null>,
  readFile(path): Promise<ArrayBuffer>,
  fileUrl(path): string,       // convertFileSrc wrapper

  // Project persistence (SQLite via Rust backend)
  listProjects(): Promise<ProjectRecord[]>,
  createProject(name): Promise<ProjectRecord>,
  updateProject(id, data): Promise<void>,
  deleteProject(id): Promise<void>,
  duplicateProject(id): Promise<ProjectRecord>,

  // Media management
  importFiles(paths): Promise<MediaItem[]>,
  listMedia(): Promise<MediaItem[]>,
  deleteMedia(id): Promise<void>,

  // Audio recording
  saveRecording(blob, ext, name): Promise<MediaItem>,

  // Audio processing (Rust/FFmpeg — heavier operations)
  cleanupAudio(id): Promise<CleanupResult>,
  repairAudioTicks(id): Promise<CleanupResult>,
  detectSilenceRegions(id): Promise<SilenceRegion[]>,
  silenceAudioRegion(id, start, end): Promise<CleanupResult>,
  extractAudioRegion(id, start, end): Promise<CleanupResult>,
  cutAudioRegion(id, start, end): Promise<CleanupResult>,
  normalizeAudio(id): Promise<CleanupResult>,

  // Thumbnails
  generateThumbnail(path, time): Promise<string>,
}
```

OpenReel's engine modules call `platform.*` instead of browser APIs directly. In browser mode (no Tauri), the bridge falls back to IndexedDB + File API + MediaRecorder. In desktop mode, it routes through `window.__TAURI__.invoke()`.

### 3. Storage Adapter — IndexedDB → SQLite

OpenReel's `packages/core/src/storage/storage-engine.ts` currently uses IndexedDB. Replace with a **platform-aware adapter**:

```
StorageEngine (interface)
├── IndexedDBStorageEngine   # OpenReel's existing (browser mode)
└── TauriStorageEngine       # NEW: routes to Rust SQLite (desktop mode)
```

The `TauriStorageEngine` implements the same interface but serializes project data to the existing `ProjectDataAny` JSON schema and persists via `platform.updateProject()`. This reuses shradhapp's existing `db.rs` SQLite layer unchanged.

**Project schema bridge:** OpenReel's internal `TimelineProject` type serializes to JSON for storage. The adapter stores this JSON blob in the `data` column of the existing `projects` SQLite table. No schema migration needed — the `data` column is already a JSON text field.

### 4. Media Import & Library

OpenReel already has an asset bin panel (`components/editor/`). Extend it with Tauri file picker integration:

- **Import button** calls `platform.pickFiles()` → `platform.importFiles()` → refreshes media list
- **Drag-and-drop** uses Tauri's `webview-window` drag-drop event → `platform.importFiles()`
- **Media library panel**: A dedicated left-side panel (new React component) with search, kind filter, and detail card. Replaces/supplements OpenReel's built-in asset bin for the shradhapp workflow.

The media library component references the behavior of the archived [`MediaBank.svelte`](src-archive/lib/components/MediaBank.svelte) — search, filter, context menu, detail card with add-to-timeline and clean-audio actions.

### 5. Audio Recording

New React component: `RecordPanel`. References the archived [`Recorder.svelte`](src-archive/lib/components/Recorder.svelte).

```
RecordPanel
├── Record button (start/stop)
├── Elapsed timer
├── Level meter (Web Audio API analyser node)
├── Post-recording actions (Clean up, Repair clicks)
└── Recording list (audio items from media bank)
```

Implementation:
- `MediaRecorder` API captures audio (same as existing Recorder.svelte)
- On stop: `platform.saveRecording(blob, ext, name)` → Rust `save_recording` command
- Auto-cleanup: if `settings.audio.defaultRepairMode === 'autoAfterRecording'`, calls `platform.repairAudioTicks()`
- Background recording: `MediaRecorder` runs in the main thread; tab switch doesn't stop it

### 6. Audio Cleanup Integration

OpenReel's `packages/core/src/audio/` already provides:
- `noise-reduction.ts` — 3-pass noise removal
- `audio-effects-engine.ts` — EQ, compressor, reverb, delay, chorus, flanger, distortion
- `beat-detection-engine.ts` — beat markers
- `clip-fade-envelope.ts` — fade in/out
- `volume-automation.ts` — per-clip volume
- `fft.ts` — FFT for waveform visualization

For **heavier operations** (silence detection, tick repair, normalize) that benefit from FFmpeg's processing speed, the cleanup panel calls `platform.cleanupAudio()` / `platform.repairAudioTicks()` etc. — these route to the existing Rust `media_engine.rs` FFmpeg commands.

For **real-time preview** of noise reduction/EQ/gate during playback, OpenReel's Web Audio API effects worklets handle it in the browser (no Rust roundtrip needed).

The cleanup UI is a new panel: waveform canvas (using OpenReel's existing FFT + waveform rendering), playback controls, region selection, and a toolbar of cleanup operation buttons. References the archived [`AudioEditor.svelte`](src-archive/lib/components/AudioEditor.svelte).

**Save flow:** After a cleanup operation, the user chooses "Replace original" or "Save as new" via a dialog. "Save as new" creates a new media item via `platform.importFiles()` with the processed file path. "Replace original" overwrites the source file.

### 7. Undo/Redo

OpenReel already implements unlimited undo/redo via an action-based editing model — every edit is an undoable action. The architecture document says: "Action-based editing — Every edit is an undoable action."

For shradhapp-specific operations (media delete, project switch, recording save), new undoable actions are registered:
- `DeleteMediaAction` — stores the deleted item for undo (re-import)
- `SwitchProjectAction` — stores previous project for undo
- `AudioCleanupAction` — stores the pre-cleanup file reference for undo

`Cmd+Z` / `Cmd+Shift+Z` are already wired in OpenReel's keyboard shortcut service.

### 8. Header Bar & Project Switcher

New React component: `ShradhappHeader`. Renders above the OpenReel editor.

```
ShradhappHeader
├── App title ("Shradhapp")
├── Project dropdown (name, list, create, rename, delete)
├── Panel toggle (Library / Record)
├── FPS selector
├── Aspect ratio buttons
├── Spacer
└── Export button
```

The header replaces OpenReel's built-in toolbar. The editor's toolbar section is suppressed (same pattern as the current `RealEditor.svelte` snippet override, but in React).

**Project dropdown** fetches from `platform.listProjects()` on open. Switching projects:
1. Flush current project auto-save via `platform.updateProject()`
2. Set active project in Zustand store
3. Editor remounts with new project data

### 9. Export Pipeline

Two export paths available:

| Path | When | How |
|---|---|---|
| **WebCodecs** (default) | All formats in-browser | OpenReel's existing `export-engine.ts` → `webcodecs-backend.ts` |
| **FFmpeg** (future) | When faster or ProRes needed | Serialize export plan → `platform.exportViaFFmpeg()` → Rust `media_engine.rs` |

For MVP, WebCodecs export is sufficient. It supports MP4 (H.264/H.265), WebM (VP8/VP9/AV1), ProRes, up to 4K@60fps, with progress tracking and cancel. The FFmpeg path can be added later as a performance optimization.

**Save path:** `platform.pickSavePath()` → Tauri `save()` dialog → returns native path → export engine writes to that path (WebCodecs can write to a Blob, then the bridge writes the Blob to disk via Tauri `fs.writeFile()`).

### 10. Audio Workspace — Harmonized Wavacity

Integrate Wavacity (Audacity compiled to WASM, https://wavacity.com) as the third workspace tab while keeping it visually indistinguishable from the Video Editor and Motion Design tabs. The challenge: Wavacity runs in a cross-origin iframe, so we cannot directly restyle it from the parent document. Solution is a three-tier harmonization ladder.

**Tier 1 (MVP) — themed chrome + iframe container.** Build `AudioWorkspaceChrome` (`apps/web/src/desktop/pages/AudioWorkspaceChrome.tsx`), a wrapper component that:

- Renders a 40px top chrome strip (`bg-bg-1`, `border-b border-border`) with: workspace label "Audio" in `text-fg-2`, a status pill (`role="status"`, `aria-live="polite"`) reflecting one of `Ready` | `Processing…` | `Unsaved changes`, an **Import to Video Editor** button (ToolcraftButton, secondary, emerald Download icon), and a **Save to Disk** button (ToolcraftButton, secondary, Save icon).
- Renders the Wavacity iframe below the chrome, filling the remaining height edge-to-edge (no border, no gap).
- Sets the iframe's `allow` attribute to `"clipboard-read; clipboard-write; microphone"` and adds `title="Wavacity audio editor"` / `aria-label="Audio workspace"` / `role="application"`.
- Catches iframe load failures via `onError` + periodic readiness probe; on failure, swaps the iframe for an `ErrorPanel` (matches the editor's `ErrorBoundary` style) with a **Retry** button.

**Tier 2 (follow-up) — CSS injection into the iframe.** Two paths, picked at build time:

- **Path A — local Wavacity build.** Fork `wavacity/wavacity` under `apps/shradhapp/wavacity/` and patch its `theme.css` to consume the editor's token set. Build as a static asset served by Tauri at `asset://localhost/wavacity/index.html`, which makes it same-origin and allows direct stylesheet injection. This is the preferred path for full theme control.
- **Path B — postMessage theming bridge.** If we stick with `wavacity.com`, open a PR on Wavacity to add a `theme-applied` message listener. Parent sends the editor's token map on load; Wavacity writes them to `:root` CSS variables and re-applies styles. Until that PR lands, fall back to Path A or ship Tier 1 only.

**Tier 3 (follow-up) — Wavacity fork with themeable API.** Deep integration: add an `OpenReelThemePlugin` inside the Wavacity fork that reads the editor's token map on startup and exposes a "Save to Video Editor" command that writes the mixdown to a location chosen by the parent. This lets the chrome strip's **Import to Video Editor** button drive the export directly rather than relying on the download interception path.

**PostMessage protocol (tiers 2/3).** Bidirectional contract:

| Direction | Type | Payload | Purpose |
|---|---|---|---|
| Parent → Wavacity | `setTheme` | `{ tokens: Record<string, string> }` | Push the editor's current token map (light or dark). |
| Parent → Wavacity | `requestMixdown` | `{ format: "wav" \| "mp3" \| "flac", path?: string }` | Trigger File → Export with a pre-chosen destination. |
| Wavacity → Parent | `status` | `{ kind: "ready" \| "dirty" \| "clean" \| "processing" }` | Drives the chrome's status pill. |
| Wavacity → Parent | `trackCount` | `{ count: number }` | Enables/disables the Import button. |
| Wavacity → Parent | `mixdownDone` | `{ path: string }` | Chrome forwards to `useWavacityAutoImport`. |

**Themed chrome strip.** CSS for `AudioWorkspaceChrome` lives in `desktop/theme/audio-workspace.css` and reuses existing tokens:

```css
.audio-workspace-chrome {
  height: 40px;
  background: var(--bg-1);
  border-bottom: 1px solid var(--border);
  color: var(--fg-2);
  font-family: "Inter", system-ui;
  font-size: 13px;
}
.audio-workspace-status {
  padding: 2px 10px;
  border-radius: 9px;
  background: var(--bg-3);
  color: var(--fg-3);
  font-size: 11px;
}
.audio-workspace-status[data-state="dirty"] { color: var(--accent); }
.audio-workspace-status[data-state="processing"] { color: var(--fg); }
```

**Token extension for Wavacity internals (Tier 2).** Add an audio-specific palette to `desktop-theme.css` so injected styles can stay on-palette without hard-coding:

```css
.openreel-desktop {
  --audio-track: oklch(0.22 0.02 195);      /* clip-audio track tint */
  --audio-waveform: oklch(0.7 0.15 162);    /* waveform fill */
  --audio-selection: oklch(0.7 0.15 162 / 0.35);
  --audio-playhead: var(--accent);
}
```

**Export interception (current MVP path).** Reuse the existing `on_download` handler in `lib.rs` (see §9). The handler already routes downloads to `<app-data>/imports/` and emits `shradhapp:download-finished`. The `useWavacityAutoImport` hook (already wired in `DesktopApp.tsx`) reads the file via `fs.readFileBytes`, imports it via `useProjectStore.importMedia`, toasts, and switches back to the Video Editor tab. No new Rust commands required for Tier 1.

**Manual "Save to Disk" button.** Calls `window.openreel.fs.showSaveDialog({ defaultName: "mixdown.wav" })`, then `postMessage({ type: "requestMixdown", format: "wav", path: <chosenPath> })` to Wavacity. When Wavacity acknowledges with `mixdownDone`, the file is already at the chosen location. For Tier 1 (no postMessage yet), the button is a no-op and shows a tooltip "Available once Wavacity is rebuilt locally (Tier 2)".

**Keyboard shortcuts.** Add three new bindings to the global shortcut layer (`apps/web/src/services/keyboard-shortcuts.ts` or equivalent):

- `Cmd+1` → `setDesktopPage("edit")`
- `Cmd+2` → `setDesktopPage("motion")`
- `Cmd+3` → `setDesktopPage("audio")`

These are honored by the Tauri menu layer even when focus is inside the iframe.

**Error boundary.** `AudioPage` is wrapped by `AudioWorkspaceErrorBoundary`. On iframe `onerror` or on load timeout (> 8s without a `status: ready` postMessage), show the editor's standard error panel with a Retry button. The error does not propagate to the editor — Video Editor and Motion Design tabs keep working.

**Offline fallback.** If Wavacity fails to load, cache the last-successful `index.html` + assets under `<app-data>/wavacity-cache/` (Tauri asset protocol) so the audio tab still works offline. Add a Rust command `or_audio_cache_status` returning `{ cached: bool, version: string }` and wire the chrome to show a small "Offline" pill when applicable.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| OpenReel's React UI has bugs or missing features | Blocks shradhapp UX | Fork gives full control; can fix directly. Track upstream for patches. |
| WebCodecs/WebGPU support in Tauri's webview | Rendering or export may fail | Tauri uses system WebView (WebKit on macOS, WebView2 on Windows). WebKit 16.4+ supports WebCodecs. Add WebCodecs feature detection with graceful fallback. |
| OpenReel's IndexedDB storage is deeply coupled | Storage adapter may be incomplete | The storage module is isolated (`packages/core/src/storage/`). Replace at the interface level. Keep IndexedDB engine as browser fallback. |
| OpenReel's build is complex (WASM, Mediabunny) | Build integration with Tauri may be tricky | Start with `pnpm build` producing static output. Tauri serves static files. WASM is loaded by Mediabunny at runtime, no special Tauri config needed. |
| 125k lines of unfamiliar code | Slow onboarding, risk of breaking things | Focus changes on the platform bridge layer only. Don't modify OpenReel's core engines unless necessary. Use the action system for extensions. |
| Upstream OpenReel changes diverge from fork | Merge conflicts over time | Keep modifications minimal and isolated to the platform layer. Rebase on upstream periodically. |
| Wavacity.com is unavailable / blocked / changes DOM | Audio workspace can't load or theming breaks | Tier 2 Path A (local Wavacity fork as Tauri asset) makes the app independent of the hosted site. Keep a cached offline copy under `<app-data>/wavacity-cache/`. |
| Cross-origin iframe blocks CSS injection | Tier 2 theming can't reach inside Wavacity | Switch to Path A (same-origin asset://localhost); fall back to Tier 1 chrome-only while Path A is built. |
| PostMessage contract drift between editor and Wavacity fork | Status pill or import flow breaks | Pin the contract in a TypeScript shared type (`AudioBridgeMessage`) and run a small integration test in both codebases on CI. |

## Testing and Validation

Reference `PRODUCT.md` numbered behavior invariants:

- **§1 (Shell):** Manual verification — header renders, left panel toggles, editor fills space, collapsible panel works. Automated: component test for `ShradhappHeader` rendering.
- **§2 (Projects):** Integration test — create, switch, rename, delete projects. Verify SQLite persistence. Verify auto-open most recent on launch.
- **§3 (Media Library):** Integration test — import via file picker, drag-drop, search, filter, delete, context menu. Verify media store refresh.
- **§4 (Recording):** Manual test — record, stop, save, auto-cleanup. Verify MediaRecorder lifecycle. Verify background recording continues across tab switches.
- **§5 (Audio Cleanup):** Integration test — each cleanup operation (noise reduction, silence removal, tick repair, normalize, region operations). Verify waveform refresh. Verify replace-vs-save-as-new dialog.
- **§6 (Timeline + Export):** Existing OpenReel test suite covers timeline operations. Export test: export a simple project to MP4, verify file is playable.
- **§7 (Undo/Redo):** Integration test — perform operations, undo, verify state restored. Redo, verify state re-applied.
- **§8 (State Transitions):** E2E test — launch app, import media, record audio, clean audio, add to timeline, export.
- **§9 (Audio Workspace):**
  - Visual test — screenshot the Audio tab and diff against a golden image. Verify chrome strip, tab label, status pill, and buttons match the editor's token set.
  - Functional test — click **Import to Video Editor** while a Wavacity project has tracks → verify the audio file lands in the open project's media library and the app switches to the Video Editor tab. Verify the toast appears.
  - Functional test — click **Import to Video Editor** with no open project → verify the prompt to open/create a project.
  - Load failure test — block `wavacity.com` via /etc/hosts, load the Audio tab → verify the error panel appears with a Retry button, and other tabs still work.
  - Keyboard test — `Cmd+1/2/3` cycles the tabs; while focus is inside the iframe, `Cmd+N` still triggers the editor's new-project flow.
  - Accessibility test — axe on the Audio tab reports no violations on the chrome; iframe has correct title/aria-label/role; status pill announces state changes via aria-live.

## Follow-ups

1. **FFmpeg export path** — replace WebCodecs with Rust FFmpeg for faster desktop export and broader codec support (ProRes, DNxHR). Requires serializing OpenReel's export plan to the existing `ExportPlan` JSON format.
2. **Settings panel** — migrate shradhapp's `SettingsPanel.svelte` behavior to React. Appearance, workflow, audio, export, and advanced settings.
3. **Screen recording** — OpenReel already has it; wire to Tauri's desktop capture APIs for system audio + screen.
4. **AI-assisted editing** — OpenReel has an AI integration module. Wire to local or remote LLM for "edit by chatting."
5. **Plugin system** — OpenReel's rewrite mentions plugin architecture. Build shradhapp-specific extensions as plugins.
6. **Audio Workspace Tier 2** — fork Wavacity locally (`apps/shradhapp/wavacity/`), serve via Tauri asset protocol, inject the editor's token map as a CSS file. This replaces `wavacity.com` and removes the cross-origin constraint.
7. **Audio Workspace Tier 3** — extend the Wavacity fork with an `OpenReelThemePlugin` and a "Save to Video Editor" command so the chrome's Import button drives the export directly (no download interception).
8. **Offline Wavacity cache** — Tauri asset-protocol cache of the last-known-good Wavacity build so the Audio tab works without network.
