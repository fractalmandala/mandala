---
task: shradhapp-openreel-fork
status: in-progress
host: qoder
branch: feat/shradhapp-openreel-fork
boss: agent
updated: 2026-08-10
---

# Handoff — Shradhapp OpenReel fork integration

## Where we are

Goal: rebuild shradhapp as a local-first desktop video editor (Tauri 2 + Rust)
by forking OpenReel Video (MIT, ~125k lines TypeScript, React + Vite +
WebCodecs + WebGPU) and wrapping it with shradhapp's existing Rust backend,
then harmonize a third Audio tab (Wavacity iframe) so the whole product
feels like one editor.

Branch `feat/shradhapp-openreel-fork` pushed to
`origin/feat/shradhapp-openreel-fork` (new branch). Single commit:

```
feat(shradhapp): fork OpenReel Video + integrate as Tauri 2 desktop editor
```

Pre-push hook ran OpenReel's full test suite: 143 test files, 803 passed, 7
skipped. `cargo check`, `tsc --noEmit`, `pnpm --filter @openreel/web build`
all green locally. `cargo clean` done (target/ removed, 4.2 GiB reclaimed).

## What shipped in this commit

- **Submodule**: OpenReel Video forked as `apps/shradhapp/openreel`
  (`.gitmodules` points at `https://github.com/Augani/openreel-video.git`).
  Internal modifications (panels, bridge wiring, storage adapter, auto-import
  hook, AudioPage, WorkspaceModeTabs, ui-store DesktopPage extension) are
  local to the submodule and **not yet pushed upstream** — see "Open
  questions" below.
- **Workspace restructure**: old SvelteKit `src/` archived to
  `src-archive/` (git detected as renames); OpenReel's React + Vite
  frontend is now the source of truth.
- **Tauri config**: `tauri.conf.json` updated for OpenReel Vite output;
  `beforeDevCommand` fixed (port 1420 — the previous `--` separator was
  swallowing the port flag).
- **Rust platform bridge** (`src-tauri/src/bridge.rs`, ~897 lines): fs,
  export, window, lifecycle, media probe, hardware, 12 storage-adapter
  commands, multi-file picker, download interception for Wavacity export
  handoff. 4 dead-code warnings (API contract fields) — intentional.
- **Bridge injection** (`src-tauri/static/openreel-bridge.js`): embedded
  via `WebviewWindowBuilder::initialization_script()` before page JS runs.
  Resolves `invoke` via a 3-tier chain:
  `window.__TAURI_INTERNALS__.invoke` → `window.__TAURI__.core.invoke` →
  `window.__TAURI__.invoke`. (Tauri 2 quirk: `window.__TAURI__.invoke` does
  not exist in Tauri 2.11.1 — use `__TAURI_INTERNALS__` or `core.invoke`.)
- **Storage adapter** (`apps/web/src/services/tauri-storage-engine.ts`):
  `TauriStorageEngine` implementing `IStorageEngine` with SQLite via Rust
  commands. Wired into `media-storage.ts` and `ScriptViewDialog.tsx` with
  desktop detection. Cache + waveform tables added to `db.rs`.
- **Native media import** (`pickMediaFiles` bridge helper + `AssetPanel`
  conditional): opens Tauri file picker, reads bytes, returns `File` objects.
- **Shradhapp panels**: `ShradhappHeader`, `RecordPanel` (MediaRecorder +
  auto-import), `AudioCleanupPanel` (stub toolbar — denoise/gate/compress/
  normalize/EQ — real FFmpeg wiring deferred), `ShradhappPanelContext` for
  state sharing.
- **Export integration**: DesktopExportButton already wired via
  `showSavePicker` → `window.openreel.fs.showSaveDialog` → native FFmpeg
  backend.
- **Undo/redo**: already wired via action executor.
- **Third workspace tab — Audio (Wavacity)**: `WorkspaceModeTabs` extended
  with `audio` mode; `Workspace.tsx` renders `AudioPage.tsx` (iframe to
  `wavacity.com`). Download interception in `lib.rs` routes exports to
  `<app-data>/imports/` and emits `shradhapp:download-finished`; the
  `useWavacityAutoImport` hook reads the file via the fs bridge, imports
  into the open project, and switches back to Video Editor.
- **Specs**: `PRODUCT.md` §9 + `TECH.md` §10 added with the Audio Workspace
  harmonization three-tier ladder (Tier 1 themed chrome shipped as MVP,
  Tier 2 CSS injection and Tier 3 Wavacity fork are follow-ups).

## Files touched (for quick context restore)

Rust (all under `apps/shradhapp/src-tauri/`):
- `src/bridge.rs` (new, ~897 lines)
- `src/db.rs` (added `or_cache`, `or_waveforms` tables + CRUD)
- `src/lib.rs` (registered 12 storage commands + `or_fs_show_open_dialog_multi`
  + `on_download` handler on the `WebviewWindowBuilder`)
