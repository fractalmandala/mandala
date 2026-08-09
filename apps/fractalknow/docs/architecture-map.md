# FractalKnow Architecture Map

Date: 2026-07-31
Scope: `/Users/amrit/fractals/apps/fractalknow` (Tauri 2 + SvelteKit 2 + Svelte 5 + TypeScript + TipTap 3 + CodeMirror 6 + Hocuspocus/Yjs). Excludes the read-only reference app in `open-knowledge-main/`.

## Overview

FractalKnow is a desktop knowledge/markdown editor being ported from the Electron + React "open-knowledge" app to Tauri + SvelteKit. The frontend is a SvelteKit SPA (SSR disabled, `adapter-static` fallback) that talks to the Rust shell exclusively through a single typed facade (`$lib/desktop`). All durable documents are plain Markdown on disk; the rich editor holds an in-memory TipTap/ProseMirror AST bridged by a custom serializer.

## Tech Stack

| Layer | Technology | Where configured |
|---|---|---|
| Desktop runtime | Tauri 2 (Rust, edition 2021) | `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json` |
| Frontend framework | SvelteKit 2 + Svelte 5 (runes), SPA mode | `svelte.config.js` (adapter-static fallback), `src/routes/+layout.ts:7` (`ssr = false`) |
| Language | TypeScript ~5.6 (strict) | `tsconfig.json` |
| Styling | Indented Sass (`.sass`, tabs) + CSS custom properties | `src/lib/styles/`, README.md:7 |
| Rich editor | TipTap 3 (+ Collaboration/Caret) | `src/lib/editor/extensions.ts` |
| Source editor | CodeMirror 6 | `src/lib/components/editor/SourceEditor.svelte` |
| Collaboration | Yjs + y-indexeddb + @hocuspocus/provider | `src/lib/editor/collab.ts` |
| Markdown | marked 18 (two configurations) | `src/lib/editor/serialization.ts`, `src/lib/components/editor/markdown.ts` |
| Tests | Vitest (unit + component, jsdom) + Playwright | `vitest*.config.ts`, `playwright.config.ts` |
| Package manager | pnpm | `package.json` scripts |

## Entry Points

| Entry | File | Notes |
|---|---|---|
| Rust binary | `src-tauri/src/main.rs` | 6-line shim calling `fractalknow_lib::run()` |
| Rust app | `src-tauri/src/lib.rs:695` (`pub fn run`) | Logger, menu, `BridgeState`, 7 plugins, 40 `#[tauri::command]` handlers (`lib.rs:758-799`) |
| HTML shell | `src/app.html` | Standard SvelteKit template |
| SvelteKit layout | `src/routes/+layout.ts` | Imports `global.sass`; `export const ssr = false` |
| Root page | `src/routes/+page.svelte` | Renders only `<AppShell />` — single-route SPA |
| App shell | `src/lib/components/AppShell.svelte` | Composition root: bridge wiring, providers, command/menu dispatch, all chrome |

There is exactly **one route**. All "navigation" is internal state (`DocumentTarget` / hash), not SvelteKit routing.

## Layer Boundaries

