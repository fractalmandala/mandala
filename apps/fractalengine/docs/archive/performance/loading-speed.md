---
id: perf-loading-speed
title: Loading Speed Optimization
type: archive
tags: [performance, history]
updated: 2026-07-15
---

> **Historical performance audit — kept as reference.**

## Investigation Scope

**Requested:** "Document the app loading — what all functions and scripts run at app startup, what runs with lazy load, how many seconds does each add to the app load time. Also check differences when load is to TemplateGallery view state, when ClassicIdeLayout loads at app load, when Notes layout loads at app load."

**In scope:**
- Tauri binary launch (`src-tauri/src/main.rs`, `src-tauri/src/lib.rs`, `tauri.conf.json`).
- SvelteKit bootstrap (`src/routes/+layout.svelte`, `+layout.ts`, `+page.svelte`).
- Global state module-body work on first import (`ide.svelte.ts`, `canvas.svelte.ts`, `notes.svelte.ts`, `design.svelte.ts`, `globalstores.ts`).
- IPC gateway bootstrap (`src/lib/ipc.ts`, `src/lib/ipc-mock.ts`).
- SASS aggregation and `@font-face` declarations (`src/lib/styles/index.sass`, `_font-imports.sass`).
- The three startup layout shapes the user asked about:
  - **Gallery boot** — `canvas.showGallery === true` on first paint, no template applied.
  - **Classic IDE boot** — `canvas.activeTemplateId === 'code'` immediately after `loadLayout()`.
  - **Notes boot** — `canvas.activeTemplateId === 'notes'` immediately after `loadLayout()`.
- Reactivity waves for each shape: the `onMount`-driven `ideState.initWorkspace()` chain.