- `src/media_engine.rs` (minor)
- `Cargo.toml` / `Cargo.lock` (added tokio with `sync` feature)
- `tauri.conf.json` (`beforeDevCommand` port fix)
- `static/openreel-bridge.js` (new)

Frontend (all under `apps/shradhapp/openreel/apps/web/src/`):
- `desktop/shell/Workspace.tsx`, `WorkspaceModeTabs.tsx` — 3-tab switcher
- `desktop/pages/AudioPage.tsx` (new) — Wavacity iframe
- `desktop/DesktopApp.tsx` — mounts `ShradhappHeader`, `useWavacityAutoImport`
- `desktop/pages/EditPage.tsx` — shradhapp side-panel grid column
- `desktop/shradhapp/` (new dir): `ShradhappHeader.tsx`, `RecordPanel.tsx`,
  `AudioCleanupPanel.tsx`, `ShradhappPanelContext.ts`,
  `useWavacityAutoImport.ts`, `index.ts`
- `services/tauri-storage-engine.ts` (new)
- `services/media-storage.ts`, `components/editor/ScriptViewDialog.tsx` —
  conditional `TauriStorageEngine`
- `motion/components/AssetPanel.tsx` — native file picker
- `stores/ui-store.ts` — extended `DesktopPage` union with `"audio"`

Specs (under `apps/shradhapp/`):
- `PRODUCT.md` (restored from stash + §9 added)
- `TECH.md` (restored from stash + §10 added, new risks, testing section
  extension, 3 new follow-ups)

## Stash state (do NOT touch)

`stash@{0}: On main: WIP: pre-openreel-fork state` is still on the stack.
It contains:
- tracked pre-openreel shradhapp WIP
- untracked figmaboy backup (`preprojects/figmaboy-main/`)

**Do not** `git stash drop`, `git stash clear`, `git stash pop`, or run any
`git stash -u` / `--include-untracked` / `--all` from the repo root.
Figmaboy was selectively restored from `stash@{0}^3` into
`preprojects/figmaboy-main/` (untracked worktree-only); another agent owns
that tree.

## Open questions / next-session work

1. **Submodule upstream**: `.gitmodules` points at
   `https://github.com/Augani/openreel-video.git` (upstream). The local
   submodule has uncommitted changes (our panels, bridge wiring, storage
   adapter, auto-import hook, AudioPage, ui-store). These need either:
   - a) Fork to `fractalmandala/openreel-video` on GitHub, update
      `.gitmodules` URL, push submodule commit there, then re-commit parent
      submodule pointer in mandala; or
   - b) Inline the submodule's content into `apps/shradhapp/openreel/` and
      remove the submodule entry. Option (a) preserves upstream rebasing;
      option (b) is simpler for now.
2. **Tier 2 Audio Workspace harmonization** (PRODUCT §9.4, TECH §10): fork
   Wavacity locally, serve via Tauri asset protocol, inject editor token
   map as CSS. Replaces `wavacity.com` and removes cross-origin
   constraint.
3. **Tier 3 Wavacity fork plugin**: `OpenReelThemePlugin` inside the fork +
   "Save to Video Editor" command driven by chrome button.
4. **Audio cleanup real wiring**: `AudioCleanupPanel` currently toasts.
   Replace with Rust FFmpeg audio filters (denoise, gate, normalize,
   compressor, EQ).
5. **Record panel smoke test**: user reported Record button non-responsive
   in an earlier run — fixed by switching from `window.__TAURI__.invoke`
   to `window.openreel.fs.*` bridge. Confirm again in the next smoke test.

## Smoke-test procedure (for the next session)

From `apps/shradhapp/`:

```bash
pnpm tauri:dev
```

Verify:
1. Tauri window opens on port 1420 (Vite dev server).
2. Three tabs visible: Video Editor, Motion Design, Audio.
3. Audio tab loads Wavacity iframe (network-dependent).
4. Record a voiceover via ShradhappHeader → Record toggle → Stop →
   confirms import.
5. Export via Video Editor's Export button → native save dialog → renders.
6. Click Audio tab → export from Wavacity → auto-imports into open project
   → switches to Video Editor tab with toast.

## Hard rules for future sessions

- Scope: only `apps/shradhapp/` (and root `pnpm-workspace.yaml` if needed
  for wiring). Never touch `preprojects/figmaboy-main/`.
- Never `git stash -u` / `--include-untracked` / `--all` / `git clean -fd`
  from the mandala root — untracked figmaboy will vanish.
- Never `git stash drop/clear/pop` on `stash@{0}` without explicit human
  OK. Prefer path-scoped checkout:
  `git checkout stash@{0}^{2|3} -- apps/shradhapp/path/you/need`.
- Do not `git add preprojects/` or commit figmaboy onto the openreel branch.

## Closing

Session ended clean. Branch pushed, specs committed, cargo target cleaned.
Ready for the next session to pick up Tier 2 audio harmonization or the
submodule-upstream decision.
