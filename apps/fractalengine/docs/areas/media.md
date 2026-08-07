---
id: media
title: Media Area
type: area
tags: [media, library, gallery, modules]
relates_to: [media-module-plan, ADR-018, ADR-026, ADR-027, ADR-048]
summary: Covers modules/media/** — the owned-library media manager (fractalMedia), constrained to ~/Documents/Gallery/Fracta with native catalog, import engine, watcher, media UI, and undo boundary.
updated: 2026-07-22
---

# Media Area

## Purpose & boundaries

The Media area is the Eagle-inspired image/gif/video manager in `src/lib/modules/media/`. The app owns exactly one **library folder** on disk: `~/Documents/Gallery/Fracta`. Everything added is copied (or moved) into it. The library mirrors real folders 1:1 — no blob store. Native initialization, restoration, and activation reject all other roots, so media mutations cannot affect sibling folders in `Gallery`.

**Status: complete.** The frozen contract exists (`types.ts`, `media*` members on `IpcApi`, fixtures in `static/media-fixtures/`), and `ipc-mock.ts` mirrors the complete surface for browser development. The native Rust engine owns the fixed library root, SQLite catalog, import/collision/preflight flow, thumbnail cache, OS Trash integration, asset access, search indexing, and courtesy watcher. The UI supplies the PaneForge shell, setup flow, smart sidebar, row-windowed grid, inspector, Tauri Finder-drop intake, video capture, media-domain undo, contribution registrations, IDE context-menu consumer, and media settings.

## Contract surface (frozen)

- **Domain types**: `modules/media/types.ts` — `MediaItem` (ULID identity), `MediaFolder`, `MediaQuery`/`MediaScope` (folder, smart sections, tag), `MediaImportProgress`, `MediaFsEvent`, and the `MEDIA_EXTENSIONS` classification table (D5).
- **IPC**: `media*` members in `ipc.ts`'s `IpcApi` (§4.2 of the plan), including `mediaPickImportSources('files' | 'folder')` for header import actions. The UI sends picked paths to `mediaImport` using the active folder (or library root) and persisted default copy/move mode.
- **Search**: `'media'` added to the `SearchSource` union; indexed at import and on watcher events.

## State & persistence

- **Media State**: `state/media.svelte.ts` runes singleton — scope, items, selection, imports, persisted view preferences, and undo domain via `registerUndoDomain` (ADR-026). Rename, move, folder creation, tags, pins, and view settings are transaction-backed; import and OS Trash are the documented exceptions.
- **Catalog**: `media.sqlite` in app data — ID-keyed items/tags/pins, library-relative paths (plan D2).
- **Pane layout**: `MediaLayout.svelte` supplies its library navigation, grid, and inspector to `WorkspaceShell` under the `media` profile; the profile persists surface sizes and collapsed state.

## Extension points

- **Contributions**: `modules/media/contributions.ts` — commands, header actions, keybindings, and the cross-module "Add to Gallery" context-menu contribution (plan D8).

## Cross-area edges

- **IDE**: file-tree context menu hosts the v1 "Add to Gallery" consumer.
- **Data layer**: search index (`searchAll`/`indexDocuments`) per ADR-027; fixed owned-root containment per ADR-048.

## File table

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`MediaCard.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/media/components/MediaCard.svelte) | MediaCard.svelte |
| [`MediaGrid.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/media/components/MediaGrid.svelte) | MediaGrid.svelte |
| [`MediaInspector.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/media/components/MediaInspector.svelte) | MediaInspector.svelte |
| [`MediaLayout.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/media/components/MediaLayout.svelte) | MediaLayout.svelte |
| [`MediaProgressStrip.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/media/components/MediaProgressStrip.svelte) | MediaProgressStrip.svelte |
| [`MediaSidebar.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/media/components/MediaSidebar.svelte) | MediaSidebar.svelte |
| [`MediaToolbar.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/media/components/MediaToolbar.svelte) | MediaToolbar.svelte |
| [`contributions.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/media/contributions.ts) | contributions.ts |
| [`media.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/media/state/media.svelte.ts) | media.svelte.ts |
| [`_media.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/media/styles/_media.sass) | _media.sass |
| [`types.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/media/types.ts) | fractalMedia shared domain types — FROZEN Phase 0 contract. |

<!-- filetable:end -->

## Gotchas

- The frozen contract files (`types.ts`, `IpcApi` members, fixtures) must not be edited unilaterally — a needed change is a blocker to report (plan §1).
- `static/media-fixtures/shapes/readme.txt` is deliberately non-media: import-walker skip-count fixtures depend on it.
