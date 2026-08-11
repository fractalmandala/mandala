---
id: sp-plan-2026-07-15-fractalmedia-two-stream-implementation
title: "Superpowers Plan: 2026-07-15-fractalmedia-two-stream-implementation"
type: archive
tags: [superpowers, plan, history]
updated: 2026-07-15
---

> **Historical superpowers implementation plan — kept as reference.**


- **Repo:** `apps/fractalengine` in the Fractals monorepo
- **Module id:** `media` (template name **fractalMedia**), directory `src/lib/modules/media/`
- **Agent A — UI Stream:** layout, sidebar tree, grid, inspector, state, undo, contributions, styles
- **Agent B — Data/Engine Stream:** IPC contract implementations, Rust commands, thumbnail/metadata/watch engine, annotations DB, search index, mock parity

## 1. Read this first

This document is the complete working brief for two agents operating in parallel. No separate role prompt is required.

If the user tells you **"You are Agent A, complete your tasks,"** execute only the sections marked **Agent A**. If the user tells you **"You are Agent B, complete your tasks,"** execute only the sections marked **Agent B**.

Regardless of role, read this entire document before editing. The shared contract (§4), file-ownership matrix (§5), and handoff requirements (§9) apply to both agents. Phase 0 freezes the contract both streams build against; after Phase 0, neither agent may change a frozen file unilaterally — a needed contract change is a blocker to report, not an edit to make.

Work independently. Do not wait for the other agent except at the dependencies this document names. When your role is complete, provide the required handoff and stop. Integration (§8) is a separate assignment.

Both agents obey `AGENTS.md` in full: two-layer tokens only, Svelte 5 runes only, indented SASS with no `<style>` blocks, single IPC gateway, custom color pickers, undo boundaries, documentation integrity (rule 10), settings/contributions check (rule 11), audit completeness (rule 12), and the hostile-HTML boundary (rule 13).

## 2. What is being built

An Eagle-inspired media manager as a first-class fractalengine template module:

1. **Left sidebar** — library roots (real folders the user picks from their local drive) and the folder tree inside each root. Users can add/remove roots and create, rename, move (drag-organize), and delete folders. These are **real filesystem operations on real disk folders** — no import step, no virtual library. Deletion routes to the OS trash.
2. **Middle area** — a virtualized thumbnail grid of the media files (images, videos, gifs) in the selected folder. Grid niceties: thumbnail-size slider, uniform/masonry toggle, hover preview for videos and gifs, multi-select (click, shift-range, cmd-toggle), sort options.
3. **Right sidebar** — inspector for the selected item(s): large preview, file facts (name, kind, dimensions, size, dates, duration for video), EXIF subset for photos, plus **editable tags and a star rating**, stored in an app-side SQLite annotations DB keyed by file path (never written into the user's files).
4. **Toolbar/search** — filename + tag search scoped to the library, filters by kind (image/video/gif) and extension, wired into the existing `searchAll`/`indexDocuments` engine with a new `media` search source.

**Native-first mandate from the user:** everything must actually work in the real Tauri app against the real filesystem. The browser mock (`ipc-mock.ts`) is maintained solely because AGENTS.md rule 7 and `tests/unit/ipc-contract.test.ts` require parity so `pnpm dev` keeps working; it is a contract obligation, not the deliverable. Final acceptance runs in `pnpm tauri dev` against a real folder of media.

### Architecture decisions locked in (write the ADR from these, §10)

- **D1 — Real watched folders, not a virtual library.** Roots are user-selected directories registered through the ADR-018 containment mechanism (`register_authorized_path`); every media command validates containment. A `notify`-based debounced watcher emits change events so the UI reconciles external edits.
- **D2 — Annotations sidecar DB.** Tags/ratings live in `media.sqlite` in the app data dir (reuse the existing `rusqlite` dependency and `storage.rs` conventions). Keyed by absolute path; a watcher rename event migrates the key. User files are never modified.
- **D3 — Split thumbnail pipeline.** Images and gif first-frames are thumbnailed Rust-side with the `image` crate into a disk cache (`<app-data>/media-thumbs/<sha1(path+mtime)>.jpg`). Video thumbnails are captured **webview-side** (asset-protocol URL → `<video>` seek → canvas → bytes) and persisted through IPC into the same cache — this avoids bundling ffmpeg. Video duration/dimensions come from the webview `loadedmetadata` event and are cached in the annotations DB.
- **D4 — Asset protocol for previews.** Full-size media renders via Tauri's asset protocol; roots are added to the asset-protocol scope dynamically when registered. The mock returns bundled fixture URLs from the same API (`mediaAssetUrl`).
- **D5 — Undo semantics.** Reversible fs ops (create folder, rename, move) get inverse-operation undo entries inside `UndoHistory.transact()`. Annotation edits (tags, rating) and UI-editable state (grid layout, thumb size, selection-independent panel widths) are snapshot-undoable. **Delete is confirm-dialog-gated and not in-app-undoable** (it goes to OS trash, whose restore is not portable); the confirm dialog states this. Document this exception in the ADR.

## 3. Authorized scope

### Included (v1)

Everything in §2, plus: contributions (commands, header actions, keybindings) via the registry; a `media` entry in `SettingsDialog` is **manual** per rule 11 (default grid layout, thumbnail quality, watcher toggle); routing/design/ADR docs and `docs/INDEX.md` regeneration; unit tests listed per stream.

### Explicitly excluded (report as blocker if it seems necessary)

- Import/copy-into-library flows, duplicate detection, content hashing
- Editing media (crop/rotate/convert), AI auto-tagging, face/object detection
- Smart folders / saved searches, color-palette extraction, batch export
- Cloud sync, sharing, multi-window
- ffmpeg or any new sidecar binary
- Writing metadata into user files (EXIF/XMP writes)

## 4. Phase 0 — Frozen contract (operator or first agent, once, before parallel work)

Create and commit these files on the working branch before either stream begins. Both agents treat them as read-only afterward.

### 4.1 `src/lib/modules/media/types.ts` — shared domain types

```ts
export type MediaKind = 'image' | 'video' | 'gif';

export interface MediaRoot { id: string; path: string; name: string; }

export interface MediaFolder {
	path: string;            // absolute
	name: string;
	rootId: string;
	children: MediaFolder[];
	mediaCount: number;      // direct children only
}

export interface MediaItem {
	path: string;            // absolute; stable id within a session
	name: string;
	kind: MediaKind;
	ext: string;
	size: number;            // bytes
	modifiedMs: number;
	width?: number;
	height?: number;
	durationMs?: number;     // video only, filled lazily via D3
	thumbnail?: string;      // asset/cache URL, filled lazily
}

export interface MediaExif {
	// flat, display-ready subset; engine decides which keys exist
	[key: string]: string;
}

export interface MediaAnnotations {
	path: string;
	tags: string[];
	rating: 0 | 1 | 2 | 3 | 4 | 5;
}

export type MediaSort = 'name' | 'modified' | 'size' | 'kind' | 'rating';

export interface MediaListOptions {
	sort: MediaSort;
	descending: boolean;
	kinds?: MediaKind[];     // filter; undefined = all
}

export type MediaFsEventKind = 'created' | 'removed' | 'renamed' | 'modified';

export interface MediaFsEvent {
	kind: MediaFsEventKind;
	path: string;
	newPath?: string;        // renamed only
	isDirectory: boolean;
}
```

### 4.2 IpcApi additions — signatures appended to `interface IpcApi` in `src/lib/ipc.ts`

Reuse existing members where they already fit: `renameFile`, `copyPath`, `searchAll`, `indexDocuments`, `removeIndexedDocuments` (add `'media'` to the `SearchSource` union). New members:

```ts
// fractalMedia
mediaListRoots(): Promise<MediaRoot[]>;
mediaAddRoot(): Promise<MediaRoot | null>;              // native dir picker + ADR-018 registration + asset-scope grant
mediaRemoveRoot(rootId: string): Promise<void>;         // forgets root + prunes its annotations/index/thumbs
mediaListTree(rootId: string): Promise<MediaFolder>;    // full folder tree for one root
mediaListItems(folderPath: string, opts: MediaListOptions): Promise<MediaItem[]>;
mediaCreateFolder(parentPath: string, name: string): Promise<void>;
mediaMoveEntry(sourcePath: string, destDirPath: string): Promise<string>; // returns new path
mediaDeleteEntry(path: string): Promise<void>;          // OS trash, never permanent unlink
mediaGetThumbnail(path: string, maxEdge: number): Promise<string>;        // URL; Rust-side for image/gif
mediaSaveVideoThumbnail(path: string, jpegBase64: string): Promise<string>; // persists webview capture, returns URL
mediaGetExif(path: string): Promise<MediaExif>;
mediaGetAnnotations(paths: string[]): Promise<MediaAnnotations[]>;
mediaSetAnnotations(annotations: MediaAnnotations[]): Promise<void>;      // batch; one call per user gesture
mediaListAllTags(): Promise<string[]>;                  // for tag autocomplete
mediaAssetUrl(path: string): string;                    // sync, like templateIdToMenuId
mediaSetVideoProbe(path: string, width: number, height: number, durationMs: number): Promise<void>;
onMediaFsEvent(callback: (event: MediaFsEvent) => void): () => void;
```

Folder rename uses the existing `renameFile` (it already handles directories and containment). Update the `_ipcApiCheck` object in the same commit so `ipc.ts` still typechecks with `throw new Error('not implemented')` stubs — Agent B replaces the stubs.

### 4.3 Fixture assets

Add `static/media-fixtures/` with ~12 small committed files: 6 images (mix of jpg/png with EXIF where possible), 2 gifs, 2 short mp4/webm videos, nested in two subfolders. Both the mock engine (Agent B) and any UI screenshots (Agent A) use these. Keep total under ~3 MB.

### 4.4 Commit

Commit 4.1–4.3 as `feat(media): freeze fractalMedia IPC contract and fixtures`. Parallel work may then begin.

## 5. File-ownership matrix

| Path | Owner |
|---|---|
| `src/lib/modules/media/types.ts` | **Frozen** (Phase 0) |
| `src/lib/ipc.ts` — `IpcApi` interface + type unions | **Frozen** (Phase 0) |
| `static/media-fixtures/` | **Frozen** (Phase 0) |
| `src/lib/modules/media/components/`, `state/`, `styles/`, `contributions.ts` | Agent A |
| `src/lib/data/templates.ts`, `src/routes/+page.svelte`, `src/routes/+layout.svelte`, `src/lib/styles/index.sass`, `src/lib/components/SettingsDialog.svelte` | Agent A |
| `docs/routing/` + `docs/design/` entries for the above; ADR authored jointly at integration | Agent A (UI docs) |
| `src/lib/ipc.ts` — implementations of the new members | Agent B |
| `src/lib/ipc-mock.ts` | Agent B |
| `src-tauri/src/media.rs` (new), `src-tauri/src/lib.rs` (registration + shared state), `Cargo.toml`, `tauri.conf.json` / capabilities | Agent B |
| `tests/unit/ipc-contract.test.ts`, new `tests/unit/media-engine.test.ts` | Agent B |
| `tests/unit/media-state.test.ts` (new), `tests/unit/contribution-contracts.test.ts` extension | Agent A |

No file appears in both columns. If your work seems to require editing the other agent's file, stop and report it in your handoff.

## 6. Agent A — UI Stream

Until integration, run against the mock: `pnpm dev` in the browser gives you the full contract via `ipc-mock.ts`. Until Agent B's B1 lands you may stub `ipc-mock` responses **in your own state layer only** (a `TODO(media-integration)` fixture branch inside `media.svelte.ts`), never by editing `ipc-mock.ts`.

### A1 — Scaffold and mounting

- `src/lib/data/templates.ts`: add `'media'` to `AppTemplateId`; add gallery entry `{ id: 'media', name: 'fractalMedia', summary: 'Local images, videos, and gifs — organized.', image: 'module-media.svg', tiles: [{ kind: 'editor', x: 40, y: 40, w: 800, h: 500 }] }` (mirror the bookmarks entry). Add `module-media.svg` beside the other gallery images.
- `src/routes/+page.svelte`: lazy-import branch for `activeTemplateId === 'media'` → `MediaLayout.svelte`, with the same loading/failure panels the bookmarks branch has.
- `src/routes/+layout.svelte`: `import '$lib/modules/media/contributions';` beside designer/ai.
- Empty-shell `MediaLayout.svelte` renders three panes; styles in `src/lib/modules/media/styles/_media.sass`, imported from `src/lib/styles/index.sass`. Semantic tokens only.

### A2 — State module

`src/lib/modules/media/state/media.svelte.ts` — a runes class singleton (mirror `bookmarks.svelte.ts`):

- `roots`, `treeByRoot`, `activeFolderPath`, `items`, `selection: Set<string>`, `anchorPath` (for shift-range), `query`, `kindFilters`, `sort`, `thumbSize`, `layout: 'grid' | 'masonry'`, `annotationsByPath`, `loading`/`error` flags.
- All IPC through `$lib/ipc`. Optimistic mutations reconciled by `onMediaFsEvent` subscription (created/removed/renamed/modified → patch tree, items, selection, annotations key migration).
- Undo: register a media domain via `registerUndoDomain` (see `undoHistory.svelte.ts` and ADR-026). Snapshot covers annotations edits, selection-independent UI state (thumb size, layout, sort, filters), and folder-op inverses per D5. Every mutation entry point wraps in `transact()`. Composite gestures (e.g. move N selected files into a folder) are one atomic entry.
- Persistence: active folder, thumb size, layout, sort persisted the same way other modules persist layout state (follow `design.svelte.ts` precedent).

### A3 — Left sidebar (`MediaSidebar.svelte`)

- Roots section with "Add Folder…" (calls `mediaAddRoot`), per-root remove (confirm dialog; explains annotations for that root are forgotten).
- Recursive folder tree (own light component; follow `TreeNode.svelte` interaction conventions — disclosure, inline rename on double-click/F2, context menu: New Folder, Rename, Delete, Reveal in grid).
- Drag-and-drop: folders onto folders (`mediaMoveEntry`), grid items onto folders (move files). Keyboard accessible per ADR-014 conventions.
- Delete = confirm dialog ("Moves to Trash — cannot be undone from the app") → `mediaDeleteEntry`.

### A4 — Middle grid (`MediaGrid.svelte`, `MediaCard.svelte`, `MediaToolbar.svelte`)

- Virtualized grid — reuse/extend `VirtualList.svelte` if its row model fits a fixed-row grid; otherwise implement windowed rendering inside `MediaGrid` (justify choice in routing doc). Must stay smooth at 5k items.
- `MediaCard`: thumbnail via `mediaGetThumbnail` (lazy, `IntersectionObserver`), kind badge, name, rating stars overlay. **Video/gif cards:** on hover, gif plays (swap to `mediaAssetUrl`), video scrubs a muted inline preview. On first video render, if `durationMs`/thumbnail missing, run the D3 capture (asset URL → hidden `<video>` → canvas → `mediaSaveVideoThumbnail` + `mediaSetVideoProbe`).
- Toolbar: search input (debounced; filename match locally + `searchAll` for tag hits), kind filter chips, sort menu, thumb-size slider, uniform/masonry toggle. All of these are user-editable state → undo-wrapped.
- Multi-select: click, shift-range via anchor, cmd/ctrl-toggle, cmd-A within folder, Escape clears. Selection drives the inspector.
- No `{@html}` anywhere in the grid; if a highlight snippet from search is ever rendered, route through `$lib/sanitizeHtml`.

### A5 — Right inspector (`MediaInspector.svelte`)

- Single selection: preview (image, or `<video controls>` via asset URL), facts table (name — inline-renamable, kind, dimensions, size, modified, duration), EXIF section (collapsible, from `mediaGetExif`), tags editor (token input with autocomplete from `mediaListAllTags`), star rating control.
- Multi selection: count summary, shared-tags editing (add tag to all, remove common tag), batch rating. One `mediaSetAnnotations` batch call per gesture, one undo entry.
- Empty selection: folder summary (counts by kind).

### A6 — Contributions and settings

- `contributions.ts` with `scope: 'media'`: commands (`media.addRoot`, `media.newFolder`, `media.focusSearch`, `media.toggleLayout`, `media.deleteSelection`, `media.selectAll`), header actions (Add Folder, New Folder, layout toggle), keybindings following existing conventions. Extend `contribution-contracts.test.ts` only if you introduce a new contribution TYPE (you should not need to).
- `SettingsDialog.svelte`: manual `media` section — default sort, default layout, thumbnail max edge, watcher on/off.

### A7 — Tests, docs, handoff

- `tests/unit/media-state.test.ts`: selection semantics (range/toggle/clear), fs-event reconciliation (renamed migrates selection + annotation keys; removed prunes), undo atomicity for a composite move, filter/sort derivations.
- Rule 10 docs: routing docs for every new component/state file (`app-documenter` skill), design docs for new styles (`styling-docs-builder`), regenerate `docs/INDEX.md` rows (`doc-frontmatter`).
- Quality gates: `pnpm check` clean; unit suites green; `pnpm dev` browser walkthrough of every flow against the mock; rule 12 mutation inventory in the handoff.

## 7. Agent B — Data/Engine Stream

### B1 — Mock engine first (unblocks Agent A; ~first commit)

In `ipc-mock.ts`, implement every §4.2 member against an in-memory tree seeded from `static/media-fixtures/` (reuse the mock filesystem conventions already present; folder ops mutate the in-memory tree; `onMediaFsEvent` fires synthetic events after each mutation so Agent A can build reconciliation). `mediaAssetUrl` returns the `/media-fixtures/...` static URL. Annotations in a `Map`, persisted to `localStorage` like other mock state. This is a contract obligation (rule 7 / ADR-028), not the product — do not gold-plate it.

### B2 — Rust scaffold: roots, tree, listing, fs ops

- New `src-tauri/src/media.rs`; register commands in `lib.rs` `generate_handler`. Shared `MediaState` (managed state): roots, watcher handles, sqlite connection.
- `Cargo.toml` additions: `notify` + `notify-debouncer-mini`, `image`, `kamadak-exif`, `trash`, `sha1_smol` (or reuse an existing hash dep). No ffmpeg.
- `media_add_root`: `rfd` directory picker → `register_authorized_path` (ADR-018) → add to asset-protocol scope (`app.asset_protocol_scope().allow_directory(path, true)`) → persist roots via `storage.rs` conventions → start watcher.
- `media_list_tree` / `media_list_items`: walk dirs, classify by extension (`jpg/jpeg/png/webp/avif/heic` image; `gif` gif; `mp4/mov/webm/mkv/m4v` video), skip hidden files, return contract shapes. Image dimensions read cheaply from headers (`image::io::Reader::into_dimensions`).
- `media_create_folder`, `media_move_entry`, `media_delete_entry` (via `trash::delete`). **Every path argument on every command validates ADR-018 containment**; write the same style of containment unit tests that exist in `lib.rs` (`contains_existing_and_new_paths_to_an_authorized_root`).
- Enable/scope the asset protocol in `tauri.conf.json` + capabilities as required by Tauri 2.

### B3 — Thumbnails, EXIF, annotations DB

- `media_get_thumbnail`: cache hit → return cache path (as asset URL); miss → decode, `thumbnail(maxEdge)`, encode jpeg quality ~80 into `<app-data>/media-thumbs/<sha1(path|mtime)>.jpg`. Gif: first frame. Corrupt/unsupported → typed error the UI renders as a fallback tile.
- `media_save_video_thumbnail` / `media_set_video_probe`: persist webview capture into the same cache; probe results into sqlite so subsequent `media_list_items` fills `width/height/durationMs`.
- `media_get_exif` via `kamadak-exif`: curated display-ready subset (camera, lens, exposure, ISO, focal length, taken-at, GPS presence as yes/no only). Errors → empty object, never a crash.
- `media.sqlite` per D2: `annotations(path PRIMARY KEY, tags TEXT json, rating INTEGER)`, `video_probe(path PRIMARY KEY, w, h, duration_ms)`. Batch get/set. Rename migration helper used by the watcher.

### B4 — Watcher and events

- Debounced (`~300ms`) recursive watcher per root; map notify events → `MediaFsEvent`, emit as Tauri event `media://fs-event`; `onMediaFsEvent` in `ipc.ts` subscribes like `onAiChunk` does.
- Rename events migrate sqlite annotation/probe keys and thumbnail-cache keys.
- Root removal stops the watcher, prunes sqlite rows, thumbs, and index docs for that root.

### B5 — Search integration

- Add `'media'` to the `SearchSource` union (frozen file — this specific union addition is part of the Phase 0 commit; verify it's there, don't re-edit).
- Index items on root add and on watcher events: doc id = path, title = filename, body = tags. Search results resolve back to `MediaItem`s for the toolbar's tag-search path.

### B6 — Contract tests, docs, handoff

- Extend `tests/unit/ipc-contract.test.ts`: name parity for all new members (no `NATIVE_ONLY` entries — every member has a mock implementation), mock behavior tests (folder round-trip: create → move → rename → delete emits correct events; annotations batch round-trip; containment-style path-escape rejection in the mock).
- `tests/unit/media-engine.test.ts` for pure-TS engine logic (extension classification, event mapping) if any lives outside Rust; Rust logic gets `#[cfg(test)]` tests in `media.rs` (containment, cache-key stability, rename migration).
- `cargo test` and `pnpm check` green. Routing docs for `ipc.ts`/`ipc-mock.ts` changes updated; regenerate `docs/INDEX.md` rows.
- Handoff (§9) including: command list, error taxonomy, event timing/debounce behavior, and any contract deviations proposed (as blockers, not edits).

## 8. Integration (separate assignment; do not self-start)

1. Merge both streams; delete Agent A's `TODO(media-integration)` fixture branch in `media.svelte.ts` if still present.
2. `pnpm check`, full unit suite, `cargo test`.
3. Real-app verification via the `run-fractalengine` skill, then `pnpm tauri dev` against a real local folder containing images/videos/gifs: add root → browse tree → grid renders thumbs → hover previews → rename/move/create/delete folders (watch the real disk change) → external change in Finder reflects in-app → tag + rate → search by tag → undo/redo each reversible mutation → relaunch and confirm persistence.
4. Rule 12 audit: mutation inventory (every gesture = one atomic undo entry or a documented D5 exception), async failure/cancel/out-of-order exercises (slow thumbnail, mid-scan folder switch, teardown during capture), malformed-data fixtures (corrupt image, zero-byte video, unicode/emoji filenames, path with `'`), `git diff --check`.
5. Write `docs/adr/ADR-029-fractalmedia-real-folder-media-library.md` from D1–D5 (`adr-writing` skill); final `docs/INDEX.md` regeneration; settings/contributions check (rule 11).

## 9. Handoff format (both agents)

End your run with: (a) commit list; (b) what works, demonstrated how (which test/walkthrough); (c) mutation inventory for your surface; (d) known gaps ordered by risk; (e) blockers, including any frozen-contract change you need; (f) exact files touched, confirming ownership-matrix compliance.

## 10. Dependencies between streams (the only legitimate waits)

- Agent A's A2+ reconciliation work needs Agent B's **B1 mock** for real event flows; before that, A1 and static layout proceed on the local fixture branch.
- Agent B needs nothing from Agent A at any point.
- Both need Phase 0 complete.