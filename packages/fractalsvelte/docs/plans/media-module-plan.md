---
id: media-module-plan
title: Media Module Plan
type: plan
tags: [media, plan]
status: complete
updated: 2026-07-17
---


- **Repo:** `apps/fractalengine` in the Fractals monorepo
- **Module id:** `media` (template name **media**), directory `src/lib/modules/media/`
- **Agent A — UI Stream:** layout, sidebar tree, smart sections, grid, inspector, progress strip, state, undo, contributions, styles
- **Agent B — Data/Engine Stream:** IPC contract implementations, Rust commands, library/import engine, thumbnail/metadata pipeline, catalog DB, watcher, mock parity

> This plan supersedes the previous linked-roots version of this document in full. The core model changed on 2026-07-17: fractalMedia is now an **owned library** (Eagle-style), not a viewer over folders scattered on the user's drive.

## 1. Read this first

This document is the complete working brief for two agents operating in parallel. No separate role prompt is required.

If the user tells you **"You are Agent A, complete your tasks,"** execute only the sections marked **Agent A**. If the user tells you **"You are Agent B, complete your tasks,"** execute only the sections marked **Agent B**.

Regardless of role, read this entire document before editing. The shared contract (§4), file-ownership matrix (§5), and handoff requirements (§9) apply to both agents. Phase 0 freezes the contract both streams build against; after Phase 0, neither agent may change a frozen file unilaterally — a needed contract change is a blocker to report, not an edit to make.

Work independently. Do not wait for the other agent except at the dependencies this document names. When your role is complete, provide the required handoff and stop. Integration (§8) is a separate assignment.

Both agents obey `AGENTS.md` in full: two-layer tokens only, Svelte 5 runes only, indented SASS with no `<style>` blocks, single IPC gateway, custom color pickers, undo boundaries, documentation integrity (rule 10), settings/contributions check (rule 11), audit completeness (rule 12), and the hostile-HTML boundary (rule 13).

## 2. What is being built

An Eagle-inspired media manager as a first-class fractalengine template module. The app owns a single **library folder** on disk; everything the user adds is **copied (or optionally moved) into it**. The library is a perfectly ordinary, browsable folder of real subfolders and media files — no blob store, no opaque naming.

1. **Left sidebar** — a fixed **smart sections** block at the top (All Items, Recently Added, Untagged, Pinned, All Tags), then the **folder tree** of the library. The tree shows folders/subfolders only — never individual files. Selecting a folder or smart section drives the central grid. Users create, rename, drag-relocate, and delete folders; these are real filesystem operations inside the library.
2. **Central area** — a virtualized **uniform-grid** thumbnail view (no masonry) of the media in the selected folder or smart section. Thumbnail-size slider, hover preview for videos and gifs, multi-select (click, shift-range, cmd-toggle), sort options. At the absolute bottom of the central area sits a permanently reserved thin **progress strip** (`--sz-24` tall): empty when idle; during imports it shows progress bar, `n / total` count, percentage, current filename, cancel button. Above the grid, a `--sz-128`-tall **header band** holds the toolbar (search, filters, sort, thumb slider).
3. **Right sidebar** — inspector for the selection, **collapsed by default**. When expanded: large preview, file facts (name — inline-renamable, kind, dimensions, size, dates, duration for video), **editable tags** (token input with autocomplete) and **pin toggle**. Multi-selection: count summary, shared-tag editing, batch pin. This is the primary tagging surface.
4. **Toolbar/search** — filename + tag search scoped to the library, kind filters (image/video/gif), wired into the existing `searchAll`/`indexDocuments` engine with a new `media` search source.
5. **Cross-module "Add to Gallery"** — other modules' file-bearing surfaces (v1: the IDE file tree) offer a context-menu action that copies the file/folder into the library.

**Native-first mandate:** everything must actually work in the real Tauri app against the real filesystem. The browser mock (`ipc-mock.ts`) is maintained solely because AGENTS.md rule 7 and `tests/unit/ipc-contract.test.ts` require parity so `pnpm dev` keeps working; it is a contract obligation, not the deliverable. Final acceptance runs in `pnpm tauri dev` against a real library.

### Architecture decisions locked in (write the ADR from these, §10)

