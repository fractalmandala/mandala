---
id: data-layer-plan
title: Data Layer Plan
type: plan
tags: [plan, history]
status: executed
updated: 2026-07-15
---

> **Executed plan — kept as record; see areas/ and guides/ for current truth.**


**Repo:** `apps/fractalengine` (SvelteKit + Tauri 2.11, Svelte 5 runes, indented SASS)
**Goal:** Promote the app's existing embedded SQLite (ADR-011's per-project
`memory.db` via `rusqlite` 0.32 bundled) into a general **app-global data layer**:
one `fractalengine.db` in the Tauri app-data dir, versioned migrations, an FTS5
unified search index, high-level IPC commands with full browser-mock parity — plus the
first two consumers: **unified search** (notes + bookmarks) and the **bookmarks
manager module** from the product roadmap, built to the established module playbook.

**What is new about this phase (read carefully):**
- First phase with **Rust in the loop**. Stream A must have `cargo` available and run
  `cargo check`/`cargo test` as gates. The browser mock cannot prove the native path —
  Phase 3 has a mandatory `pnpm tauri dev` step.
- First phase allowed to **add IPC commands** (rule 7 discipline applies: the mock
  must implement the full surface so `pnpm dev` stays fully functional).
- **Migrations are one-way once users have data.** The migrations scaffold ships in
  Phase 0 and its shape is frozen; schema changes after this phase land as NEW
  migration files, never edits to old ones.

**Architecture positions (frozen, recorded in the ADR):**
1. Notes remain **markdown files** — the vault stays portable/git-able; SQLite only
   *indexes* notes. Bookmarks are **owned** by SQLite (no JSON file). Future mail:
   owned by SQLite.
2. Per-project `memory.db` (sessions/messages/checkpoints) is untouched.
3. The IPC surface is **semantic, not SQL**: `searchAll`, `indexDocuments`,
   `bookmarks.*`. No SQL strings cross the IPC boundary — that is what makes mock
   parity achievable and keeps injection surface at zero.
4. v1 search sources are `note` and `bookmark`. `session` is reserved in the type but
   NOT indexed this phase (indexing hooks live in the kernel's private
   `persistMessage`; that edit belongs to kernel decomposition — ADR notes it).
5. In-memory runes state is a **view/cache** over the store: queries return pages
   (`limit`/`offset`), never unbounded tables; list UIs over store data use the new
   core `VirtualList`.

You are one of two agents. Operator assigns **Agent A (native store)** or **Agent B
(mock parity + consumers)**.

- Agent A: branch `data-layer-native`.
- Agent B: branch `data-layer-consumers`.
- Both branch from post-Phase-0 `master`; Phase 3 runs once after merge.

---

## Phase 0 — Frozen contract (operator commits BEFORE branching)

One commit (`chore: data layer IPC contract`). TypeScript-only — no Rust changes yet
(so `cargo` state is untouched and the app still builds for both agents).

### 0a. Types + gateway functions appended to `src/lib/ipc.ts`

Follow the file's existing per-function pattern
(`isTauri() ? invoke('...') : mockIpc....`). Append exactly:

```ts
// ── Data layer (app-global SQLite store; see DATA-LAYER-PLAN.md / ADR-027) ──

export type SearchSource = 'note' | 'bookmark' | 'session'; // 'session' reserved, not indexed in v1

export interface SearchHit {
	source: SearchSource;
	docId: string;        // note: vault-relative file path · bookmark: bookmark id
	title: string;
	snippet: string;      // plain text, match regions wrapped in «»
	score: number;        // higher = better; mock may approximate
	path: string | null;  // filesystem path for notes, url for bookmarks
	updatedAt: number;
}

export interface SearchQuery {
	query: string;
	sources?: SearchSource[];   // default: all indexed sources
	limit?: number;             // default 50, max 200
	offset?: number;            // default 0
}

export interface IndexDocument {
	source: SearchSource;
	docId: string;
	title: string;
	body: string;
	path: string | null;
	updatedAt: number;
}

export interface Bookmark {
	id: string;
	url: string;
	title: string;
	description: string;
	tags: string[];
	createdAt: number;
	updatedAt: number;
}

export interface BookmarkInput {
	url: string;
	title: string;
	description?: string;
	tags?: string[];
}

export async function searchAll(query: SearchQuery): Promise<SearchHit[]> {
	return isTauri() ? invoke('storage_search_all', { query }) : mockIpc.searchAll(query);
}
export async function indexDocuments(docs: IndexDocument[]): Promise<void> {
	return isTauri() ? invoke('storage_index_documents', { docs }) : mockIpc.indexDocuments(docs);
}
export async function removeIndexedDocuments(source: SearchSource, docIds: string[]): Promise<void> {
	return isTauri() ? invoke('storage_remove_documents', { source, docIds }) : mockIpc.removeIndexedDocuments(source, docIds);
}
export async function listBookmarks(): Promise<Bookmark[]> {
	return isTauri() ? invoke('storage_list_bookmarks') : mockIpc.listBookmarks();
}
export async function addBookmark(input: BookmarkInput): Promise<Bookmark> {
	return isTauri() ? invoke('storage_add_bookmark', { input }) : mockIpc.addBookmark(input);
}
export async function updateBookmark(id: string, input: BookmarkInput): Promise<Bookmark> {
	return isTauri() ? invoke('storage_update_bookmark', { id, input }) : mockIpc.updateBookmark(id, input);
}
export async function deleteBookmark(id: string): Promise<void> {
	return isTauri() ? invoke('storage_delete_bookmark', { id }) : mockIpc.deleteBookmark(id);
}
```

### 0b. Stub implementations appended to `src/lib/ipc-mock.ts`

Same signatures, minimal bodies (`return []` /
`throw new Error('mock: not yet implemented')` for mutations), each tagged
`// Stream B replaces (data-layer plan)`.
Stream B replaces these with the real in-memory engine; nothing else in the mock is
touched by this phase's Phase 0.

### 0c. Frozen values

| Item | Value |
|---|---|
| Database file | `<app_data_dir>/fractalengine.db` (`app.path().app_data_dir()`, the lib.rs ~line 85 pattern) |
| Migrations table | `schema_migrations(version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL)` |
| Migration 001 | `bookmarks` table (columns mirroring the `Bookmark` type; `tags` as JSON text) + `search_index` FTS5 table: `fts5(title, body, source UNINDEXED, doc_id UNINDEXED, path UNINDEXED, updated_at UNINDEXED)` |
| IPC command names | exactly the seven `storage_*` strings in 0a |
| Snippet markers | FTS5 `snippet()` configured with `«` / `»`, 12-token window; plain text (no HTML) |
| Reindex semantics | `indexDocuments` = delete-then-insert per `(source, docId)`; idempotent |
| Bookmarks template id / name / summary | `bookmarks` / `fractalMarks` / `Bookmarks, tags, and search.` (image: reuse `fractalzero.png`) |
| Search command | label `Search Everything`, category `Global`, id `core.searchEverything` |
| Bookmarks localStorage key (layout only) | `fractalengine:bookmarks-workspace` |
| New CSS classes (e2e will select) | `.search-overlay`, `.search-result-row`, `.bookmarks-layout`, `.bookmark-row`, `.bookmark-add`, `.virtual-list` |

### Hard rules (both streams)

- Existing behavior untouched: all current Playwright specs pass unedited. New
  surfaces get NEW specs (Phase 3).
- No SQL across IPC; no new npm dependencies; Rust deps limited to what Cargo.toml
  already has (`rusqlite` bundled) unless the FTS5 check fails (see A1).
- Mock parity is a REQUIREMENT: after this phase, `pnpm dev` in a plain browser must
  support add/edit/delete/search bookmarks and note search end-to-end.