```
┌────────────────────────────────────────────────────────────────┐
│ OS / Tauri 2 window (webview)                                   │
│                                                                 │
│  src/routes/+page.svelte → AppShell.svelte                      │
│  ┌──────────────────── Svelte components ────────────────────┐  │
│  │ components/        shell chrome (sidebar, palette,        │  │
│  │                    dialogs, toolbar, right panel)         │  │
│  │ components/editor/ surfaces (rich/source/preview/diff)    │  │
│  │ components/ui|overlays|icons   primitives                 │  │
│  └──────────┬───────────────────────────────┬────────────────┘  │
│             │ imports stores                │ dynamic-imports    │
│  ┌──────────▼──────────┐        ┌───────────▼───────────────┐   │
│  │ lib/shell/          │        │ lib/editor/               │   │
│  │ store hub: state,   │        │ serialization, collab,    │   │
│  │ documents, commands,│◀──────▶│ project-files (disk IO    │   │
│  │ config, preferences │  lazy  │ facade), diagnostics      │   │
│  └──────────┬──────────┘        └───────────┬───────────────┘   │
│             │                               │                    │
│  ┌──────────▼───────────────────────────────▼───────────────┐   │
│  │ lib/desktop/  OkDesktopBridge facade                      │   │
│  │  bridge.ts   → Tauri runtime: invoke()/listen()           │   │
│  │              → browser-preview fallback (no-op/unsupported)│  │
│  └──────────┬───────────────────────────────────────────────┘   │
└─────────────┼───────────────────────────────────────────────────┘
              │ Tauri IPC: 40 commands + `ok:*` events
┌─────────────▼───────────────────────────────────────────────────┐
│ src-tauri/src (Rust)                                            │
│  lib.rs          command registry, BridgeState, startup wiring  │
│  project_fs.rs   disk IO under project root (list/read/write/   │
│                  create/rename/delete + .fractalknow/versions)  │
│  project.rs      project scaffolding template                   │
│  project_watch.rs notify-debounced `ok:project-files-changed`   │
│  menu.rs         native menu spec + enablement registry         │
│  terminal_pty.rs portable-pty sessions → `ok:terminal-*`        │
│  server.rs       external collab-server process lifecycle       │
│  consent.rs      persisted consent gate → `ok:consent-required` │
│  crash.rs        panic hook → crash reports → `ok:crash-invite` │
│  bug_report.rs   diagnostic capture                             │
│  updater.rs      tauri-plugin-updater wrapper → `ok:update-status`│
│  deep_link.rs / platform.rs / paths.rs   helpers                │
└─────────────────────────────────────────────────────────────────┘
```

### Boundary rules (enforced by code shape, not by lint)

1. **Components never call Tauri directly.** Only `lib/desktop/bridge.ts` (and `lib/editor/project-files.ts`, which is the disk-IO extension of the facade) import `@tauri-apps/*`. Evidence: `bridge.ts:231`, `bridge.ts:377`, `project-files.ts:246,375`.
2. **`lib/shell/index.ts` is the public API** of the store layer — components import from `$lib/shell`, not deep paths (AppShell.svelte:3-36).
3. **Editor and desktop deps are lazy.** CodeMirror, TipTap, mermaid, yjs/hocuspocus, and `@tauri-apps/*` are all loaded via dynamic `import()` so the shell boots without them (`docs/bundle-audit.md`).
4. **Markdown is canonical on disk.** TipTap JSON is in-memory only; HTML is paste/load transport only (`src/lib/editor/serialization.ts:1-13`, `docs/document-serialization.md`).

## Directory Map

| Path | Purpose | Classification |
|---|---|---|
| `src/routes/` | Single-route SPA entry | project code |
| `src/lib/desktop/` | Typed desktop bridge facade + types + store | project code (core) |
| `src/lib/shell/` | Application state: stores, commands, config, preferences, projects, menus, toasts | project code (core) |
| `src/lib/editor/` | Serialization (markdown⇄tiptap), collab sessions, diagnostics, paste, disk-IO facade | project code (core) |
| `src/lib/components/` | Shell chrome + editor surfaces + ui primitives | project code |
| `src/lib/migration/` | Temporary migration-progress board (hardcoded data) | project code (temporary) |
| `src/lib/icons/` | Inline SVG icon component + file-type mapping | project code |
| `src/lib/styles/` | Sass tokens, mixins, global theme | project code (core) |
| `src/test/` | Vitest setup + `$app/environment` stub | test infra |
| `src-tauri/src/` | Rust shell (14 modules, ~3,200 LOC) | project code (core) |
| `src-tauri/capabilities/` | Tauri ACL (core+dialog+opener defaults only) | project config |
| `src-tauri/gen/schemas/` | Tauri-generated ACL schemas | generated artifact (committed) |
| `src-tauri/icons/` | Bundle icons | binary assets |
| `scripts/` | Token lint, Sass smoke, bundle audit | project tooling |
| `tests/e2e/` | Playwright flows | test code |
| `docs/` | Audit/decision documents | documentation |
| `static/` | favicon + unused scaffold SVGs | assets (partly dead) |
| `build/`, `.svelte-kit/`, `test-results/` | Build/test output | build artifacts |
| `open-knowledge-main/` | READ-ONLY reference source (Electron+React original) | excluded reference — never scan as replica code, never modify |

## Request/Data Lifecycle (representative traces)