- **D1 — Owned library, real mirrored folders.** One base folder, chosen by the user at first launch via native dir picker, **defaulting to `~/Gallery/Fracta`** (create intermediate dirs as needed). The base path is persisted via `storage.rs` conventions, registered once through the ADR-018 containment mechanism, and added once to the asset-protocol scope. The tree view mirrors the real disk structure 1:1 — folders in the sidebar are real directories; if the user abandons the app their library remains an ordinary folder. Files added from elsewhere on disk **remain untouched at their origin**; the library holds copies (or the originals, if the user chose move).
- **D2 — ID-keyed catalog DB.** A `media.sqlite` in the app data dir (reuse `rusqlite` + `storage.rs` conventions) is the catalog: every item gets an app-assigned stable id (ULID) at import. Tables: `items(id PRIMARY KEY, rel_path UNIQUE, kind, ext, size, added_ms, modified_ms, w, h, duration_ms)`, `tags(item_id, tag)`, `pins(item_id PRIMARY KEY)`. Tags and pins key off the id, never the path — in-library moves/renames update `rel_path` only and can never orphan annotations. Paths stored **relative to the library base** so the library survives a base-folder relocation. User files are never modified (no EXIF/XMP writes).
- **D3 — Import engine with progress.** `mediaImport` copies (default) or moves (explicit option) source paths into a destination library folder. Folder sources are walked recursively; **only media-typed files are imported**, other files are skipped and counted. Preflight checks free disk space against the copy total and fails cleanly before starting. Progress is streamed as events (done/total counts, current file, bytes) driving the progress strip; imports are cancellable (already-imported files stay). Name collisions get a ` 2`-style suffix, never overwrite. Finder drag-drop onto a tree folder or the grid uses the same engine via Tauri v2 drag-drop events (real source paths) — **drop = copy-in**, never a move out of the user's folders.
- **D4 — Split thumbnail pipeline, no ffmpeg.** Raster images and gif first-frames are thumbnailed Rust-side with the `image` crate into a disk cache (`<app-data>/media-thumbs/<id>.jpg` — id-keyed, so renames never invalidate). Video thumbnails are captured **webview-side** (asset-protocol URL → `<video>` seek → canvas → bytes) and persisted through IPC into the same cache; duration/dimensions from `loadedmetadata`, cached in the DB. `svg` and `ico` render directly via asset URL in an `<img>` tag (never inline `{@html}` — rule 13); no rasterized thumb needed.
- **D5 — Media type policy.** Image: `png jpg jpeg webp avif heic svg ico bmp tiff`. Gif: `gif`. Video: `mp4 mov webm mkv m4v`. Classification lives in one Rust function + one mirrored TS constant in `types.ts` (frozen), used by both the import walker and the mock.
- **D6 — Deletion and undo semantics.** "Remove from gallery" trashes the **library copy** via `trash::delete` (originals elsewhere are untouched by definition) after a confirm dialog stating it cannot be undone from the app; catalog rows and thumbs are pruned. Reversible in-library fs ops (create folder, rename, move) get inverse-operation undo entries inside `UndoHistory.transact()`. Tag edits, pin toggles, and UI-editable state (thumb size, sort, filters, inspector collapse) are snapshot-undoable. Imports are cancellable but not undoable (documented exception). Composite gestures (move N selected items) are one atomic undo entry.
- **D7 — Uniform grid only.** Fixed-cell virtualized grid; row height derives from the thumb-size slider. No masonry mode anywhere in v1.
- **D8 — Cross-module Add to Gallery via contributions.** The media module registers a `media.addToGallery` command taking absolute source paths. If the contribution registry lacks a context-menu contribution TYPE, add one (and extend `contribution-contracts.test.ts` per rule 12). v1 wires exactly one consumer: the IDE file tree context menu, shown only for media files/folders. Other modules adopt it later.
- **D9 — PaneForge pane shell.** PaneForge is being adopted as the app-wide standard for resizable module layouts (BookmarksLayout is the precedent). The media module's three panes are a `PaneGroup direction="horizontal"` carrying `class="inside-module-wrapper"`, with `Pane` components for both sidebars (`class="module-sidebar"`) and the central area, separated by `PaneResizer class="vertical-sizer"` (already styled in `src/lib/styles/components/_splitpanes.sass`). Pane sizes persist via `autoSaveId="media-layout"` (PaneForge's own localStorage mechanism) and are **excluded from undo**, matching the Bookmarks precedent — document this exception in the ADR. The right pane starts collapsed via `collapsible` + programmatic `collapse()`; the module's `inspectorOpen` state and the pane are kept in sync through `onCollapse`/`onExpand` and the inspector-toggle command calling the pane API. Reference docs live in `docs/archive/paneforge/`.
- **D10 — Single courtesy watcher.** One debounced `notify` watcher on the library base reconciles manual Finder edits inside the library (rescan-and-diff → catalog patch, orphan detection for externally deleted files). It is a consistency courtesy, not a core mechanism — all app-initiated mutations update the catalog directly.