- Module playbook applies to bookmarks: runes only, no `<style>` blocks, semantic
  tokens only, contributions.ts for commands/keybindings, undo via
  `UndoHistory.transact()` (rule 9), docs per rule 10.

### File-ownership manifest (disjoint)

**Stream A owns:** `src-tauri/src/storage.rs` (new), `src-tauri/src/lib.rs`
(command registration lines only), `src-tauri/Cargo.toml` (only if the FTS5 check
demands a feature flag — report if so).

**Stream B owns:** `src/lib/ipc-mock.ts` (the 0b stubs only),
`src/lib/components/SearchOverlay.svelte` + `VirtualList.svelte` (new, core),
`src/lib/state/coreContributions.ts` (Search Everything entry),
`src/lib/modules/bookmarks/**` (new module), `src/lib/data/templates.ts`,
`src/lib/state/app.svelte.ts` + `canvas.svelte.ts` (template-id validators — the
AI-phase lesson, now in-manifest), `src/routes/+page.svelte` (template branch),
`src/lib/styles/index.sass`, `src/lib/modules/notes/state/notes.svelte.ts` (index
hooks only), `tests/unit/*` (new tests), `docs/**`, `AGENTS.md`.

Neither stream touches `src/lib/ipc.ts` after Phase 0. If the contract proves wrong,
STOP and report — contract changes are operator decisions.

---

## Stream A — Native store (Agent A)

Branch `data-layer-native`. Everything you do is in `src-tauri/`.

### A1. FTS5 availability check FIRST

Before any schema work, add a `#[test]` that opens an in-memory connection and runs
`CREATE VIRTUAL TABLE t USING fts5(x)`. If it fails with the bundled build, enable the
appropriate `libsqlite3-sys`/`rusqlite` feature in Cargo.toml (smallest flag that adds
FTS5), re-run, and flag the Cargo.toml change prominently in your report.

### A2. `storage.rs`

Model the file on `memory.rs` (same error-string conventions, same command style):
- Lazy-open `<app_data_dir>/fractalengine.db` (create dir if needed); a connection
  helper shared by all commands. Concurrency: open per-command like `memory.rs` does,
  with `busy_timeout` set — do not introduce a connection pool.
- **Migrations scaffold**: `run_migrations(conn)` executes numbered migrations not yet
  in `schema_migrations`, each in a transaction, recording `version`+`applied_at`.
  Migration 001 exactly per the 0c contract.