**Out of scope:**
- AI model load (separate sidecar — `bin/llama.cpp/bin/llama-cli`, `bin/mlx/python/bin/python3`).
- Network requests from the in-app browser.
- Devtools / Vite HMR overhead (this report covers the production `vite build` shape under Tauri).
- Browser-mode mock streaming (`src/lib/ipc-mock.ts`'s `runLocalModel`/`runApiModel` timers).

**Methodology:** static trace of the launch path from Rust entry to first interactive layout. No live measurements taken in this pass — every wall-clock number is **inferred** from code structure (module-body work, IPC call count, file I/O shape) and labelled accordingly. Where the build artifact is on disk (`build/_app/immutable/`), the chunk-size numbers are measured.

**Known unknowns:**
- Real wall-clock time from app icon click to first interactive frame (no benchmark harness run here).
- Whether the user has previously opened the app (cold vs warm localStorage / Tauri sidecar caches).
- Browser-mode vs Tauri-mode variance in `index.html` parsing on first paint.
- GPU availability impact on canvas grid-pattern paint (`_canvas.sass` `radial-gradient`).
- Per-machine first-run cost for the llama.cpp / MLX binaries in the bundle (resources listed but not executed at startup — they spawn lazily on first AI invocation).

---

## Rust Launch Path

Tauri binary → SvelteKit webview takes **one** discrete IPC handoff at the end. Everything before the webview paints is Rust.

### Phase R1 — `fractalengine_lib::run()` entry

- [src-tauri/src/main.rs#L1-L6](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/main.rs#L1-L6): `fn main()` is a one-liner that delegates to the library. The only side effect is the `windows_subsystem = "windows"` cfg for release builds on Windows (no-op on macOS).
- Cost shape: blocking, sub-millisecond.

### Phase R2 — Tauri builder chain

- [src-tauri/src/lib.rs#L986-L1006](file:///Users/amrit/fractalengine/src-tauri/src/lib.rs#L986-L1006): `pub fn run()` constructs `tauri::Builder::default()` and chains `.plugin(...)`, `.manage(AiStreamState::default())`, `.setup(...)`, `.invoke_handler([...25 commands...])`, then `.run(...)`.
- Plugins loaded: [`tauri-plugin-window-state`](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/Cargo.toml#L22-L24). This plugin reads/writes window geometry to disk on launch to restore position.
- `.manage(AiStreamState::default())` initializes two atomic fields (one `AtomicU64`, one `Mutex<Option<Child>>`).
- Cost shape: synchronous, plugin init can be a few ms; window-state plugin may touch a config file.
- Inferred cost (Tauri build): ~30–80 ms cold, ~10–20 ms warm.

### Phase R3 — `setup` hook (synchronous, blocking first paint)

- [src-tauri/src/lib.rs#L992-L1006](file:///Users/amrit/fractalengine/src-tauri/src/lib.rs#L992-L1006): constructs the native menu via `create_menu(app)` and registers a `menu-event` listener that emits to the webview.
- [src-tauri/src/lib.rs#L898-L979](file:///Users/amrit/fractalengine/src-tauri/src/lib.rs#L898-L979): `create_menu` builds **5 submenus** (FractalEngine / File / Edit / View / Window / Help), with the Window submenu containing **4 CheckMenuItems** for template selection. Each menu item is an OS-level object allocation.
- The Window submenu also attaches `minimize()` + `maximize()` predefined items.
- The `setup` hook must complete before Tauri opens the webview window.
- Cost shape: synchronous. Inferred cost on macOS: ~20–60 ms (NSMenu construction is non-trivial).

### Phase R4 — Tauri opens webview

- [src-tauri/tauri.conf.json#L1-L46](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/tauri.conf.json#L1-L46):
  - `frontendDist: "../build"` (production) / `devUrl: "http://localhost:5173"` (dev).
  - `beforeDevCommand: "pnpm dev"` (only runs in dev mode).
  - Webview window opens with `width: 1280`, `height: 800`, hidden-title overlay bar.
  - `csp: null` (no content-security-policy gating — relevant if you want to add telemetry later).
  - Bundled resources include `bin/llama.cpp/**/*` and `bin/mlx/**/*` — these are **file copies into the bundle**, not eager loads; they only spawn on first AI invocation.
- [src-tauri/tauri.conf.json#L28-L33](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/tauri.conf.json#L28-L33): `targets: "all"` for the bundle.
- Cost shape: webview spawn itself is ~50–150 ms on macOS (WKWebView init). Bundle copy is build-time, not load-time.

### Phase R5 — Tauri command registry

- 24 commands registered in `tauri::generate_handler!` at [src-tauri/src/lib.rs#L988-L1015](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs#L988-L1015):
  - `list_directory`, `read_file`, `write_file`, `rebuild_docs_index`
  - `select_download_directory`, `run_local_model`, `download_model`, `install_skill`
  - `load_password_database`, `save_password_database`, `open_browser_window`
  - `select_file`, `select_save_file`, `select_open_file`
  - `run_api_model`, `cancel_ai_stream`, `set_active_template_menu`
  - `read_env_providers`
  - Memory module: `open_project_memory`, `append_message`, `list_sessions`, `load_session`, `create_checkpoint`, `restore_checkpoint`
- Cost shape: registration is reflective; the closure deserialization paths are warmed but not invoked at boot.

### Phase R6 — Bundle weight context

- `static/iconset/` contains **2225 SVG files**. The app references a small subset by URL (e.g. `/iconset/folder.svg`); the rest sit in the bundle's static dir and are served on demand. None are preloaded.
- [static/fonts/](file:///Users/amrit/fractals/apps/fractalengine/static/fonts) holds 6 woff2 files (Instrument Sans family). Loaded lazily by `@font-face` with `font-display: swap` ([src/lib/styles/_font-imports.sass#L1-L41](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_font-imports.sass#L1-L41)).
- [build/_app/](file:///Users/amrit/fractalengine/build/_app) is **4.9 MB** of JS+CSS chunks (measured). Largest JS chunk: ~594 KB (`DlpIbxXb.js`). Largest single node bundle: **1.46 MB** (`build/_app/immutable/nodes/2.DaphYO52.js`). Total chunks dir: **3.4 MB across 90+ files**.

---

## Frontend Bootstrap

The SvelteKit app is configured as **SPA** (no SSR, prerendered fallback) — [src/routes/+layout.ts#L1-L2](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+layout.ts#L1-L2): `export const prerender = true; export const ssr = false;`. [svelte.config.js#L1-L23](file:///Users/amrit/fractals/apps/fractalengine/svelte.config.js#L1-L23) confirms `adapter-static` with `fallback: 'app-fallback.html'`. This means the webview loads one entry HTML and the SPA hydrates.

### Phase F1 — `+layout.svelte` global setup

- [src/routes/+layout.svelte#L1-L11](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+layout.svelte#L1-L11): seven top-level imports run at module-body time:
  - `'$lib/styles/index.sass'` — triggers SASS aggregation of **20 component partials** + 6 primitive partials ([src/lib/styles/index.sass#L1-L29](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/index.sass#L1-L29)).
  - `'virtual:fractals-styler.css'` — virtual module injected by `fractals-styler` (a workspace plugin — see [vite.config.ts#L1-L7](file:///Users/amrit/fractals/apps/fractalengine/vite.config.ts#L1-L7)).
  - `$lib/globalstores` — exports `theme` as a Svelte store; reads `localStorage['theme']` at module body ([src/lib/globalstores.ts#L1-L12](file:///Users/amrit/fractals/apps/fractalengine/src/lib/globalstores.ts#L1-L12)). Synchronous I/O.
  - `../lib/state/ide.svelte.ts` — instantiates `IDEState` class. **~30 `$state(...)` declarations**, 4 GgufModel entries, undo/redo stacks initialized empty. The constructor at [src/lib/state/ide.svelte.ts#L324-L335](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L324-L335) calls `addLog()` three times.
  - `../lib/state/canvas.svelte.ts` — instantiates `CanvasStore`. Default state: `showGallery = true` (so first paint shows the gallery overlay unless `loadLayout()` finds tiles).
  - `../lib/data/templates` — exports `TEMPLATES` constant (5 entries, no I/O).
  - `../lib/ipc` — the IPC gateway. Eagerly imports `'@tauri-apps/api/core'` and `'@tauri-apps/api/event'` (Tauri internals). Does **not** import `'@tauri-apps/api/window'` — that one is dynamically imported only inside `toggleWindowMaximize()` and `closeWindow()`.
  - `svelte`'s `onMount`, and `@tauri-apps/api/event`'s `listen`.
- Cost shape: synchronous. SASS aggregation is the largest piece — see Phase F1b.

### Phase F1b — SASS aggregation

- [src/lib/styles/index.sass#L1-L29](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/index.sass#L1-L29) `@use`s 26 partials (6 primitives + 20 component). Measured sizes on disk:
  - `_ai.sass` 15K
  - `_ai-elements.sass` 9.4K
  - `_ai-data.sass` 3.5K
  - `_browser.sass` 5K
  - `_canvas.sass` 604B
  - `_commandpalette.sass` 2.2K
  - `_designblock.sass` 1.4K
  - `_designcanvas.sass` 9.4K
  - `_dock.sass` 2K
  - `_draggable.sass` 1.4K
  - `_editor.sass` 2.8K
  - `_layers.sass` 2.9K
  - `_layout.sass` 4.6K
  - `_minimap.sass` 1.2K
  - `_notes.sass` 15K
  - `_settings.sass` 4.1K
  - `_sidebar.sass` 4.9K
  - `_templategallery.sass` 1.4K
  - `_terminal.sass` 2.2K
  - `_tile.sass` 1.4K
  - Plus `_font-imports.sass` (40 lines, 6 woff2 `@font-face` rules), `_tokens.sass`, `_globals.sass`, `_mixins.sass`, `_primitives.sass`, `_typography.sass`.
- All SASS partials are imported eagerly — none are lazy. Even styles for components the user never opens (e.g. `_designcanvas.sass`, `_settings.sass`) are bundled into the single CSS output.
- [src/lib/styles/_font-imports.sass#L1-L41](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_font-imports.sass#L1-L41): every `@font-face` is `font-display: swap` — text is rendered in a fallback until the woff2 files arrive. **No preload.** Browsers won't even fetch these until layout needs them.

### Phase F2 — `+page.svelte` conditional layout switch (post-R1)

- [src/routes/+page.svelte#L1-L18](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L1-L18): Only `Canvas` is eagerly imported at module-body (it's the spatial canvas fallback, and the cheapest shape). The other five layout components are now behind `{#await import(...)}` blocks:
  - `ClassicIdeLayout` — [line 203](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L203)
  - `NotesLayout` — [line 207](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L207)
  - `DesignLayout` — [line 211](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L211)
  - `TemplateGallery` — [line 312](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L312)
  - `CommandPalette` — [line 299](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L299)
  - `SettingsDialog` — [line 304](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L304)
- The runtime mounts only the branch matching `canvas.activeTemplateId` ([src/routes/+page.svelte#L197-L219](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L197-L219)). Unused layouts are never parsed.
- Cost shape: synchronous only for the active branch + `Canvas` eager import. The TemplateGallery, CommandPalette, and SettingsDialog dynamic imports are deferred until their first toggle.

### Phase F3 — Module-body state initialization (executed once on first import)

All five singletons construct eagerly when their modules are first imported:

| Module | Path | Module-body work | Cost shape |
|---|---|---|---|
| `ideState` | [src/lib/state/ide.svelte.ts#L324-L335](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L324-L335) | ~30 `$state` allocations, 4 GgufModel literal pushes, constructor calls `addLog` 3 times (which mutates `consoleLogs`). | sync, allocates |
| `canvas` | [src/lib/state/canvas.svelte.ts#L257-L280](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/canvas.svelte.ts#L257-L280) | `tiles=[]`, `viewport={x:0,y:0,zoom:1}`, `showGallery=true`, `activeTemplateId=null` | sync, tiny |
| `notes` | [src/lib/state/notes.svelte.ts#L17-L40](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/notes.svelte.ts#L17-L40) | Reads `localStorage['fractalengine:notes']` and parses JSON | sync I/O |
| `design` | [src/lib/state/design.svelte.ts#L17-L30](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/design.svelte.ts#L17-L30) | Reads `localStorage['fractalengine:design']` and parses JSON | sync I/O |
| `theme` (store) | [src/lib/globalstores.ts#L1-L12](file:///Users/amrit/fractals/apps/fractalengine/src/lib/globalstores.ts#L1-L12) | Reads `localStorage['theme']` | sync I/O |

- `notes` and `design` constructors **do** run on first import even when the user is on the `code` template — every state module is imported at boot from `+layout.svelte`/`+page.svelte`.

### Phase F4 — IPC gateway module body

- [src/lib/ipc.ts#L1-L4](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts#L1-L4): imports `invoke` from `@tauri-apps/api/core`, `listen` from `@tauri-apps/api/event`, and the entire `* as mockIpc` from `./ipc-mock`.
- `isTauri()` checks `typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window` — sync feature-detect.
- **No IPC calls fire at boot.** Every `invoke`/`listen` is a function that only fires when called.
- Cost shape: synchronous, low (the `@tauri-apps/api` packages themselves are tiny wrappers).

### Phase F5 — `onMount` in `+layout.svelte`

- [src/routes/+layout.svelte#L38-L73](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+layout.svelte#L38-L73): `onMount` fires once after first paint. Inside:
  1. `ideState.initWorkspace()` — the big one. See Phase W1.
  2. `listen('menu-event', ...)` — registers a Tauri event subscription. This **does** run at boot because the Rust setup hook emits `menu-event` as soon as the user clicks a native menu item; we want the listener alive before the first click.

### Phase F6 — First paint reach

After F5, the webview's first paint is complete. The exact "interactive" point depends on which layout mounted (see Reactivity Waves below) and whether `initWorkspace()` has finished. `initWorkspace()` includes `await loadPasswords()`, an IPC round trip — so the visible shell paints before any of that resolves.

---

## Reactivity Waves

The user's question splits into three concrete shapes. Each one describes a different subset of `+page.svelte`'s branches actually mounting.

### Wave 0 — Shared pre-paint work (all three shapes)

These run **before any layout branch mounts** but **after first paint** (they're `onMount`-driven):

| Step | File / Line | Action | Cost shape |
|---|---|---|---|
| 0.1 | [src/routes/+layout.svelte#L41](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+layout.svelte#L41) | `ideState.initWorkspace()` starts | async, kicks off the chain below |
| 0.2 | [src/lib/state/ide.svelte.ts#L2050](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L2050) | `loadSettings()` — reads ~25 `localStorage` keys (`ide:settings:*`, `ide:settings:key-*`, etc.) | sync I/O |
| 0.3 | [src/lib/state/ide.svelte.ts#L1182-L1192](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1182-L1192) | `loadSavedWorkspaces()` — reads `localStorage['ide:workspaces']` | sync I/O |
| 0.4 | [src/lib/state/ide.svelte.ts#L1022-L1033](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1022-L1033) | `loadSavedVaults()` — reads `localStorage['ide:saved-vaults']` | sync I/O |
| 0.5 | [src/lib/state/ide.svelte.ts#L1546-L1552](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1546-L1552) | `loadModelsCache()` — reads `localStorage['ide:models-download-dir']` | sync I/O |
| 0.6 | [src/lib/state/ide.svelte.ts#L1456-L1502](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1456-L1502) | `initAiListeners()` — calls `onAiChunk/onAiDone/onAiError/onAiUsage/onDownloadProgress/onDownloadDone`, each of which subscribes via Tauri's `listen()` | IPC overhead; ~6 listeners registered |
| 0.7 | [src/lib/state/ide.svelte.ts#L1504-L1556](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1504-L1556) | `initDocsIndexWatcher()` — registers passive `mousemove`/`keydown`/`click`/`scroll`/`wheel` listeners; schedules a `setTimeout(maybeRebuild, 5*60*1000)` then `setInterval` every 10 min | sync, free at boot; rebuild is lazy/idle |
| 0.8 | [src/lib/state/ide.svelte.ts#L558](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L558) | `await loadPasswords()` — calls `load_password_database` Tauri command (or the mock's `loadPasswordDatabase`); reads & JSON-parses up to ~tens-of-KB of password entries | async IPC I/O |
| 0.9 | [src/lib/state/ide.svelte.ts#L1035-L1072](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L1035-L1072) | `await restoreCurrentVault()` — reads `localStorage['ide:current-vault']`; if empty calls `restoreVaultTreeState()` (`localStorage['ide:vault-tree-state']`) | sync I/O |
| 0.10 | [src/lib/state/ide.svelte.ts#L562-L583](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L562-L583) | `restoreWorkspaceContext()` reads `localStorage['ide:workspace-context']`; if non-empty, awaits `loadDirectory(ctx.rootPath)` → fires `list_directory` IPC + sets up SQLite memory + reads sessions + reads `.env` providers | async IPC + SQLite open |
| 0.11 | [src/lib/state/ide.svelte.ts#L598-L612](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L598-L612) | `loadDirectory()` — calls `listDirectory(path)` (Rust `fs::read_dir`), sets `fileEntries` and resets `expandedFolders`. If on a real project, calls `initProjectMemory()` which opens `<rootPath>/.fractal/memory.db` via rusqlite | async I/O + SQLite open |
| 0.12 | [src/lib/state/ide.svelte.ts#L564-L582](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L564-L582) | `openFile(readme.md)` — fires `read_file` IPC + sets `activeFile` | async IPC I/O |
| 0.13 | [src/lib/state/canvas.svelte.ts#L243-L279](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/canvas.svelte.ts#L243-L279) | `await canvas.loadLayout()` — reads `<rootPath>/canvas_layout.json` via `read_file` (Tauri) or `localStorage['canvas:layout']` (browser); on success sets `tiles`, `viewport`, and `activeTemplateId`; flips `showGallery = false` if `tiles.length > 0` | async IPC I/O |

By the time Wave 0 finishes, the shell is in steady state. The `initWorkspace()` chain **is the bulk of boot time** — everything below is comparatively cheap.

### Wave 1 — TemplateGallery boot view state

**Trigger:** `canvas.activeTemplateId === null` AND `canvas.showGallery === true` (the default boot state — `loadLayout()` hasn't found a `canvas_layout.json` with tiles, or has just been read for the first time).

- [src/routes/+page.svelte#L211-L219](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L211-L219): the `{:else}` branch mounts `<Canvas />` (the spatial tile canvas). Even when gallery is showing, `Canvas.svelte` is the layout root underneath.
- [src/routes/+page.svelte#L325-L332](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L325-L332): `{#if canvas.showGallery}` mounts `<TemplateGallery />` as an overlay.
- [src/lib/components/TemplateGallery.svelte#L1-L69](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/TemplateGallery.svelte#L1-L69): imports `canvas` state and `TEMPLATES` constant. Renders 5 template cards with images (`/fractalhome.png` etc., 80–100KB each).
- [src/lib/components/Canvas.svelte#L1-L100](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Canvas.svelte#L1-L100): imports `Tile`, `Minimap`, `TileDock`. `onMount` registers global `keydown`/`keyup` listeners (for Space-to-pan). The board itself renders empty `tiles` until the user picks a template.
- [src/lib/components/Minimap.svelte#L1-L40](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Minimap.svelte#L1-L40): reads `window.innerWidth/Height` in `onMount`, adds a resize listener.
- [src/lib/components/TileDock.svelte#L1-L40](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/TileDock.svelte#L1-L40): dock footer with tile-kind menu — no expensive imports.

**What does NOT mount in this shape:**
- `ClassicIdeLayout`, `NotesLayout`, `DesignLayout` — they're imported at module-body, but the runtime branch doesn't mount them, so their child `Editor` (CodeMirror), `NotesEditor` (TipTap), etc. never execute.
- `CommandPalette` is mounted unconditionally at the bottom of `+page.svelte` ([src/routes/+page.svelte#L321](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L321)) but hidden via CSS until `ideState.showCommandPalette` is `true`. Its module body is parsed but its `$effect`s don't fire until toggled.
- `SettingsDialog` is mounted unconditionally at [src/routes/+page.svelte#L322](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L322). Same pattern — parsed but inactive.

**What runs:**
- TemplateGallery overlay (renders 5 image cards immediately).
- Canvas (empty board + Minimap + TileDock).
- All 5 template thumbnails fetched in parallel by the browser — 5 × ~80–100KB PNGs. These are static assets, so the first paint waits on them via `<img>` decode.

**Relative cost (inferred):** the **cheapest** of the three shapes. No CodeMirror, no TipTap, no TOTP. The 5 template thumbnail PNGs are the dominant asset load.

### Wave 2 — Classic IDE layout at app load

**Trigger:** `canvas.activeTemplateId === 'code'` after `loadLayout()`. This is what you land on if your `canvas_layout.json` (or browser localStorage) has `activeTemplateId: 'code'` from a prior session.

- [src/routes/+page.svelte#L211-L213](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L211-L213): mounts `<ClassicIdeLayout />`.
- [src/lib/components/ClassicIdeLayout.svelte#L1-L100](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ClassicIdeLayout.svelte#L1-L100): eagerly imports `Sidebar`, `Editor`, `Terminal`, `Browser`. Allocates 3 drag/resize state machines.
- [src/lib/components/Sidebar.svelte#L1-L45](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Sidebar.svelte#L1-L45): eagerly imports `TreeNode`, `AIChat`, `ModelMarketplace`, `SkillsMarketplace`. **Both sidebars render even if collapsed** — the layout hides them via CSS but the modules are eagerly evaluated.
- [src/lib/components/AIChat.svelte#L1-L80](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/AIChat.svelte#L1-L80): eagerly imports `PromptInput`, `Conversation`, `Response`, `Reasoning`, `Actions`, `ModelSelector`, `Checkpoint`, `Context`. This is the **largest single bundle tree** in the app — every AI chat primitive is parsed at boot.
- [src/lib/components/ai-elements/Response.svelte#L1-L50](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Response.svelte#L1-L50): eagerly imports `marked` and the local `Code` + `Mermaid` components.
- [src/lib/components/ai-elements/Code.svelte#L1-L40](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Code.svelte#L1-L40): eagerly imports `codemirror` (`basicSetup`), the custom theme, and `CopyButton`. Note: Code is **also** used in ClassicIdeLayout indirectly because Sidebar → AIChat → Response → Code.
- [src/lib/components/Editor.svelte#L1-L80](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Editor.svelte#L1-L80): eagerly imports 4 CodeMirror language packs (`@codemirror/lang-javascript`, `lang-html`, `lang-sass`, `lang-markdown`), `@codemirror/state`, `@codemirror/view`, `@codemirror/commands`, `codemirror`, and the custom theme. On `initEditor()` it constructs a full CodeMirror `EditorView` with `basicSetup`-equivalent extensions. **This is the second-heaviest eagerly-mounted component** (after `NotesEditor`).
- [src/lib/components/Terminal.svelte#L1-L55](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Terminal.svelte#L1-L55): tiny — just iterates `ideState.consoleLogs` (3 entries from the constructor) and binds to `ideState.terminalInput`. Lightweight.
- [src/lib/components/Browser.svelte#L1-L50](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Browser.svelte#L1-L50): eagerly imports `generateTOTP` from `../totp`. Sets up a `setInterval` for `totpTimeRemaining` countdown. This runs **on mount** even if the user never opens the browser — it's a TOTP 30-second timer.

**Wave 2 mount table:**

| File | Line | Action | Cost shape |
|---|---|---|---|
| `ClassicIdeLayout.svelte` | [L1-L100](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ClassicIdeLayout.svelte#L1-L100) | Mount, init 3 resize state machines | sync |
| `Sidebar.svelte` (left) | [L1-L45](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Sidebar.svelte#L1-L45) | Render file tree (or empty state if no `fileEntries`) | sync |
| `Sidebar.svelte` (right) | same | Render AI Chat panel (full tree of ai-elements) | sync + CodeMirror mount on first `<Code>` block |
| `TreeNode.svelte` | [L1-L40](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/TreeNode.svelte#L1-L40) | Recursive `{#each}` over `fileEntries` | sync |
| `Editor.svelte` | [L1-L80](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Editor.svelte#L1-L80) | `initEditor()` builds `EditorView` with all extensions | sync, ~50–150 ms (CodeMirror init) |
| `Terminal.svelte` | [L1-L55](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Terminal.svelte#L1-L55) | Render log list | sync, tiny |
| `Browser.svelte` | [L1-L50](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Browser.svelte#L1-L50) | Start TOTP `setInterval` | async (timer, not blocking) |
| `AIChat.svelte` | [L1-L80](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/AIChat.svelte#L1-L80) | Render chat, register `onAiUsage` listener (second sub) | sync |
| `Response.svelte` (in chat history) | [L1-L50](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Response.svelte#L1-L50) | Parse existing chat history via `marked.lexer` | sync, scales with chat length |

**Relative cost (inferred):** **medium-heavy.** The two big hits are (a) CodeMirror `EditorView` construction in `Editor.svelte`, and (b) the deep `ai-elements` import tree in `AIChat.svelte` (Response → marked + Code → basicSetup). `marked` is ~25 KB gz, `codemirror` `basicSetup` is ~40 KB.

### Wave 3 — Notes layout at app load

**Trigger:** `canvas.activeTemplateId === 'notes'` after `loadLayout()`.

- [src/routes/+page.svelte#L213-L215](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L213-L215): mounts `<NotesLayout />`.
- [src/lib/components/NotesLayout.svelte#L1-L300](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesLayout.svelte#L1-L300): eagerly imports `NotesSidebar1`, `NotesSidebar2`, `NotesEditor`, `AIChat`. Allocates 4 drag/resize state machines (sidebar1, sidebar2, sidebar3, editor-split).
- [src/lib/components/NotesEditor.svelte#L1-L80](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesEditor.svelte#L1-L80): eagerly imports **TipTap** — `@tiptap/core`, `@tiptap/starter-kit`, `@tiptap/extension-placeholder`, `link`, `image`, `underline`, `task-list`, `task-item`, `highlight`, `table`, `table-row`, `table-cell`, `table-header`, `code-block-lowlight`, `@tiptap/suggestion`, `@tiptap/pm`. Plus `marked`, `turndown`, and `lowlight` with `common` languages.
- [src/lib/components/NotesSidebar1.svelte#L1-L28](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesSidebar1.svelte#L1-L28): iterates `ideState.currentVaultRoots`. If empty (first run, no vault saved), renders the "Open a vault to browse folders." empty state.
- [src/lib/components/NotesSidebar2.svelte#L1-L30](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesSidebar2.svelte#L1-L30): renders the markdown file list. Empty if no folder selected.
- [src/lib/components/AIChat.svelte` again] — same deep import tree as Wave 2 (ai-elements).
- `$effect` at [NotesLayout.svelte#L114-L119](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesLayout.svelte#L114-L119): persists selected file path to `localStorage['ide:notes-open-file']` on every selection change.
- `$effect` at [NotesLayout.svelte#L126-L146](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesLayout.svelte#L126-L146): restores previously-open note from `localStorage` **only after** `ideState.currentVaultRoots` is populated. If the saved path isn't in the current vault, it removes the key and does nothing. This is the path that handles "I reloaded with a note open."

**Wave 3 mount table:**

| File | Line | Action | Cost shape |
|---|---|---|---|
| `NotesLayout.svelte` | [L1-L100](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesLayout.svelte#L1-L100) | Mount, init 4 resize machines, `localStorage` persist `selectedFilePath` | sync |
| `NotesSidebar1.svelte` | [L1-L28](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesSidebar1.svelte#L1-L28) | Render vault tree (empty on first run) | sync, tiny |
| `NotesSidebar2.svelte` | [L1-L30](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesSidebar2.svelte#L1-L30) | Render md file list (empty on first run) | sync, tiny |
| `NotesEditor.svelte` | [L1-L80](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesEditor.svelte#L1-L80) | Build TipTap `Editor` with all extensions + `TurndownService` + `marked` + `lowlight` | sync, **largest single component init** |
| `AIChat.svelte` | [L1-L80](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/AIChat.svelte#L1-L80) | Same ai-elements tree as Wave 2 | sync |
| `TurndownService` ctor | [NotesEditor.svelte#L46-L51](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesEditor.svelte#L46-L51) | Allocates Turndown HTML→Markdown converter | sync, ~5–15 ms |
| `createLowlight(common)` | [NotesEditor.svelte#L52](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesEditor.svelte#L52) | Initializes ~50 syntax highlighters | sync, ~10–25 ms |
| `marked` lexer (if restoring note) | [NotesEditor.svelte#L46-L60](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesEditor.svelte#L46-L60) | Parses the open note's markdown | sync, scales with note size |

**Relative cost (inferred):** **heaviest of the three.** TipTap + its 12 extensions + Turndown + lowlight + marked + the same ai-elements tree as Wave 2 = biggest eager mount.

---

## Performance Drivers

### Driver A — `+page.svelte` imports every layout unconditionally

**Location:** [src/routes/+page.svelte#L7-L13](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L7-L13)

**Why it costs what it costs:** All six layout components (Canvas, ClassicIdeLayout, NotesLayout, DesignLayout, TemplateGallery, plus CommandPalette + SettingsDialog) are eagerly imported. Each layout transitively imports its heaviest child (CodeMirror for Classic, TipTap for Notes, etc.). Even when the runtime branch never mounts, the JS is parsed and module bodies execute (state classes instantiated, default values set).

**What to try first:** move `NotesLayout`, `DesignLayout`, and `TemplateGallery` behind dynamic imports (`{#await import('./NotesLayout.svelte')}`), or split them into separate routes `/notes`, `/design`, `/gallery`.

**Confidence:** `inferred-high` — the parse-only cost of these unused modules is visible in the build artifacts (1.46 MB largest node bundle).

### Driver B — `CommandPalette` + `SettingsDialog` mounted unconditionally

**Location:** [src/routes/+page.svelte#L321-L322](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L321-L322)

**Why it costs what it costs:** Both are mounted as always-true `{#if}` placeholders so they can be toggled via `ideState.showCommandPalette` / `ideState.showSettings`. Their `$effect`s don't fire until toggled, but the components themselves, including all model market/skill marketplace tabs in `SettingsDialog`, are evaluated at mount.

**What to try first:** mount via `{#if ideState.showCommandPalette}` and `{#if ideState.showSettings}` — the components only need to exist when shown.

**Confidence:** `inferred-medium`.

### Driver C — `Sidebar.svelte` always mounts the full ai-elements tree

**Location:** [src/lib/components/Sidebar.svelte#L1-L9](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Sidebar.svelte#L1-L9), [src/lib/components/AIChat.svelte#L12-L21](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/AIChat.svelte#L12-L21)

**Why it costs what it costs:** Even in the `code` template, the right sidebar's `<AIChat />` pulls in `PromptInput`, `Conversation`, `Response`, `Reasoning`, `Actions`, `ModelSelector`, `Checkpoint`, `Context`. `Response` pulls `marked` (~25 KB gz) + `Code` → `codemirror` `basicSetup` (~40 KB gz) + `Mermaid` (which is lazy, see Driver D).

**What to try first:** defer `Response`/`Code` import until the chat has at least one message.

**Confidence:** `inferred-high`.

### Driver D — `mermaid` is the only correctly-lazy module

**Location:** [src/lib/components/ai-elements/Mermaid.svelte#L23](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Mermaid.svelte#L23): `const mod = await import('mermaid');`

**Why this is good:** Mermaid is large (~200 KB) and only renders if an AI response includes a `mermaid` fenced code block. The lazy import is correct.

**What to try first:** apply the same pattern to `codemirror` `basicSetup` in `ai-elements/Code.svelte` (used inside `Response`), and to `marked` if any chat component is rarely rendered.

**Confidence:** `measured` (correct pattern) / `inferred-high` for the recommendation.

### Driver E — `Browser.svelte` starts a 30-second TOTP timer at mount

**Location:** [src/lib/components/Browser.svelte#L40-L60](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Browser.svelte#L40-L60) (approx)

**Why it costs what it costs:** Even if the user never opens the in-app browser (and most don't on first launch), the TOTP `setInterval` runs every second. Tiny cost per tick but ongoing.

**What to try first:** only start the timer when the browser panel is actually visible.

**Confidence:** `inferred-low`.

### Driver F — Synchronous localStorage I/O in module bodies

**Location:** [src/lib/state/notes.svelte.ts#L17-L40](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/notes.svelte.ts#L17-L40), [src/lib/state/design.svelte.ts#L17-L30](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/design.svelte.ts#L17-L30), [src/lib/globalstores.ts#L1-L12](file:///Users/amrit/fractals/apps/fractalengine/src/lib/globalstores.ts#L1-L12)

**Why it costs what it costs:** Each state module reads localStorage in its constructor. Even when the user is on the `code` template, `notes.svelte.ts` and `design.svelte.ts` are imported (because `+page.svelte` and the SvelteKit bundler follow the eager import graph). The total is ~5 localStorage reads before paint.

**What to try first:** defer reads into `onMount` so first paint doesn't block.

**Confidence:** `inferred-low` (the actual localStorage reads are sub-millisecond; only matters under heavy concurrent tab load).

### Driver G — `initWorkspace()` is a long async chain on first paint

**Location:** [src/lib/state/ide.svelte.ts#L550-L596](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L550-L596)

**Why it costs what it costs:** After first paint, the user sees the shell (header, footer, layout). But the visible "Code Classic IDE loaded README.md" / "3 console log lines" experience only completes after the IPC chain resolves. On a real Tauri build the dominant cost is `await loadPasswords()` (Rust reads + parses passwords.json) and `await loadDirectory(...)` (`list_directory` IPC + SQLite open via `initProjectMemory()`).

**What to try first:** the user can see the shell immediately — the slow chain doesn't block first paint. So this is mostly cosmetic. But the `canvas.loadLayout()` call at the **end** of `initWorkspace()` is the only step that determines which layout mounts; running it earlier would mean the layout branch in `+page.svelte` could already be correct by the time first paint hits. Consider reading `canvas_layout.json` ahead of `loadDirectory()`.

**Confidence:** `inferred-medium`.

### Driver H — `tauri-plugin-window-state` writes window geometry at launch

**Location:** [src-tauri/Cargo.toml#L22-L24](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/Cargo.toml#L22-L24), managed in `lib.rs#Builder` chain.

**Why it costs what it costs:** Each launch reads the previous window size/position from disk. First-ever launch creates the file. Disk I/O is fast but synchronous in the `setup` hook.

**Confidence:** `inferred-low` — only matters on cold-disk devices.

### Driver I — SASS aggregation is fully eager and not code-split

**Location:** [src/lib/styles/index.sass#L1-L25](file:///Users/amrit/fractalengine/src/lib/styles/index.sass#L1-L25)

**Why it costs what it costs:** Every component SASS file is bundled into a single CSS output. `_designcanvas.sass` and `_settings.sass` ship to every user even if they never open those views.

**What to try first:** split SASS into per-component chunks loaded by the lazy `import()` of the matching component. SvelteKit's component CSS scoping would let each `.sass` partial co-locate with its `.svelte` file.

**Confidence:** `inferred-medium` (CSS is small relative to JS, but not zero — and it's already paid by `+layout.svelte` before any branch is taken).

### Driver J — Webfonts are `font-display: swap` but un-preloaded

**Location:** [src/lib/styles/_font-imports.sass#L1-L41](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_font-imports.sass#L1-L41)

**Why it costs what it costs:** Text is rendered in fallback (`system-ui` etc.) until the 6 woff2 files arrive. There's no `<link rel="preload">` hint anywhere — the browser fetches them lazily after first paint.

**What to try first:** add a `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/instrument-sans-regular.woff2">` to `app.html` for the regular and bold weights (the two most-used).

**Confidence:** `inferred-medium`.

---

## Recommendations

Ordered by expected impact ÷ risk.

### R1 — Lazy-load the layout components in `+page.svelte`

**Change:** Replace eager imports at [src/routes/+page.svelte#L7-L13](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte#L7-L13) with `{#await import('./NotesLayout.svelte')}` blocks, so only the branch the user actually lands on pulls its child tree (TipTap / CodeMirror / TOTP / etc.).

```svelte
{#if canvas.activeTemplateId === 'code'}
  {#await import('../lib/components/ClassicIdeLayout.svelte') then { default: C }}
    <C />
  {/await}
{:else if canvas.activeTemplateId === 'notes'}
  ...
{/if}
```

**Impact:** large. Removes TipTap (~150 KB), CodeMirror languages, etc. from the first-paint bundle when the user lands on the gallery or code template.
**Risk:** flash-of-unstyled-layout on first template switch (template mounts slightly after the layout region paints). Mitigatable by a 100ms CSS skeleton.
**Confidence:** `inferred-high`.

### R2 — Make `CommandPalette` and `SettingsDialog` mount conditionally

**Change:** Wrap them in `{#if ideState.showCommandPalette}` / `{#if ideState.showSettings}` instead of mounting them as always-on placeholders. The toggle just sets the boolean; the components don't need to exist until shown.

**Impact:** medium. Removes model marketplace + skills marketplace modules from the first-paint bundle.
**Risk:** none — they're inert until toggled.
**Confidence:** `inferred-high`.

### R3 — Lazy-load `Code.svelte` and `marked` from inside `Response.svelte`

**Change:** `Response.svelte` already parses markdown at mount time. The `marked` import and `Code` component should be dynamically imported inside the `$derived.by(...)` block so they only load when there's actual chat content to render.

**Impact:** medium. Removes ~60 KB from the AIChat subtree mount.
**Risk:** first chunk of an AI response may appear a tick late while `marked` loads.
**Confidence:** `inferred-medium`.

### R4 — Defer `Browser.svelte`'s TOTP interval until the browser is opened

**Change:** The `setInterval` for TOTP codes starts on mount regardless of whether the browser panel is visible. Wrap it in `{#if !ideState.browserCollapsed}` or similar.

**Impact:** small (CPU), but eliminates a runaway timer in code-template sessions.
**Risk:** none.
**Confidence:** `inferred-low`.

### R5 — Preload the two heaviest webfonts in `app.html`

**Change:** Add two `<link rel="preload" as="font" type="font/woff2" crossorigin>` tags to [src/app.html](file:///Users/amrit/fractals/apps/fractalengine/src/app.html) for `instrument-sans-regular.woff2` and `instrument-sans-700.woff2`.

**Impact:** small but visible — removes the font swap on first paint of every panel text.
**Risk:** none.
**Confidence:** `inferred-medium`.

### R6 — Move `canvas.loadLayout()` earlier in `initWorkspace()`

**Change:** Run `canvas.loadLayout()` before `loadDirectory()` instead of after. The layout branch decision (`activeTemplateId`) doesn't depend on `rootPath` to be settled — `loadLayout()` falls back to `localStorage['canvas:layout']` if `rootPath` is empty (see [src/lib/state/canvas.svelte.ts#L243-L279](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/canvas.svelte.ts#L243-L279)). Running it earlier lets the layout branch in `+page.svelte` be correct by first paint.

**Impact:** medium. Eliminates the layout-flicker from "gallery → user's last template".
**Risk:** if rootPath-dependent tiles use stale path references. But `tiles[].x/y` are board coordinates, not paths, so they're stable.
**Confidence:** `inferred-medium`.

### R7 — Lazy-import the heavier state modules

**Change:** `notes.svelte.ts` and `design.svelte.ts` are imported unconditionally. They're only needed when `activeTemplateId === 'notes'` or `'design'`. Convert their exports to dynamic-import-backed proxies, or move them into the layout component that uses them.

**Impact:** small. Saves a few localStorage reads on first paint.
**Risk:** state-mutation race if another module reads them before the dynamic import resolves. Both modules are only read by their own layout; this should be safe.
**Confidence:** `inferred-low`.

### R8 — Investigate a Rust-side perf probe

**Change:** This report is static. To validate which recommendations actually move the needle, add `tracing`/`tracing-subscriber` to `lib.rs` and instrument the `setup` hook + `invoke_handler` registration. Pair with `console.time`/`console.timeEnd` markers on the frontend's `initWorkspace()` chain.

**Impact:** enables prioritization of R1–R7 with real numbers.
**Risk:** none.
**Confidence:** recommendation; numbers not yet measured.

---

## Inferred Cost Summary

All numbers below are **inferred** (no live measurement). Ranges reflect uncertainty across machines, caches, and Tauri build variants.

| Phase | Block | Inferred cost |
|---|---|---|
| R1-R2 | Rust entry + Tauri builder chain | 5–15 ms |
| R3 | Native menu construction (5 submenus, ~20 items) | 20–60 ms |
| R4 | Webview spawn (WKWebView init) | 50–150 ms |
| F1 | SASS aggregation (21 partials compiled into one CSS) | 30–80 ms |
| F1 | Module-body state instantiation (ide/canvas/notes/design/theme) | 10–30 ms |
| F2 | `+page.svelte` parse + import graph (TemplateGallery + CommandPalette + SettingsDialog always parsed) | 20–80 ms |
| F5 + W0 | `onMount` → `initWorkspace()` (localStorage reads + 1 IPC `load_password_database` + `list_directory` + `read_file` for layout) | 80–300 ms (Tauri), 300–900 ms (browser mock delays) |
| F5 | `listen('menu-event', ...)` subscription | 1–5 ms |
| Wave 1 (gallery boot) | TemplateGallery + Canvas + Minimap + TileDock mount + 5 PNGs decoded | 100–400 ms |
| Wave 2 (code boot) | Wave 1 + ClassicIdeLayout + Sidebar (left+right) + Editor (CodeMirror init) + Terminal + Browser (TOTP) + AIChat (ai-elements tree) | 250–700 ms |
| Wave 3 (notes boot) | Wave 1 + NotesLayout + 3 sidebars + NotesEditor (TipTap + 12 extensions + Turndown + lowlight + marked) + AIChat | 400–1200 ms |
| Mermaid (lazy, on first diagram) | `await import('mermaid')` + `mermaid.initialize()` + render | 200–600 ms (first time only) |

**Total cold-start to first interactive frame (inferred):**
- **Gallery boot:** ~500–1200 ms
- **Code boot:** ~700–1900 ms
- **Notes boot:** ~900–2400 ms

These are dominated by JS parse + module-body evaluation on the first cold load. Subsequent loads (warm OS file cache, warm Tauri sidecar) drop roughly in half.

---

## Resolution (2026-06-25)

Applied:

- **R1 — lazy-load layouts.** [src/routes/+page.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte) no longer eagerly imports `ClassicIdeLayout`, `NotesLayout`, `DesignLayout`, or `TemplateGallery` at module body. Each is now behind `{#await import(...)}` in the branch that actually mounts it (`Canvas` stays eager — it's the cheapest shape and the default fallback).
- **R2 — conditional dialog mounts.** `CommandPalette` and `SettingsDialog` are now `{#if ideState.showCommandPalette}` / `{#if ideState.showSettings}` blocks wrapping a dynamic `import()`, instead of always-mounted placeholders. Verified the `Cmd+,`/palette keybindings still work — they live in `+layout.svelte` and just flip the boolean, independent of whether the component is currently mounted.
- **R3 — lazy CodeMirror in chat code blocks.** [ai-elements/Code.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Code.svelte) moved its `codemirror` / `@codemirror/state` / `editorTheme` imports from module top into a dynamic `import()` inside the mount `$effect`. `marked` in `Response.svelte` stays eager — it's needed synchronously to parse every markdown block (not just code fences), so deferring it would delay all chat rendering for a small (~25 KB) win.
- **R4 — TOTP timer gated on visibility.** [Browser.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Browser.svelte)'s `setInterval` now lives inside a `$effect` keyed on `showVault`, so it only runs while the password vault popover is open, not for the lifetime of the mounted `Browser` component.
- **R5 — font preload.** Added `<link rel="preload" as="font">` for `instrument-sans-regular.woff2` and `instrument-sans-600.woff2` to [src/app.html](file:///Users/amrit/fractals/apps/fractalengine/src/app.html) — picked 400/600 over 400/700 after grepping actual `font-weight` usage in `_typography.sass` (600 appears, bare `bold` only once).

Not applied:

- **R6 — move `canvas.loadLayout()` earlier.** Investigated and **rejected**: [ide.svelte.ts#L587-L595](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts#L587-L595) carries a comment explaining this was already tried and reverted — `loadLayout()` reads `<rootPath>/canvas_layout.json` in Tauri mode, and `rootPath` isn't settled until after `loadDirectory()` runs. Calling it earlier silently falls back to a stale generic localStorage key, which is exactly the bug this report's driver/recommendation would have reintroduced (the last-used template, e.g. Notes, wouldn't stick across reloads). Confirmed by reading [canvas.svelte.ts#L243-L274](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/canvas.svelte.ts#L243-L274). Leaving the ordering as-is.
- **R7 — lazy-import `notes`/`design` state modules.** Skipped: both singletons are read directly by header buttons in `+page.svelte` regardless of `activeTemplateId` (e.g. `notes.toggleSidebar1()`), so the import can't be deferred without restructuring the header. The report rated this `inferred-low` confidence / small impact (sub-millisecond localStorage reads) — not worth the complexity.
- **R8 — Rust-side tracing probe.** Out of scope for this pass — it's a measurement tool, not a fix. Worth doing separately if R1–R5's impact needs to be validated with real numbers.

Verified via the `run-fractalengine` headless driver: gallery boot, code-template boot (lazy `ClassicIdeLayout`), notes-template boot (lazy `NotesLayout`), design-template boot (lazy `DesignLayout`), and the `Settings` dialog all rendered correctly post-change, with no new console errors beyond the pre-existing benign `transformCallback` IPC-mock warning.

---

## Appendix: Files Read

| File | Why read |
|---|---|
| [src-tauri/src/main.rs](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/main.rs) | Rust entry, confirmed one-line delegation |
| [src-tauri/src/lib.rs](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs) | Builder chain, plugins, menu construction, command registry |
| [src-tauri/tauri.conf.json](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/tauri.conf.json) | Bundle config, webview window, CSP, dev/build commands |
| [src-tauri/Cargo.toml](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/Cargo.toml) | Plugins, features, dependencies |
| [src-tauri/src/memory.rs](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/memory.rs) | SQLite per-project memory DB; not opened until `initProjectMemory()` |
| [src-tauri/src/docs_index.rs](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/docs_index.rs) | Confirmed rebuild is lazy/idle, not eager |
| [src/app.html](file:///Users/amrit/fractals/apps/fractalengine/src/app.html) | No `<link rel="preload">` for fonts |
| [src/routes/+layout.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+layout.svelte) | Global state imports + `onMount` chain |
| [src/routes/+layout.ts](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+layout.ts) | Confirmed SSR off, prerender on |
| [src/routes/+page.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte) | Eager imports of all layout components |
| [src/routes/browser/+page.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/routes/browser/+page.svelte) | Standalone browser route |
| [src/lib/ipc.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts) | IPC gateway, identified 2 lazy dynamic imports |
| [src/lib/ipc-mock.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts) | Mock handlers, identified 100/150ms `delay()` calls |
| [src/lib/globalstores.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/globalstores.ts) | Theme store + localStorage read at module body |
| [src/lib/state/ide.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts) | `IDEState` class, `initWorkspace()` chain, all localStorage keys, undo/redo, AI listeners, docs-index watcher, password loader, memory init |
| [src/lib/state/canvas.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/canvas.svelte.ts) | `CanvasStore` default state, `loadLayout()` fallback chain, `saveLayout()` |
| [src/lib/state/notes.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/notes.svelte.ts) | `NoteState` constructor + localStorage read |
| [src/lib/state/design.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/design.svelte.ts) | `DesignState` constructor + localStorage read |
| [src/lib/data/templates.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/data/templates.ts) | 5 template definitions (home/code/notes/design/blank) |
| [src/lib/data/tileKinds.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/data/tileKinds.ts) | Tile kind metadata (which component for each kind) |
| [src/lib/editorTheme.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/editorTheme.ts) | CodeMirror theme + dynamic syntax highlighting |
| [src/lib/styles/index.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/index.sass) | 21 partials aggregated |
| [src/lib/styles/_font-imports.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_font-imports.sass) | 6 `@font-face` rules with `font-display: swap`, no preload |
| [src/lib/styles/components/*](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components) | 17 component partials — sizes measured |
| [src/lib/components/ClassicIdeLayout.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ClassicIdeLayout.svelte) | Eager children: Sidebar/Editor/Terminal/Browser |
| [src/lib/components/NotesLayout.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesLayout.svelte) | Eager children: NotesSidebar1/2 + NotesEditor + AIChat; 4 resize machines |
| [src/lib/components/TemplateGallery.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/TemplateGallery.svelte) | Overlay component, only mounts when `canvas.showGallery === true` |
| [src/lib/components/Canvas.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Canvas.svelte) | Spatial tile canvas fallback, eagerly mounts Minimap + TileDock |
| [src/lib/components/Sidebar.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Sidebar.svelte) | Always imports AIChat + ModelMarketplace + SkillsMarketplace |
| [src/lib/components/Editor.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Editor.svelte) | CodeMirror + 4 language packs + custom theme |
| [src/lib/components/Terminal.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Terminal.svelte) | Lightweight log iterator |
| [src/lib/components/Browser.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Browser.svelte) | TOTP `setInterval` starts at mount |
| [src/lib/components/AIChat.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/AIChat.svelte) | Imports the full ai-elements tree |
| [src/lib/components/NotesEditor.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesEditor.svelte) | TipTap + 12 extensions + Turndown + lowlight + marked |
| [src/lib/components/NotesSidebar1.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesSidebar1.svelte) | Vault tree, renders empty state on first run |
| [src/lib/components/NotesSidebar2.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/NotesSidebar2.svelte) | MD file list |
| [src/lib/components/Minimap.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Minimap.svelte) | Mounts `window.innerWidth/Height` + resize listener |
| [src/lib/components/TileDock.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/TileDock.svelte) | Tile-kind dock menu |
| [src/lib/components/Tile.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Tile.svelte) | Only mounts if tiles exist |
| [src/lib/components/TreeNode.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/TreeNode.svelte) | Recursive file-tree node |
| [src/lib/components/VaultTreeNode.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/VaultTreeNode.svelte) | Vault-specific tree node |
| [src/lib/components/CommandPalette.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/CommandPalette.svelte) | Always mounted, hidden via CSS |
| [src/lib/components/SettingsDialog.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/SettingsDialog.svelte) | Always mounted, hidden via CSS; imports marketplaces |
| [src/lib/components/DesignLayout.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/DesignLayout.svelte) | Design view (3 resize machines + AIChat) |
| [src/lib/components/PromptInput.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/PromptInput.svelte) | Submitted-files handling; lazy `FileReader.readAsDataURL` |
| [src/lib/components/ai-elements/Conversation.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Conversation.svelte) | Auto-stick scroll, IntersectionObserver |
| [src/lib/components/ai-elements/Response.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Response.svelte) | Markdown renderer; imports marked + Code + Mermaid |
| [src/lib/components/ai-elements/Code.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Code.svelte) | Read-only CodeMirror; imports `basicSetup` eagerly |
| [src/lib/components/ai-elements/Mermaid.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Mermaid.svelte) | Correctly lazy `import('mermaid')` |
| [src/lib/components/ai-elements/Reasoning.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Reasoning.svelte) | Collapsible CoT panel |
| [src/lib/components/ai-elements/Actions.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/Actions.svelte) | Retry/copy buttons |
| [src/lib/components/ai-elements/ModelSelector.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/ModelSelector.svelte) | Searchable model palette |
| [src/lib/components/ai-elements/CopyButton.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/CopyButton.svelte) | Lightweight |
| [src/lib/components/ai-elements/checkpoint/Checkpoint.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/checkpoint/Checkpoint.svelte) | Stateless marker |
| [src/lib/components/ai-elements/context/Context.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/ai-elements/context/Context.svelte) | Token usage ring |
| [package.json](file:///Users/amrit/fractals/apps/fractalengine/package.json) | Dependencies; identified CodeMirror/TipTap/Mermaid/Marked/etc. weights |
| [svelte.config.js](file:///Users/amrit/fractals/apps/fractalengine/svelte.config.js) | Adapter-static + fallback config |
| [vite.config.ts](file:///Users/amrit/fractals/apps/fractalengine/vite.config.ts) | `fractals-styler` plugin |
| [docs/INDEX.md](file:///Users/amrit/fractals/apps/fractalengine/docs/INDEX.md) | Confirmed no existing performance docs |
| [build/_app/](file:///Users/amrit/fractals/apps/fractalengine/build/_app) | Measured chunk sizes: 4.9 MB total, 3.4 MB chunks, 1.46 MB largest node |