## 3. Authorized scope

### Included (v1)

Everything in §2, plus: first-launch library setup flow; contributions (commands, header actions, keybindings, context-menu contribution) via the registry; a manual `media` section in `SettingsDialog` (library location display + "Change…", default sort, thumbnail max edge, default import mode copy/move); routing/design/ADR docs and `docs/INDEX.md` regeneration; unit tests listed per stream.

### Explicitly excluded (report as blocker if it seems necessary)

- Linked/watched external folders (the pre-2026-07-17 model) — may return as v2
- Masonry layout, star ratings, EXIF inspector panel
- Duplicate detection, content hashing, editing media (crop/rotate/convert), AI auto-tagging
- Smart folders / saved searches, color-palette extraction, batch export
- Cloud sync, sharing, multi-window, ffmpeg or any new sidecar binary
- Writing metadata into user files

## 4. Phase 0 — Frozen contract (operator or first agent, once, before parallel work)

Create and commit these files on the working branch before either stream begins. Both agents treat them as read-only afterward.

### 4.1 `src/lib/modules/media/types.ts` — shared domain types

```ts
export type MediaKind = 'image' | 'video' | 'gif';

export const MEDIA_EXTENSIONS: Record<MediaKind, string[]> = {
	image: ['png', 'jpg', 'jpeg', 'webp', 'avif', 'heic', 'svg', 'ico', 'bmp', 'tiff'],
	gif: ['gif'],
	video: ['mp4', 'mov', 'webm', 'mkv', 'm4v'],
};

export interface MediaLibraryInfo {
	basePath: string;        // absolute path of the library root
}

export interface MediaFolder {
	path: string;            // library-relative ('' = root)
	name: string;
	children: MediaFolder[];
	mediaCount: number;      // direct children only
}

export interface MediaItem {
	id: string;              // app-assigned ULID; permanent identity
	relPath: string;         // library-relative current location
	name: string;
	kind: MediaKind;
	ext: string;
	size: number;            // bytes
	addedMs: number;
	modifiedMs: number;
	width?: number;
	height?: number;
	durationMs?: number;     // video only, filled lazily via D4
	thumbnail?: string;      // asset/cache URL, filled lazily
	tags: string[];
	pinned: boolean;
}

export type MediaSmartSection = 'all' | 'recent' | 'untagged' | 'pinned';

export type MediaScope =
	| { type: 'folder'; path: string }            // library-relative
	| { type: 'section'; section: MediaSmartSection }
	| { type: 'tag'; tag: string };

export type MediaSort = 'name' | 'added' | 'modified' | 'size' | 'kind';

export interface MediaQuery {
	scope: MediaScope;
	sort: MediaSort;
	descending: boolean;
	kinds?: MediaKind[];     // filter; undefined = all
}

export type MediaImportMode = 'copy' | 'move';

export interface MediaImportProgress {
	importId: string;
	done: number;            // files completed
	total: number;           // media files discovered
	skipped: number;         // non-media files ignored
	currentName: string;
	finished: boolean;
	error?: string;          // e.g. 'insufficient-disk-space', 'cancelled'
}

export type MediaFsEventKind = 'created' | 'removed' | 'renamed' | 'modified';

export interface MediaFsEvent {
	kind: MediaFsEventKind;
	relPath: string;
	newRelPath?: string;     // renamed only
	isDirectory: boolean;
}
```

### 4.2 IpcApi additions — signatures appended to `interface IpcApi` in `src/lib/ipc.ts`

Reuse existing members where they already fit (`searchAll`, `indexDocuments`, `removeIndexedDocuments`; add `'media'` to the `SearchSource` union). New members:

```ts
// fractalMedia
mediaGetLibrary(): Promise<MediaLibraryInfo | null>;      // null = not yet initialized
mediaInitLibrary(): Promise<MediaLibraryInfo | null>;     // native picker defaulting to ~/Gallery/Fracta; ADR-018 registration + asset-scope grant; null = user cancelled
mediaRelocateLibrary(): Promise<MediaLibraryInfo | null>; // settings "Change…"; moves nothing, points at an existing library folder
mediaListTree(): Promise<MediaFolder>;
mediaListItems(query: MediaQuery): Promise<MediaItem[]>;
mediaListAllTags(): Promise<{ tag: string; count: number }[]>;
mediaImport(sourcePaths: string[], destFolderPath: string, mode: MediaImportMode): Promise<string>; // returns importId; progress via onMediaImportProgress
mediaCancelImport(importId: string): Promise<void>;
mediaCreateFolder(parentPath: string, name: string): Promise<void>;
mediaRenameEntry(relPath: string, newName: string): Promise<string>;   // returns new relPath
mediaMoveEntries(relPaths: string[], destFolderPath: string): Promise<void>;
mediaTrashEntries(relPaths: string[]): Promise<void>;     // OS trash + catalog/thumb prune; never permanent unlink
mediaSetTags(itemIds: string[], addTags: string[], removeTags: string[]): Promise<void>; // batch; one call per user gesture
mediaSetPinned(itemIds: string[], pinned: boolean): Promise<void>;
mediaGetThumbnail(itemId: string, maxEdge: number): Promise<string>;   // URL; Rust-side for raster image/gif
mediaSaveVideoThumbnail(itemId: string, jpegBase64: string): Promise<string>; // persists webview capture, returns URL
mediaSetVideoProbe(itemId: string, width: number, height: number, durationMs: number): Promise<void>;
mediaAssetUrl(relPath: string): string;                   // sync, like templateIdToMenuId
mediaPickImportSources(kind: 'files' | 'folder'): Promise<string[] | null>; // native multi-picker; null = cancelled. Contract amendment, operator-approved 2026-07-17: the header Import… flow needs a source picker and rfd cannot mix files+folders in one dialog, hence the kind param (header shows "Import Files…" / "Import Folder…").
onMediaImportProgress(callback: (p: MediaImportProgress) => void): () => void;
onMediaFsEvent(callback: (event: MediaFsEvent) => void): () => void;
```

Update the `_ipcApiCheck` object in the same commit so `ipc.ts` still typechecks with `throw new Error('not implemented')` stubs — Agent B replaces the stubs.

### 4.3 Fixture assets

Add `static/media-fixtures/` with ~12 small committed files: 6 images (mix of jpg/png/svg), 2 gifs, 2 short mp4/webm videos, nested in two subfolders. Both the mock engine (Agent B) and any UI screenshots (Agent A) use these. Keep total under ~3 MB.

### 4.4 Commit

Commit 4.1–4.3 as `feat(media): freeze fractalMedia owned-library IPC contract and fixtures`. Parallel work may then begin.

## 5. File-ownership matrix

| Path | Owner |
|---|---|
| `src/lib/modules/media/types.ts` | **Frozen** (Phase 0) |
| `src/lib/ipc.ts` — `IpcApi` interface + type unions | **Frozen** (Phase 0) |
| `static/media-fixtures/` | **Frozen** (Phase 0) |
| `src/lib/modules/media/components/`, `state/`, `styles/`, `contributions.ts` | Agent A |
| `src/lib/data/templates.ts`, `src/routes/+page.svelte`, `src/routes/+layout.svelte`, `src/lib/styles/index.sass`, `src/lib/components/SettingsDialog.svelte` | Agent A |
| `src/lib/state/contributions.svelte.ts` (context-menu contribution TYPE, if needed per D8), IDE file-tree context-menu wiring | Agent A |
| `docs/routing/` + `docs/design/` entries for the above; ADR authored jointly at integration | Agent A (UI docs) |
| `src/lib/ipc.ts` — implementations of the new members | Agent B |
| `src/lib/ipc-mock.ts` | Agent B |
| `src-tauri/src/media.rs` (new), `src-tauri/src/lib.rs` (registration + shared state), `Cargo.toml`, `tauri.conf.json` / capabilities | Agent B |
| `tests/unit/ipc-contract.test.ts`, new `tests/unit/media-engine.test.ts` | Agent B |
| `tests/unit/media-state.test.ts` (new), `tests/unit/contribution-contracts.test.ts` extension (D8) | Agent A |