- The seven commands with signatures matching the 0a types verbatim (serde structs;
  `camelCase` field renames to match the TS shapes). Semantics:
  - `storage_index_documents`: per doc, `DELETE FROM search_index WHERE source=? AND doc_id=?`
    then `INSERT`; one transaction per call.
  - `storage_search_all`: FTS5 `MATCH` over a sanitized query (strip FTS operators —
    treat user input as literal terms joined with implicit AND; quote each term),
    filtered by `sources`, ordered by `bm25(search_index)`, `snippet(...)` with the
    frozen markers, `limit`/`offset` clamped to contract bounds.
  - Bookmarks CRUD: ids generated Rust-side (`bm_` + millis + random suffix, matching
    the kernel's session-id style); `updated_at` maintained; `delete` also removes the
    bookmark's row from `search_index`; `add`/`update` upsert the bookmark into
    `search_index` (source `bookmark`, body = description + tags joined) so bookmarks
    are searchable without a frontend round-trip.
- Register all seven in `lib.rs`'s `invoke_handler` next to the `memory::` block.

### A3. Rust tests (`#[cfg(test)]` in storage.rs, in-memory DB)

Migrations idempotent (run twice, no error, single version row); bookmark CRUD
round-trip incl. tags JSON; delete removes index row; index-then-search returns the
doc with a `«»`-marked snippet; reindex replaces rather than duplicates; FTS-operator
injection (`"a" OR b*`) is treated literally, not as syntax; limit clamped at 200.

### A4. Verify and commit

`cargo check` && `cargo test` (in `src-tauri/`) → `pnpm check` && `pnpm build` (should
be untouched — you changed no TS) → `npx playwright test` (unedited, green). If a
Tauri window is available to you, boot `pnpm tauri dev` and exercise one
`storage_add_bookmark`/`storage_search_all` round-trip from the devtools console via
the ipc gateway; otherwise state clearly that native runtime verification is deferred
to Phase 3. Commit.

---

## Stream B — Mock parity + consumers (Agent B)

Branch `data-layer-consumers`. No `src-tauri/` edits.

### B1. Real mock engine (`ipc-mock.ts` stubs → implementation)

In-memory maps for bookmarks and the search index, module-level (persistence across
reloads is NOT required — the existing mock is session-scoped; match its conventions).
Semantics must mirror the contract: delete-then-insert reindex; search = case-
insensitive token match over title+body, all terms must match (AND), score = naive
term-frequency, snippet = 12-word window around the first match wrapped in `«»`;
`sources` filter, limit/offset clamps identical to native. Same id style (`bm_`…).

### B2. Core search surface

- `VirtualList.svelte` (core, generic): windowed rendering over a `items`/`rowHeight`/
  `render` snippet contract; no dependency; keyboard-navigable. Keep it small — it
  exists to be reused by mail later, not to be a framework.
- `SearchOverlay.svelte` (core): opened by the `core.searchEverything` command
  (contribution in `coreContributions.ts`; pick a keybinding AFTER grepping existing
  `registerKeybindings` combos for conflicts — the registry makes this greppable; the
  contribution-contracts test will hold you to label↔combo consistency). Debounced
  `searchAll`, results in a `VirtualList`, `«»` markers rendered as highlight spans,
  Enter opens the hit: notes → notes template + `notes.openFile(path)`, bookmarks →
  bookmarks template with the row selected. Esc closes. Renders in `+page.svelte`
  like CommandPalette does.

### B3. Notes indexing hooks (`modules/notes/state/notes.svelte.ts`)

- After a successful `flushPendingSave`, `indexDocuments` the saved note (docId =
  vault-relative path, title = filename sans `.md`, body = raw markdown).
- On vault open/restore (the `loadVaultTree` completion paths), bulk-index the vault's
  markdown files via ONE `indexDocuments` call per root (read bodies through the
  existing `readFile` ipc; cap at 500 files per root and log a truncation notice —
  no silent caps).
- On `deleteSavedVault`/vault switch: do NOT remove index entries (stale hits open
  nothing worse than a load error; full lifecycle GC is future work — note in ADR).
  Indexing failures must never break saving — wrap in try/catch that records to
  `ideState.addLog` at most once per session.

### B4. Bookmarks module (`src/lib/modules/bookmarks/`)

Follow the AI-module playbook end to end — this is the fifth module and the playbook
is proven:
- `state/bookmarks.svelte.ts`: runes list as view-cache over `listBookmarks()`
  (loaded on template activation), CRUD methods calling the ipc gateway then updating
  local state; `UndoHistory<Bookmark[]>` where `restore(list)` **reconciles** against
  the store (diff current vs snapshot → add/update/delete calls) — bookmark counts are
  small; this satisfies rule 9 for store-backed data and the approach goes in the ADR.
  All mutations in `transact()`. Layout prefs under the frozen localStorage key.
- `components/`: `BookmarksLayout.svelte` (single column: search-within-bookmarks
  input, tag filter chips, `VirtualList` of `.bookmark-row`s, `.bookmark-add` form
  with url/title/description/tags). No `<style>` blocks; sass under
  `modules/bookmarks/styles/` registered in `index.sass`; semantic tokens only.
- `contributions.ts`: `bookmarks.*` commands (New Bookmark, Toggle view as needed)
  scoped to the template; side-effect import added in `+layout.svelte`? NO —
  `+layout.svelte` is not in your manifest: add the import line to
  `coreContributions.ts`'s file top instead (it is yours) and note it in your report.
- Template registration: `templates.ts` (`bookmarks` entry per 0c) **and BOTH
  validators** (`app.svelte.ts`, `canvas.svelte.ts` — the AI-phase regression, now
  yours to do up front), `+page.svelte` lazy branch + header scoped buttons via
  header-action contributions.
- Undo domain `bookmarks` registered from the module; `TEMPLATE_DOMAIN` — NOT yours
  (`undo.svelte.ts` unowned): the template falls back to the default domain; register
  the domain id and note in your report that the one-line `TEMPLATE_DOMAIN` mapping
  is a Phase 3 integration item.

### B5. Unit tests

`tests/unit/data-layer-mock.test.ts`: mock engine semantics (AND matching, snippet
markers, reindex-no-dup, source filter, clamps) — these double as the executable spec
the native side was written against. `tests/unit/bookmarks-state.test.ts`: undo
reconcile round-trip (delete → undo → bookmark restored via mock), transact atomicity.

### B6. Docs

Routing docs for every new file; design-doc updates for new sass; **ADR-027** (data
layer: app-global DB + migrations, semantic IPC, mock-parity contract, notes stay
files, session indexing deferred, bookmarks undo-by-reconcile); AGENTS.md: directory
entries for `modules/bookmarks/`, and rule 7 amended to name the data-layer surface as
part of required mock parity. INDEX regen via the skills. **Your commit is incomplete
without this step — list each doc deliverable in your final report** (a prior stream
skipped its docs step; it will be checked first).

### B7. Verify and commit

`pnpm check` (0/0) → `pnpm build` → `npx vitest run` → `npx playwright test`
(existing specs unedited) → dev-server manual pass (browser, mock): add/edit/delete
bookmarks with undo/redo; Search Everything finds a note (open a vault first) and a
bookmark; VirtualList scrolls smoothly with 1,000 synthetic rows (add a temporary
seed loop, then remove it). Commit.

---

## Phase 3 — Integration & verification (run ONCE after merge)

1. Merge `data-layer-native`, then `data-layer-consumers`. Add the one-line
   `TEMPLATE_DOMAIN` entry for `bookmarks` in `undo.svelte.ts` (deliberately left to
   integration — the file is unowned by both streams).
2. `pnpm check` && `pnpm build` && `npx vitest run` && `cargo test` (in `src-tauri/`)
   && `npx playwright test` — all green, existing specs unedited.
3. Author `tests/bookmarks.spec.ts` + a search section (new specs, both streams'
   work merged): open bookmarks template; add a bookmark; edit tags; delete + one
   `Cmd+Z` restores it; Search Everything returns note + bookmark hits with
   highlighted snippets; Enter navigates to the note.
4. **`pnpm tauri dev` (operator, mandatory — the mock cannot prove any of this):**
   `fractalengine.db` appears in the app-data dir on first storage use;
   `schema_migrations` has version 1; add bookmarks, quit, relaunch — they persist;
   search returns them; open a real vault, edit a note, search finds the new text
   after the autosave flush; second consecutive launch runs no duplicate migrations.
5. Parity spot-check: run the same three searches in browser mock and Tauri; hits may
   rank differently (documented) but the same documents must appear.
6. Straggler: `grep -rn "storage_" src/lib | grep -v "ipc.ts\|ipc-mock"` → empty
   (nobody bypasses the gateway).

## Explicitly out of scope (do not improvise)

- Email/IMAP anything; session indexing (kernel edit — reserved enum value only);
  index GC/lifecycle beyond delete-bookmark; file watchers for external note edits.
- Migrating ANY existing persistence (localStorage keys, memory.db, vault files) into
  the new store.
- Connection pooling, WAL tuning, sqlite extensions beyond FTS5, sql.js/WASM in the
  mock.
- Bookmark import/export, browser-extension capture, favicon fetching (roadmap, not
  this phase).