**Open a document (desktop):**
`ShellSidebar` click → `openDocument`/`openTarget` (`lib/shell/store.ts`, `documents.ts`) → `documents.ts` lazy-imports `lib/editor/project-files.ts` → `invoke('read_project_file')` → `project_fs::read_file` (`project_fs.rs:201`, path validated by `resolve_under_root` at `project_fs.rs:113-137`) → content stored in `documentWorkspace` → `EditorSurface.svelte` picks surface by kind/mode → `RichEditor` converts markdown→HTML→TipTap JSON (`serialization.ts`) or `SourceEditor` mounts CodeMirror.

**Save a document:**
editor `onUpdate` → `updateActiveContent` (dirty flag) → `saveActiveDocumentContent` (`documents.ts:651`) → `writeDocumentToDisk` via project-files facade → `invoke('write_project_file')` → `project_fs::write_file` (`project_fs.rs:243`) → version snapshot optional via `save_version` (`.fractalknow/versions/`, `project_fs.rs:382`).

**Native menu action:**
`menu.rs` MENU_SPEC item clicked → `on_menu_event` → `app.emit("ok:menu-action")` (`lib.rs:689-693`) → `bridge.ts:243` subscription → `recordMenuAction` (`desktop-events.ts:89`) → `handleMenuAction` (`menu-actions.ts`) → command id → `runCommandById` (`commands.ts`).

**External file change:**
`notify` debouncer (250 ms) → `ok:project-files-changed` (`project_watch.rs:52-94`) → project-files facade listener (`project-files.ts:375`) → `reconcileExternalFileChanges` (`documents.ts`).

**Collaboration:**
`RichEditor` → `startCollabSession` (`collab.ts:83`) → y-indexeddb offline cache always; `HocuspocusProvider` only when `desktop_config.collabUrl` is set → awareness users mirrored into `collabState`.

## Desktop Bridge Contract (summary)

- 40 commands registered in `src-tauri/src/lib.rs:758-799`; TS mirror in `lib/desktop/bridge.ts:235-356` and types in `lib/desktop/types.ts` (302 lines).
- Serde uses `rename_all = "camelCase"`; bridge normalizers tolerate snake_case (`bridge.ts:65-84`).
- Event channels: `ok:project:switched`, `ok:menu-action`, `ok:deep-link`, `ok:update-status`, `ok:server-status`, `ok:crash-invite`, `ok:consent-required`, `ok:terminal-data`, `ok:terminal-exit`, `ok:project-files-changed`.
- Runtime detection: `createDesktopBridge()` tries the Tauri bridge and falls back to a browser-preview stub that returns `unsupported(...)` markers (`bridge.ts:481-489`). `UnsupportedDesktopFeature = { ok: false, reason: 'not-implemented', feature }` is a first-class payload shape both sides understand.
- Full contract: `docs/desktop-bridge.md`.

## Conventions a New Agent Must Know