No file appears in both columns. If your work seems to require editing the other agent's file, stop and report it in your handoff.

## 6. Agent A — UI Stream

Until integration, run against the mock: `pnpm dev` in the browser gives you the full contract via `ipc-mock.ts`. Until Agent B's B1 lands you may stub responses **in your own state layer only** (a `TODO(media-integration)` fixture branch inside `media.svelte.ts`), never by editing `ipc-mock.ts`.

### A1 — Scaffold and mounting

- `src/lib/data/templates.ts`: add `'media'` to `AppTemplateId`; add the gallery entry exactly as specced:

```ts
{
	id: 'media',
	name: 'media',
	summary: 'Image, Video, Collections.',
	image: 'module-images.svg',
	hero: 'mod-images.webp',
	logo: 'fractalmedia.png',
	tiles: [],
},
```

  `fractalmedia.png` already exists in `static/`; add `module-images.svg` and `mod-images.webp` beside the other gallery assets.
- `src/routes/+page.svelte`: lazy-import branch for `activeTemplateId === 'media'` → `MediaLayout.svelte`, with the same loading/failure panels the bookmarks branch has.
- `src/routes/+layout.svelte`: `import '$lib/modules/media/contributions';` beside designer/ai.
- `MediaLayout.svelte` renders the three-pane layout with **PaneForge** (D9), using the shared module-shell classes from `_commons.sass`. Structure (frozen by the operator on 2026-07-17):

```svelte
<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from "paneforge";
	// let rightPane: ReturnType<typeof Pane> — bind:this, collapsed on mount; synced with media.inspectorOpen
</script>

<div class="module-wrapper">
	<PaneGroup direction="horizontal" class="inside-module-wrapper" autoSaveId="media-layout">
		<Pane defaultSize={20} minSize={12} collapsible={true} class="module-sidebar media-left">
			<!-- smart sections + folder tree -->
		</Pane>
		<PaneResizer class="vertical-sizer" />
		<Pane defaultSize={60}>
			<div class="module-central">
				<div class="central-carrier">
					<div class="media-header"></div> <!-- toolbar: search, filters, sort, thumb slider -->
					<div class="media-viewer"></div> <!-- virtualized grid -->
					<div class="media-strip"></div>  <!-- import progress strip -->
				</div>
			</div>
		</Pane>
		<PaneResizer class="vertical-sizer" />
		<Pane defaultSize={20} minSize={12} collapsible={true} collapsedSize={0}
			class="module-sidebar media-right" bind:this={rightPane}
			onCollapse={...} onExpand={...}>
			<!-- inspector -->
		</Pane>
	</PaneGroup>
</div>
```

  Pane sizes persist via `autoSaveId` (excluded from undo per D9); the right pane starts collapsed and is driven by the inspector-toggle command through the pane API. In `_media.sass`:

```sass
.media-header
	height: var(--sz-128)
.media-strip
	height: var(--sz-24)
.media-viewer
	flex: 1
	min-height: 0
	overflow: hidden
```

  (`central-carrier` is already a column flexbox in `_commons.sass`, so the viewer fills all height between header and strip.) Styles in `src/lib/modules/media/styles/_media.sass`, imported from `src/lib/styles/index.sass`. Semantic tokens only.
- **First-launch state:** when `mediaGetLibrary()` returns null, the central area shows a setup panel — explanation + "Choose Library Location…" button (`mediaInitLibrary`, default `~/Gallery/Fracta` shown in the copy). Everything else disabled until initialized.

### A2 — State module

`src/lib/modules/media/state/media.svelte.ts` — a runes class singleton (mirror `bookmarks.svelte.ts`):

