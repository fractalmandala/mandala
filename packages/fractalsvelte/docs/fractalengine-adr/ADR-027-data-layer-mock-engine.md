---
id: ADR-027
title: Data Layer — In-Memory Mock Engine & Search Index
type: adr
tags: [data-layer, search, bookmarks, mock-engine, ipc]
summary: Replaces Tauri-only IPC stubs with a real in-memory mock engine supporting FTS-like search over notes and bookmarks, plus a full Bookmarks CRUD module on the frontend side.
relates_to: [ADR-004, ADR-015, ADR-021, ADR-022, ADR-024, ADR-026, src/lib/ipc-mock.ts, src/lib/modules/bookmarks/]
status: accepted
updated: 2026-07-15
---


**Status:** Accepted

## Context

The project has two runtime modes: desktop (Tauri) and `pnpm dev` (browser-only). All file-system and kernel operations go through the single IPC gateway (`src/lib/ipc.ts`), which delegates to Tauri commands when available and to `src/lib/ipc-mock.ts` in dev mode.

Before this ADR, the mock stubs for the data-layer operations (search, bookmark CRUD) were empty placeholders that threw errors or returned `[]`. As the product grows toward mail, a client-side search surface, and richer offline support, these stubs needed to be replaced with a real in-memory engine that provides the same semantics the Tauri backend will eventually guarantee.

## Decision

### 1. Real In-Memory Mock Engine

The mock functions in `ipc-mock.ts` now implement the full contract:

- **In-memory Maps** — `mockSearchIndex` (`Map<"source:docId", MockSearchDoc>`) and `mockBookmarks` (`Map<id, Bookmark>`).
- **Id generation** — `bm_` prefix + `Date.now()` + 6-char random suffix.
- **`searchAll`** — case-insensitive AND token matching over title + body. Each result is scored by naive term-frequency. Snippets are generated as a 12-word window around the first matching term, with `«»` markers that the UI renders as highlights.
- **`indexDocuments`** — delete-then-insert per `(source, docId)` pair, so reindexing never duplicates.
- **`removeIndexedDocuments`** — delete by source + docId list.
- **Bookmarks CRUD** — `listBookmarks`, `addBookmark`, `updateBookmark`, `deleteBookmark` all work on the in-memory map AND automatically upsert/remove the corresponding `mockSearchIndex` entry so bookmarks are immediately searchable.

### 2. Search Surface (`src/lib/components/SearchOverlay.svelte`)

A global search overlay component:

- Opened via the `core.searchEverything` command (`Cmd+Shift+F`).
- Debounced `searchAll` (300ms).
- Results rendered in a `VirtualList` (generic windowed list component).
- `«»` markers rendered as `<mark>` highlight spans.
- Enter opens a hit: notes navigate to the Notes template and open the file; bookmarks navigate to the Bookmarks template.
- Esc closes.

### 3. Generic VirtualList (`src/lib/components/VirtualList.svelte`)

A reusable windowed list:

- Props: `items`, `rowHeight`, `renderItem` (returns HTML string), `onItemSelect`, `containerClass`.
- Keyboard-navigable (ArrowUp/Down, Enter, Home, End).
- No `<style>` blocks — uses semantic tokens only.
- Designed to be reused by Mail and other modules.

### 4. Notes Indexing Hooks

The `notes.svelte.ts` state module now automatically indexes notes:

- **On save** — after a successful `flushPendingSave`, the saved note is indexed via `indexDocuments`.
- **On vault open/load** — each vault root is bulk-indexed recursively (capped at 500 files per root with a log notice).
- **Indexing failures** never break saving — wrapped in try/catch.
- **On vault switch/delete** — index entries are NOT removed (they remain until explicitly purged by the new vault's indexing pass).

### 5. Bookmarks Module (`src/lib/modules/bookmarks/`)

A full frontend module with:

- **State** (`state/bookmarks.svelte.ts`) — runes-based `BookmarksState` class with CRUD operations, `UndoHistory<Bookmark[]>` with a reconcile-diff strategy, layout persistence under `fractalengine:bookmarks-workspace` localStorage key.
- **Components** (`components/BookmarksLayout.svelte`) — single-column layout with search, tag filter chips, add/edit form, and `VirtualList` of bookmark rows. No `<style>` blocks.
- **Contributions** (`contributions.ts`) — scoped commands (`bookmarks.newBookmark`) and header actions.
- **Template** — the `bookmarks` template is registered in `templates.ts`, validators updated across `app.svelte.ts` and `canvas.svelte.ts`, id resolved in `+page.svelte`.

### 6. Undo / Redo

Bookmarks use `UndoHistory<Bookmark[]>` with a reconcile strategy:

- `capture()` deep-clones `this.items`.
- `restore(snapshot)` diffs the snapshot against the current state and calls add/update/delete IPC operations as needed, then reloads from the store.
- All mutations run inside `transact()`, so composite operations produce exactly one undo entry.

## Consequences

1. `pnpm dev` now has a fully functional search and bookmarks experience — no Tauri backend required.
2. The mock engine serves as a reference implementation and test double for the Tauri kernel team.
3. The VirtualList is generic and reusable by future modules (Mail, History, etc.).
4. Notes are indexed automatically on save and vault open — search stays current without manual refresh.
5. The bookmarks module is structurally complete: state, UI, contributions, undo, and template registration are all in place.
6. Future work (Phase 3) may include integrating the `TEMPLATE_DOMAIN` mapping in `undo.svelte.ts` and replacing the mock engine with the real Tauri backend.

## Related

- [ADR-004: Single IPC Gateway Module](./ADR-004-single-ipc-gateway-module.md)
- [ADR-015: App Template Routing](./ADR-015-app-template-routing-and-state-domains.md)
- [ADR-026: Core Undo Engine](./ADR-026-core-undo-engine.md)
- [DATA-LAYER-PLAN.md](../plans/DATA-LAYER-PLAN.md)