1. **Svelte 5 runes everywhere**: `$props()`, `$state`, `$derived`, `$effect` (e.g. AppShell.svelte:48-80). No legacy `<script>` export props.
2. **Sass is indented syntax with tabs** — never write `{ }`/`;` in `<style lang="sass">` blocks. No hex/rgb/hsl outside `_tokens.sass`/`_mixins.sass`; enforced by `pnpm run lint:tokens` (`scripts/lint-tokens.mjs:9-13`). Components consume `var(--ok-*)` custom properties published by `global.sass`.
3. **Test taxonomy by filename**: `*.unit.test.ts` (pure stores/services) vs `*.component.test.ts` (Testing Library + jsdom) vs `tests/e2e/*.spec.ts` (Playwright, port 1420). Vitest aliases `$app/environment` to `src/test/app-environment.ts` (`vitest.config.ts:11`). Rust tests live in `#[cfg(test)]` modules inside each `.rs` file.
4. **Store layer pattern**: Svelte `writable`/`derived` stores + exported setter functions (no direct `.set` from components). Preferences and app-config persist to `localStorage` under `fractalknow:*` keys and mirror to native `app-config.json` when the bridge is ready.
5. **Bridge discipline**: anything platform-specific goes through `$lib/desktop` (or the lazy `$lib/editor/project-files` facade); new native features need (a) a Rust `#[tauri::command]` in `lib.rs`, (b) a TS method on `OkDesktopBridge` + normalizer, (c) a browser-preview fallback, (d) capability review in `src-tauri/capabilities/default.json`.
6. **Bridge invoke argument shape matters**: multi-arg commands take a single options object (`{ opts }`) or exact parameter names — see comment at `lib.rs:369` and `bridge.ts:265-267`.
7. **State initialization has import-time side effects**: `lib/shell/store.ts:39-46` reads `window.location.hash` and may call `openDocument` at module evaluation. Import order is load-bearing; tests must account for it.
8. **Menu ids are a contract**: Rust `MENU_SPEC` (`menu.rs:28-`), TS `OkMenuAction` union (`types.ts:5-50`), command ids in `commands.ts`, and enablement map in `menu-enablement.ts` must stay in sync; `lib.rs:810-851` has consistency tests.
9. **Path safety is centralized in Rust**: all project-relative paths pass `normalize_relative`/`resolve_under_root` (`project_fs.rs:95-137`); frontend must send relative `/`-prefixed paths, never absolutes.
10. **`open-knowledge-main/` is READ-ONLY reference material** — consult for parity decisions, never import from it, never modify it, exclude it from every scan.
11. **Env-driven desktop config**: `FRACTALKNOW_*` env vars and `--initial-doc=` arg shape `desktop_config` (`lib.rs:465-501`) — used by e2e/smoke harnesses.
12. **Documentation lives in-repo**: `REMAINING_MIGRATION_TASKS.md` is the source-of-truth checklist; `docs/` holds audit/decision docs that new agents should update rather than duplicate.

## Common Tasks

| Task | Command |
|---|---|
| Dev (web preview) | `pnpm dev` (port 1420, strict) |
| Dev (desktop) | `pnpm tauri dev` |
| Typecheck | `pnpm check` |
| Unit tests | `pnpm run test:unit` |
| Component tests | `pnpm run test:component` |
| E2E | `pnpm run test:e2e` |
| Rust tests | `cargo test` (in `src-tauri/`) |
| Token lint | `pnpm run lint:tokens` |
| Sass smoke | `pnpm run test:sass` |
| Bundle audit | `pnpm build && pnpm run audit:bundle` |

## Where to Look

| I want to... | Look at... |
|---|---|
| Add a native command | `src-tauri/src/lib.rs` (handler + registration), mirror in `src/lib/desktop/bridge.ts` + `types.ts` |
| Add a shell command/palette entry | `src/lib/shell/commands.ts`, tags in `command-palette-tags.ts` |
| Add a native menu item | `src-tauri/src/menu.rs` MENU_SPEC + `types.ts` OkMenuAction + `menu-actions.ts` + `menu-enablement.ts` |
| Change document load/save | `src/lib/shell/documents.ts` + `src/lib/editor/project-files.ts` + `src-tauri/src/project_fs.rs` |
| Change markdown⇄editor conversion | `src/lib/editor/serialization.ts` (canonical), preview tweaks in `components/editor/markdown.ts` |
| Add a dialog | `src/lib/components/DialogHost.svelte` + `DialogKind` in `shell/types.ts` |
| Change theme/tokens | `src/lib/styles/_tokens.sass`, `global.sass`; verify with `lint:tokens` |
| Add editor mode surface | `src/lib/components/EditorSurface.svelte` (mode switch), `EditorMode` in `shell/types.ts` |
| Touch collaboration | `src/lib/editor/collab.ts`, `extensions.ts`, `components/editor/CollabStatus.svelte` |
| Update migration progress | `REMAINING_MIGRATION_TASKS.md` + `src/lib/migration/tasks.ts` (keep in sync) |

## Known Structural Risks (see findings doc for evidence)

- Circular-ish dependency `lib/shell/documents.ts` ⇄ `lib/editor/project-files.ts`, kept safe only by lazy dynamic imports.
- `lib/shell/store.ts` module-level side effects at import time.
- Two divergent `marked` configurations (editor load path vs preview path).
- Unused UI components (`ui/DropdownMenu.svelte`, `ui/Popover.svelte`) and several unused npm/Cargo dependencies.
- Updater endpoints/pubkey empty in `tauri.conf.json`; `simulate_panic` test command shipped in release builds.