- `library`, `tree`, `activeScope: MediaScope`, `items`, `selection: Set<string>` (item ids), `anchorId` (shift-range), `query`, `kindFilters`, `sort`, `thumbSize`, `inspectorOpen`, `allTags`, `imports: Map<importId, MediaImportProgress>`, `loading`/`error` flags.
- All IPC through `$lib/ipc`. Optimistic mutations reconciled by `onMediaFsEvent`; import progress by `onMediaImportProgress` (drive the strip; refresh tree/items on `finished`).
- Undo: register a media domain via `registerUndoDomain` (ADR-026). Inverse-op entries for create/rename/move; snapshot entries for tags, pins, thumb size, sort, filters, inspector state. Every mutation entry point wraps in `transact()`; composite gestures are one atomic entry. Trash and import are the documented D6 exceptions.
- Persistence: active scope, thumb size, sort, inspector collapse persisted following the `design.svelte.ts` precedent.

### A3 — Left sidebar (`MediaSidebar.svelte`)

- **Smart sections block (top, fixed):** All Items, Recently Added (last 7 days by `addedMs`), Untagged, Pinned, and an **All Tags** disclosure listing tags with counts (`mediaListAllTags`); clicking a tag sets a tag scope.
- **Folder tree** below: recursive, folders only (follow `TreeNode.svelte` interaction conventions — disclosure, inline rename on double-click/F2, context menu: New Folder, Rename, Move to Trash). Keyboard accessible per ADR-014 conventions.
- Drag-and-drop: tree folders onto folders and grid items onto folders → `mediaMoveEntries` (in-library real moves, undoable). **External OS drops** (Tauri drag-drop event with real paths) onto a folder or the grid → `mediaImport(paths, dest, 'copy')`.
- Trash = confirm dialog ("Moves to Trash — cannot be undone from the app") → `mediaTrashEntries`.

### A4 — Central area (`MediaGrid.svelte`, `MediaCard.svelte`, `MediaToolbar.svelte`, `MediaProgressStrip.svelte`)

- **Uniform virtualized grid** (D7) — fixed square-ish cells sized by the thumb slider; reuse/extend `VirtualList.svelte` if its row model fits, else windowed rendering inside `MediaGrid` (justify choice in routing doc). Smooth at 5k items.
- `MediaCard`: thumbnail via `mediaGetThumbnail` (lazy, `IntersectionObserver`), kind badge, name, pin indicator, tag-count chip. `svg`/`ico` render via `mediaAssetUrl` in an `<img>` (rule 13 — no `{@html}`). **Video/gif cards:** on hover, gif plays (swap to asset URL), video scrubs a muted inline preview. On first video render with missing `durationMs`/thumbnail, run the D4 capture (asset URL → hidden `<video>` → canvas → `mediaSaveVideoThumbnail` + `mediaSetVideoProbe`).
- `MediaToolbar` renders inside `.media-header` (`--sz-128` tall): search input (debounced; filename match locally + `searchAll` for tag hits), kind filter chips, sort menu, thumb-size slider. User-editable state → undo-wrapped.
- Multi-select: click, shift-range via anchor, cmd/ctrl-toggle, cmd-A within scope, Escape clears. Selection drives the inspector.
- **`MediaProgressStrip`:** renders inside `.media-strip`, the permanently reserved `--sz-24`-tall band at the absolute bottom of the central area. Idle: empty (or a quiet scope summary — item count). During imports it shows progress bar, `done / total`, percentage, current filename, skipped-count note, cancel button (`mediaCancelImport`). Error states render in the strip (insufficient disk space, cancelled) with a dismiss affordance. Multiple concurrent imports: show the active one + a `(+n more)` badge.

### A5 — Right inspector (`MediaInspector.svelte`)

- Lives in the right PaneForge pane (D9), collapsed by default; toggle via header action and keybinding calling the pane API (`expand()`/`collapse()`). The `inspectorOpen` undo snapshot restores open/closed state through the same API; pane *width* stays out of undo per D9.
- Single selection: preview (image, or `<video controls>` via asset URL), facts table (name — inline-renamable via `mediaRenameEntry`, kind, dimensions, size, added, modified, duration), **tags editor** (token input, autocomplete from `mediaListAllTags`), **pin toggle**.
- Multi selection: count summary, shared-tags editing (add to all / remove common), batch pin. One `mediaSetTags`/`mediaSetPinned` batch call per gesture, one undo entry.
- Empty selection: scope summary (counts by kind).

### A6 — Contributions, cross-module Add to Gallery, settings

- `contributions.ts` with `scope: 'media'`: commands (`media.addToGallery`, `media.newFolder`, `media.focusSearch`, `media.toggleInspector`, `media.trashSelection`, `media.selectAll`, `media.pinSelection`), header actions (Import…, New Folder, inspector toggle), keybindings following existing conventions.
- **D8:** if the registry lacks a context-menu contribution TYPE, add it in `contributions.svelte.ts` and extend `contribution-contracts.test.ts`. Wire one consumer: IDE file-tree context menu shows "Add to Gallery" for media files/folders → `media.addToGallery(paths)` → `mediaImport(paths, <active or root folder>, 'copy')` — works regardless of which template is active; surface completion via the progress strip next time media is opened, plus a toast.
- `SettingsDialog.svelte`: manual `media` section — library location (read-only path + "Change…" → `mediaRelocateLibrary`), default sort, thumbnail max edge, default import mode (copy/move).

### A7 — Tests, docs, handoff

- `tests/unit/media-state.test.ts`: selection semantics (range/toggle/clear), import-progress lifecycle (start → progress → finish/cancel/error updates strip state and refreshes), fs-event reconciliation, undo atomicity for a composite move and a batch tag edit, scope/filter/sort derivations.
- Rule 10 docs: routing docs for every new component/state file, design docs for new styles (`styling-docs-builder` skill), regenerate `docs/INDEX.md` rows (`doc-frontmatter` skill).
- Quality gates: `pnpm check` clean; unit suites green; `pnpm dev` browser walkthrough of every flow against the mock; rule 12 mutation inventory in the handoff.

## 7. Agent B — Data/Engine Stream

### B1 — Mock engine first (unblocks Agent A; ~first commit)

In `ipc-mock.ts`, implement every §4.2 member against an in-memory library seeded from `static/media-fixtures/` (folder ops mutate the in-memory tree; `mediaImport` simulates staged progress with a few ticks so Agent A can build the strip; `onMediaFsEvent` fires synthetic events after each mutation). `mediaAssetUrl` returns the `/media-fixtures/...` static URL. Catalog (ids, tags, pins) in Maps, persisted to `localStorage` like other mock state. `mediaGetLibrary` starts null once per profile so the first-launch flow is exercisable; `mediaInitLibrary` returns a fake path. Contract obligation (rule 7 / ADR-028), not the product — do not gold-plate.

### B2 — Rust scaffold: library, catalog, tree, listing, fs ops

- New `src-tauri/src/media.rs`; register commands in `lib.rs` `generate_handler`. Shared `MediaState` (managed): library base, sqlite connection, watcher handle, active imports.
- `Cargo.toml` additions: `notify` + `notify-debouncer-mini`, `image`, `trash`, `ulid` (or equivalent tiny id crate). No ffmpeg.
- `media_init_library`: `rfd` picker defaulting to `~/Gallery/Fracta` (create `~/Gallery` if needed) → persist base via `storage.rs` conventions → `register_authorized_path` (ADR-018) → asset-protocol scope grant (`allow_directory(base, true)`) → initial scan populating the catalog → start watcher.
- Catalog per D2 (`items`, `tags`, `pins` tables; rel_path storage). `media_list_tree` walks real dirs; `media_list_items` resolves any `MediaQuery` scope (folder / all / recent / untagged / pinned / tag) via SQL + fs join.
- `media_create_folder`, `media_rename_entry`, `media_move_entries` (fs op + `rel_path` updates), `media_trash_entries` (`trash::delete` + catalog/thumb prune). **Every path argument on every command resolves against the library base and validates ADR-018 containment**; write containment unit tests in the existing style.
- Enable/scope the asset protocol in `tauri.conf.json` + capabilities as required by Tauri 2.

### B3 — Import engine (D3)

- `media_import`: recursive walk of sources classifying by D5 extensions; skip non-media (count them) and hidden files; disk-space preflight (`insufficient-disk-space` error before any copy); copy or move with collision-suffix naming; assign ULIDs + catalog rows as each file lands; emit `media://import-progress` events (throttled ~10/s); honor cancellation between files. Files already imported at cancel time remain.
- Drag-drop: frontend receives Tauri v2 drag-drop paths and calls the same `media_import` — no separate engine path.

### B4 — Thumbnails and probes (D4)

- `media_get_thumbnail`: id-keyed cache (`<app-data>/media-thumbs/<id>.jpg`); miss → decode, `thumbnail(maxEdge)`, jpeg ~80. Gif: first frame. Corrupt/unsupported → typed error the UI renders as a fallback tile. `svg`/`ico` are never sent here (UI renders directly).
- `media_save_video_thumbnail` / `media_set_video_probe`: persist webview capture into the same cache; probe into the catalog so subsequent listings fill `width/height/durationMs`.

### B5 — Watcher and search

- One debounced (~300ms) recursive watcher on the library base (D9): map notify events → `MediaFsEvent` (library-relative), emit as `media://fs-event`; reconcile the catalog (new file → new item row; removed → prune; rename → `rel_path` update, id and annotations untouched).
- Add `'media'` to the `SearchSource` union (Phase 0 — verify, don't re-edit). Index items at import and on watcher events: doc id = item id, title = filename, body = tags. Results resolve back to `MediaItem`s.

### B6 — Contract tests, docs, handoff

- Extend `tests/unit/ipc-contract.test.ts`: name parity for all new members (no `NATIVE_ONLY` entries), mock behavior tests (import lifecycle incl. cancel and skipped counts; folder round-trip create → move → rename → trash with correct events; tag/pin batch round-trip; id stability across a rename; path-escape rejection).
- `tests/unit/media-engine.test.ts` for pure-TS logic (extension classification via the shared constant, event mapping); Rust logic gets `#[cfg(test)]` tests in `media.rs` (containment, collision suffixing, rel_path migration, disk-space preflight logic).
- `cargo test` and `pnpm check` green. Routing docs for `ipc.ts`/`ipc-mock.ts` changes; regenerate `docs/INDEX.md` rows.
- Handoff (§9) including: command list, error taxonomy, event timing/throttle behavior, and any contract deviations proposed (as blockers, not edits).

## 8. Integration (separate assignment; do not self-start)

1. Merge both streams; delete Agent A's `TODO(media-integration)` fixture branch in `media.svelte.ts` if still present.
2. `pnpm check`, full unit suite, `cargo test`.
3. Real-app verification via the `run-fractalengine` skill, then `pnpm tauri dev`: first-launch setup at `~/Gallery/Fracta` → import a real folder of images/videos (watch the progress strip; verify originals untouched and copies present on disk) → browse tree → grid thumbs → hover previews → create/rename/move/trash folders (watch real disk) → Finder drag-drop onto a tree folder (copy lands) → external edit inside Fracta reflects in-app → tag + pin → smart sections and tag scopes correct → search by tag → cancel a large import mid-flight → undo/redo each reversible mutation → relaunch and confirm persistence → IDE-tree "Add to Gallery" round-trip.
4. Rule 12 audit: mutation inventory (every gesture = one atomic undo entry or documented D6 exception), async failure/cancel/out-of-order exercises (slow thumbnail, scope switch mid-import, teardown during video capture), malformed fixtures (corrupt image, zero-byte video, unicode/emoji filenames, name collisions, full-disk simulation), `git diff --check`.
5. Write the ADR from D1–D10 (`adr-writing` skill); final `docs/INDEX.md` regeneration; settings/contributions check (rule 11).

## 9. Handoff format (both agents)

End your run with: (a) commit list; (b) what works, demonstrated how (which test/walkthrough); (c) mutation inventory for your surface; (d) known gaps ordered by risk; (e) blockers, including any frozen-contract change you need; (f) exact files touched, confirming ownership-matrix compliance.

## 10. Dependencies between streams (the only legitimate waits)

- Agent A's A2+ reconciliation and progress-strip work needs Agent B's **B1 mock** for real event flows; before that, A1 and static layout proceed on the local fixture branch.
- Agent B needs nothing from Agent A at any point.
- Both need Phase 0 complete.

## 11. Completion record

**Completed 2026-07-17.** The integrated module now ships the owned-library engine and browser mock, real import/copy/move/trash flows, catalog/search/watcher support, three-pane UI, IDE intake, Tauri file-drop intake, video thumbnail/probe capture, row-windowed grid rendering, and media-domain undo/redo for reversible mutations. Import and trash remain the intentional D6 exceptions. The native watcher preserves identity for unambiguous external renames by matching its size/mtime signature; ambiguous external changes deliberately reconcile as create/remove rather than risk attaching annotations to the wrong file.
