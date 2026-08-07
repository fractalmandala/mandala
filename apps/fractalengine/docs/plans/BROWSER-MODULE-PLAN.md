---
id: browser-module-plan
title: Browser Module — Ground-Up Implementation Plan
type: plan
tags: [plan, browser, module, tabs, history, bookmarks, vault, passwords, tauri, webview]
status: proposed
updated: 2026-07-17
---

# Browser Module — Ground-Up Implementation Plan

A first-class **browser module** for FractalEngine, structured like the other modules (`ai`, `notes`, `designer`, `bookmarks`, `ide`): its own directory under `src/lib/modules/browser/`, its own state, styles, contributions, and IPC surface. The browser opens in **separate native windows** (multiple allowed), each a real multi-tab browser: tab strip, omnibox, per-tab navigation, **history**, **bookmarks**, and an integrated **password manager with autofill and TOTP**.

This is a rebuild, not a remediation. The current `Browser.svelte` implementation (ADR-007) is kept only as a parts bin — the plan below names exactly what is salvaged and what is deleted.

> **Execution:** split into 3 parallel agent streams in [BROWSER-MODULE-TASKS.md](BROWSER-MODULE-TASKS.md) (A: native engine · B: chrome UI · C: data & credentials).

---

## 1. Where we are today (audit)

### What exists

| Piece | Location | Verdict |
|---|---|---|
| 700-line monolith mixing browser chrome + entire vault UI | `src/lib/components/Browser.svelte` | **Delete** — split into module components |
| Vault state (passwords, matching, Bitwarden import) inside the 2,650-line `ideState` god object | `src/lib/state/ide.svelte.ts` | **Extract** into module state; logic is sound |
| `browserState` re-export shim | `src/lib/state/browser.svelte.ts` | **Delete** |
| Single standalone window: fixed labels `browser-window` / `browser-chrome` / `browser-content`, one content webview, chrome-height `Mutex<f64>` bounds hack | `src-tauri/src/lib.rs` (~1358–1505) | **Replace** with a real window/tab manager in `src-tauri/src/browser/` |
| 6 IPC commands (`open_browser_window`, `browser_navigate/reload/go_back/go_forward/set_content_bounds`) + `browser:native-event` | `src/lib/ipc.ts`, `lib.rs` | **Replace** with tab-addressed command set |
| Iframe fallback in tile mode; back/forward literally log "(Simulated)" | `Browser.svelte` | **Delete** — tile mode goes away (see §3.6) |
| Pure-TS TOTP generator | `src/lib/totp.ts` | **Keep as-is** |
| Encrypted vault persistence via native crypto/keychain boundary; Bitwarden JSON import | `crypto.rs`, ide state | **Keep**, rehome behind module IPC |
| SQLite (rusqlite, FTS5 verified) + search index | `src-tauri/src/storage.rs` | **Keep & extend** — browser history *and* browser bookmarks tables live here |
| Bookmarks "module" | `src/lib/modules/bookmarks/` | **Ignore** — a mock/dummy data-layer demo (ADR-027), created 2026-07-17 with no real content. The browser takes **zero dependency** on it, in either direction. Its eventual fate (delete, or rebuild atop the browser's bookmark store) is a separate decision |
| Tauri `unstable` feature (multi-webview) already enabled | `src-tauri/Cargo.toml` | Foundation for tabs |
| `/browser` route hosting standalone chrome (`browser?native=1`) | `src/routes/browser/` | **Rewrite** to mount the new module shell |

### What's structurally wrong

1. **No tabs.** One content webview with a fixed label means one page per app, ever.
2. **No history.** Navigation events are emitted and dropped on the floor.
3. **No bookmarks.** Nothing browser-side, and the `bookmarks` "module" next door is a content-free mock demo — there is no real bookmark system in the app at all.
4. **Singleton window.** Fixed webview labels make a second browser window impossible.
5. **Autofill is a stub.** In native mode it copies the password to the clipboard and logs "bridge pending".
6. **Vault is trapped in `ideState`**, dragging password data through the IDE undo/persistence machinery.
7. **The chrome-height bounds dance** (frontend measures its own popover, reports px to Rust, Rust clips webviews) is fragile and won't survive tab strips, dropdowns, and menus. The layout contract must be owned by one side.

---

## 1a. Verified foundations ledger

Nothing in this plan is allowed to lean on an "existing" system that hasn't been proven to work. Status as verified **2026-07-17** (re-verify anything marked ⚠ before the phase that consumes it):

| Assumption | Status | Evidence |
|---|---|---|
| SQLite storage layer works (migrations, CRUD, FTS5) | ✅ VERIFIED | `cargo test --lib storage`: 6/6 pass incl. `bundled_sqlite_supports_fts5`, `migrations_are_idempotent`, `bookmark_crud_round_trip_and_delete_removes_index` |
| Bookmarks module | ❌ NOT A FOUNDATION | Mock/dummy data-layer demo created 2026-07-17 (ADR-027); its tests pass but there's nothing real behind it. The browser takes no dependency on it (§3.4). Only its underlying `storage.rs` FTS/trigger *pattern* is reused — that pattern is what the ✅ storage row verifies |
| IPC gateway + mock parity contract holds | ✅ VERIFIED | `ipc-contract.test.ts`, `contribution-contracts.test.ts` pass (31 tests across the four suites run) |
| Vault encryption boundary works | ✅ VERIFIED (unit) | `cargo test --lib crypto`: 5/5 pass (round-trip, wrong-key rejection, nonce uniqueness). ⚠ Runtime keychain path exercised only by the current app — smoke-test load/save in P0 before extraction |
| Undo engine | ✅ VERIFIED | `undo-history.test.ts` passes |
| Tauri multi-webview available | ✅ Feature enabled (`unstable` in Cargo.toml); current app already creates child webviews. ⚠ N-tabs show/hide, overlay z-order/transparency **unproven** → P1 spike is mandatory, plan does not proceed past it on assumption |
| bits-ui | ⚠ INSTALLED, NOT USED BY THIS PLAN | `bits-ui@^2.18.1` in package.json, imported by exactly one demo file. Adoption is deferred to a follow-up plan (§3.10) — this plan hand-rolls its UI and only keeps the swap cheap |
| ADR-007 text | ❌ PARTIALLY STALE | Seed-on-first-run and `bundle.resources` vendoring claims no longer match code (verified against `lib.rs` / `tauri.conf.json`). Treat ADR-007 as history, not spec; corrected in P6 |
| Old standalone browser window | UNVERIFIED at runtime, and irrelevant — it is demolished, not built upon |

**Rule going forward:** any phase step that says "reuse X" must cite this table. If X isn't in the table with a ✅, the phase starts by verifying it (running its tests / smoke-testing it in the app) and recording the result here.

---

## 1b. Cutover enforcement — no zombie code, mechanically guaranteed

The AI layer's failure mode was *coexistence*: new code shipped while old state paths stayed alive, so the feature silently kept running on stale wiring for weeks. This plan makes that unrepresentable:

1. **Demolition is a test, not a promise.** P0 adds `tests/unit/browser-demolition.test.ts`: a contract test that fails the suite if any forbidden legacy symbol still appears in `src/` or `src-tauri/src/` (grep-based, same style as `html-boundary.test.ts`). The forbidden list starts with the §6 deletion ledger symbols and **grows at every phase** — when a phase replaces something, its old identifiers are appended in the same PR that lands the replacement. CI cannot be green while zombie code exists.
2. **Hard cutover, never dual-path.** At no commit are the old and new browser engines both invocable. Each replacement lands as *delete + replace in one changeset*. Compatibility re-export shims (the `state/browser.svelte.ts` pattern) are explicitly banned — callers are migrated, not bridged.
3. **One owner per persisted concern.** Exactly one persistence location per concern (vault file, history DB, session-restore blob, layout prefs). P0's vault extraction includes: migrate/verify the existing encrypted vault loads through the new module state, then delete the old reader/writer *in the same commit*. Any old localStorage/JSON keys are enumerated in the deletion ledger and their readers removed; a leftover key with a live reader is a demolition-test failure.
4. **"Done" means used, not merely green.** Every phase's acceptance includes driving the real app (via the `run-fractalengine` skill) through the phase's user-visible flow and confirming the *new* path served it (log/inspect, not vibes). A phase whose feature works in tests but not in the running app is not done — this is the exact AI-module trap.
5. **Deletion ledger is a checklist with owners.** §6 gains a per-item phase column; P6's closing audit walks the ledger and the demolition test's forbidden list and confirms 1:1 coverage — every ledger item has a corresponding forbidden symbol, every forbidden symbol traces to a ledger item.

---

## 2. Design principles

1. **The browser is a module.** Everything lives under `src/lib/modules/browser/` (components, state, styles, types, contributions) and `src-tauri/src/browser/` (window/tab engine, autofill bridge). Nothing browser-related remains in `ideState` or `src/lib/components/`.
2. **Rust owns windows, tabs, and navigation; the frontend mirrors.** The native side is the source of truth for tab list, active tab, URLs, titles, and can-go-back/forward. It pushes state via one event channel; the frontend renders it and issues commands. No frontend-guessed navigation state, no "(Simulated)".
3. **Everything is addressed.** Every command and event carries `{ windowId, tabId }`. No fixed labels, no global mutexes keyed to a single window.
4. **Events are generation-stamped.** Each tab keeps a monotonically increasing `navEpoch`; stale events (from a navigation superseded by a newer one) are dropped by consumers. (Same discipline as the AI layer's `runId` — see AI-LAYER-FRESH-PLAN §1.4.)
5. **History and bookmarks are app-level data; the browser is their primary writer, not their owner.** Both live in module-neutral tables in the app's SQLite store (`storage.rs`) behind module-neutral IPC (`history*`, `bookmark*` — no `browser` prefix in table or command names). The browser module is the *steward*: it captures visits, provides the canonical mutation UI (star, edit, clear-history), and defines the schema's evolution. But any module — notes, wiki, AI chat, a future bookmarks gallery — reads (and, where sensible, writes) the same data through the same IPC gateway, without importing anything from `modules/browser/`. The data outlives and exceeds the browser window. What the browser keeps private is only its *frontend state* (tab mirrors, omnibox state, vault UI state) — never the data. The browser depends on the storage layer only — **not** on the mock `bookmarks` module (see §1 audit / §1a ledger).
6. **Credentials never relax.** Vault persistence stays behind the native crypto/keychain boundary; autofill values travel only Rust→page on explicit user action; the page never gets a way to query the vault. TOTP stays the pure-TS generator.
7. **Single IPC gateway + mock parity** (`ipc.ts` / `ipc-mock.ts` / `IpcApi` contract test), per ADR-004/ADR-028. `pnpm dev` in a plain browser gets a fully simulated tab engine so the chrome UI is developable and testable outside Tauri.
8. **Undo discipline:** vault CRUD and bookmark CRUD are undoable (each its own registered undo domain). **Navigation, tab open/close, and history are not undo domains** — "reopen closed tab" is a browser feature (Cmd+Shift+T backed by a closed-tab stack), not `UndoHistory`.
9. **Tokens-only styling, indented SASS,** module styles under `src/lib/modules/browser/styles/`, imported from `src/lib/styles/index.sass`. No `<style>` blocks, no native color inputs.

---

## 3. Architecture

```
┌─ Browser window (Tauri Window, one per user window) ───────────────┐
│ ┌─ chrome webview (App route /browser?win=<id>) ─────────────────┐ │
│ │  BrowserShell.svelte                                           │ │
│ │   TabStrip · NavControls · Omnibox · VaultButton · Menu        │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ ┌─ content webviews — one per tab, only active one visible ──────┐ │
│ │  tab:<uuid>   tab:<uuid>   tab:<uuid>                          │ │
│ └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
        ▲ commands (invoke)                 │ events (browser:event)
┌───────┴────────────────────────────────────▼────────────────────────┐
│ src-tauri/src/browser/                                              │
│  mod.rs      — command surface, state registry                      │
│  windows.rs  — window + webview lifecycle, bounds/layout            │
│  tabs.rs     — tab model, nav state, closed-tab stack               │
│  history.rs  — visit capture → storage.rs tables                    │
│  autofill.rs — form detection + fill injection (eval bridge)        │
└─────────────────────────────────────────────────────────────────────┘
        ▲                                    ▲
        │ storage.rs (SQLite: history,       │ crypto.rs (encrypted
        │  bookmarks, FTS5 suggestions)      │  vault persistence)
```

### 3.1 Native window/tab engine (`src-tauri/src/browser/`)

- **Registry:** `BrowserRegistry` (app-managed state): `HashMap<WindowId, BrowserWindow>`; `BrowserWindow { window_label, chrome_label, tabs: Vec<Tab>, active: TabId, closed_stack: Vec<ClosedTab> }`; `Tab { id, webview_label, url, title, favicon_url, can_go_back, can_go_forward, loading, nav_epoch }`.
- **Layout contract, replacing the chrome-height hack:** the chrome webview is **full-window** and renders the entire module layout (§3.9): header, padding, sidebars. The active tab's content webview is positioned to the **viewport rect** — the `central-carrier.browser-viewport` element's bounding rect, tracked by a ResizeObserver and reported via `browser_set_viewport_bounds(windowId, rect)` (logical px; fires on mount, window resize, sidebar toggle/drag). The content webview sits **above** the chrome webview in z-order during normal browsing; when any overlay opens (vault, menus, omnibox dropdown, tab context menu), `browser_set_chrome_overlay(true)` raises the chrome webview above the content webview so the overlay can extend past the header. One rect stream + one boolean — no popover-height math. **P1 spike must validate:** chrome-above/below-content z-order flipping, click-through correctness outside the viewport rect, and whether the carrier's rounded corners/background can visually frame the rectangular native webview (if not: square viewport corners, decide in §3.9). Fallback if z-order flipping misbehaves: keep the content webview always on top and render overlays in a third, transparent, click-through-except-overlay webview.
- **Tab ops:** `browser_tab_create(windowId, url, background)`, `browser_tab_close`, `browser_tab_activate` (show/hide webviews), `browser_tab_reorder`, `browser_tab_reopen_closed`, `browser_navigate(windowId, tabId, input)`, `browser_reload`, `browser_stop`, `browser_go_back/forward`, `browser_window_open(url?)`, `browser_window_close`.
- **Events:** single channel `browser:event` with a tagged payload: `tab-created | tab-closed | tab-activated | nav-started | nav-committed | title-changed | favicon-changed | load-finished | load-failed | window-closed`, every payload carrying `{ windowId, tabId, navEpoch }`. `on_navigation` / `on_page_load` hooks per content webview feed these. Popup requests (`window.open`, target=_blank) become `browser_tab_create` in the same window.
- **URL normalization** (`normalize_browser_url`) is kept: http(s) only; bare terms route to the configured search engine (setting, default DuckDuckGo/Google).

### 3.2 Frontend module (`src/lib/modules/browser/`)

```
src/lib/modules/browser/
  components/
    BrowserShell.svelte      — standalone-window chrome root (mounted by /browser route)
    TabStrip.svelte          — tabs, favicons, close buttons, new-tab button, drag reorder
    NavControls.svelte       — back/forward/reload-stop
    Omnibox.svelte           — address input + suggestion dropdown (history/bookmarks/search)
    BrowserMenu.svelte       — ⋯ menu: history panel, bookmarks, settings, open-in-OS-browser
    HistoryPanel.svelte      — searchable visit list, delete entry, clear range
    BookmarkStar.svelte      — star toggle + edit popover (name, tags)
    BookmarksRow.svelte      — header bottom row (browser-header-bot): top-level bookmarks/folders
    vault/
      VaultPopover.svelte    — popover shell + tabs (Matching / All / Add-Edit)
      VaultList.svelte       — entry rows, reveal/copy, TOTP ring
      VaultForm.svelte       — add/edit form
  state/
    browser.svelte.ts        — window/tab mirror fed by browser:event; command wrappers
    suggestions.svelte.ts    — debounced omnibox query state
    bookmarks.svelte.ts      — browser's view of the app-level bookmark store (own undo domain)
    vault.svelte.ts          — vault entries, domain matching, Bitwarden import, undo domain
  styles/                    — _browser.sass, _tabstrip.sass, _omnibox.sass, _vault.sass
  contributions.ts           — commands + keybindings (see §3.5)
  types.ts                   — Tab, BrowserEvent, Suggestion, PasswordEntry, VaultInput
```

- `browser.svelte.ts` holds a class instance per chrome window (`?win=` param selects which `windowId` it mirrors), subscribes to `browser:event`, filters by its windowId, and drops stale `navEpoch` events.
- The `/browser` route becomes a thin mount of `BrowserShell` — no IDE layout, no canvas.

### 3.3 History

- **Schema (extend `storage.rs`):** `history_urls (id, url UNIQUE, title, favicon_url, visit_count, last_visit_at)` + `history_visits (id, url_id, visited_at, transition)` + FTS5 virtual table over `url, title` synced by triggers (same pattern as the existing search index; FTS5 availability already unit-verified).
- **Capture in Rust** on `nav-committed` + `title-changed` — the frontend cannot forget to record. Redirect chains record the final URL; reloads bump `visit_count` without a new row spam (debounce identical consecutive visits within a few seconds).
- **IPC:** `historySearch(query, limit)`, `historyRecent(limit)`, `historyDeleteUrl(id)`, `historyClearRange(from?, to?)`.
- **Surfaces:** omnibox suggestions (top-N by FTS rank × frecency), HistoryPanel (grouped by day, search, per-row delete, "Clear browsing history…" with range picker). History is **excluded from undo** — deletion confirms via dialog instead.
- **App-level like bookmarks (§3.4a):** the `history*` IPC is module-neutral; any module may query it. Capture stays exclusively in Rust (single writer), and surfacing history in other contexts (AI prompts, global search) is opt-in per §3.4a's privacy notes.

### 3.4 Bookmarks (app-level data, browser-stewarded)

- **App-level store, no dependency on the mock `bookmarks` module's frontend.** Tables in `storage.rs`: `bookmarks (id, url UNIQUE, title, description, favicon_url, tags, folder_id, position, created_at, updated_at)` + optional `bookmark_folders`, indexed into FTS5 alongside history (the FTS/trigger pattern is proven — §1a). The existing `bookmarks` table (created today for the mock module, real SQLite but with no real consumer) is **evolved via a schema migration** at P4 — extend, don't fork; one bookmarks table in the app, ever. Module-neutral IPC: `bookmarkList/Add/Update/Delete`, `bookmarkForUrl(url)` (repurposing/replacing the existing `listBookmarks`/`addBookmark` surface in the same changeset — demolition rules apply to the superseded signatures).
- **Frontend:** `modules/browser/state/bookmarks.svelte.ts` — the browser's *view* of the store (own `UndoHistory` + registered undo domain, mock parity in `ipc-mock.ts`). This is UI state, not the data's home: other modules never import it; they call the same IPC.
- Star = bookmarked-check by URL, toggle, quick-edit popover (title, tags, folder). Omnibox suggestions merge bookmark hits (ranked above history). The **bookmarks row** (`browser-header-bot`, §3.9) is core layout — it renders top-level bookmarks/folders in the header's bottom row; a hide toggle is a settings candidate (§3.8).
- The dummy `src/lib/modules/bookmarks/` frontend module is left untouched by this plan; deleting it or rebuilding it (e.g. as a bookmarks gallery) atop this app-level store is a separate follow-up decision.

### 3.4a Cross-module consumption (post-v1 doors this design holds open)

The point of app-level data + neutral IPC is that these integrations need **zero browser-module changes**:

- **Notes / wiki:** insert-bookmark or insert-history-link pickers call `bookmarkList` / `historySearch` directly; a pasted URL can be annotated from `bookmarkForUrl`.
- **AI chat:** a context provider can feed recent history / bookmarks into a prompt via the same IPC (subject to an explicit user toggle — browsing history entering prompts is a privacy decision, not a default).
- **Bookmarks gallery:** a standalone surface (or the rebuilt `bookmarks` module) rendering the same tables — favicon grid, tags, folders — with its own undo domain over the same IPC.
- **Global search:** bookmarks are already indexable via the app search index (`storage_search_all`); history indexing is possible but **off by default** (same privacy posture as the AI toggle).
- **Contract:** cross-module reads/writes go through the IPC gateway only. `modules/browser/` internals (state classes, components) stay un-importable from other modules — enforced by the demolition/dependency test from P4 on (both directions).

### 3.5 Password vault v2

- **Extraction:** all `passwordsList` / `matchingLogins` / CRUD / import logic moves from `ide.svelte.ts` into `modules/browser/state/vault.svelte.ts` with its own `UndoHistory` + `registerUndoDomain('vault')`. Persistence keeps the current encrypted native boundary (`loadPasswordDatabase`/`savePasswordDatabase` through the gateway); transactional rollback semantics from ADR-007 are preserved. `ideState` loses every vault field (breaking-change sweep + facade removal).
- **Domain matching** targets the **active tab's URL** (registrable-domain match, not string-prefix).
- **Real autofill (`autofill.rs`):** on user "Fill" click only: chrome → `browser_autofill(windowId, tabId, entryId)` → Rust resolves credentials from the vault (frontend sends only the entry id, mirroring the AI-key pattern) → injects via content-webview `eval` a script that finds username/password fields, sets values with proper `input` events, and self-destructs. Values are JSON-escaped into the script; nothing persists in the page context. No auto-fill-on-load, no page-initiated queries — injection is one-way and user-triggered. Save-prompt (detect submitted logins) is explicitly **out of scope** for v1.
- **TOTP:** unchanged (`totp.ts`), plus a "copy code" action next to Fill.
- **Import is a one-time migration path, not a feature.** The Bitwarden JSON import exists solely to migrate the user's vault once; there is no ongoing sync ambition and the old seed-on-first-run behavior is already gone from `lib.rs` (ADR-007's text is stale on this — correct it in P6). Keep the Import button, demote it into the vault's overflow menu.
- **Save-password capture (required — see §3.5.1):** the vault can't replace a real password manager if credentials created *after* migration can't get in without hand-typing. The autofill init script also watches for submitted login forms (password field + successful navigation) and reports `{origin, username}` — never the password directly to the chrome — to Rust, which holds the candidate and asks the chrome to show a "Save this login?" prompt; on accept, Rust writes the entry through the same encrypted vault path. Decline is remembered per origin.
- **Password generator:** a generate button in VaultForm and in the save prompt (length/symbols options, sensible defaults). Trivial to build, mandatory for daily use.
- **Export:** vault export to Bitwarden-compatible JSON via native save dialog — the exit door that makes going all-in safe. No lock-in.

#### 3.5.1 Bitwarden exit criteria

The user's explicit goal is to **drop Bitwarden** once this browser is daily-drivable. The vault is "done" only when all of these hold:

1. One-time import of the full Bitwarden export succeeds (logins + TOTP seeds verified against live sites).
2. Autofill works on real login forms (P5).
3. New logins can be captured via the save prompt and generated via the generator — the vault grows without manual JSON edits.
4. Export works, and the encrypted-vault file location + backup procedure are documented in `docs/areas/browser.md`.
5. **Cleanup:** the plaintext `vendors/bitwarden_export_*.json` on disk (gitignored, not bundled — verified 2026-07-17) is securely deleted after migration is confirmed, and the Bitwarden account can be retired.

### 3.6 What happens to the browser *tile*

The canvas `browser` tile kind currently mounts the monolith with the iframe fallback. Decision: **the tile becomes a launcher card** — shows the last session's tabs/URL and a single "Open Browser" action that calls `browser_window_open`. No embedded page rendering inside the main window (the iframe mode was already a placebo: sandboxed, most sites refuse framing, nav simulated). This deletes the entire iframe/sandbox/`allow-same-origin` surface. If embedded browsing in the canvas is ever wanted again, it returns as a child webview positioned over the tile — a separate future plan.

### 3.7 Mock parity (`ipc-mock.ts`)

A `MockTabEngine` in the mock: in-memory windows/tabs, fake navigation (instant `nav-committed`/`title-changed` with derived titles), history recorded to in-memory tables, suggestions from them. The full chrome UI — tab strip, omnibox, history panel, vault — works under `pnpm dev` with the standard "content opens in the desktop app" placeholder pane as the page area. Parity enforced by the existing `IpcApi` + `ipc-contract.test.ts`; native-only additions (webview bounds, eval injection) documented as NATIVE_ONLY per ADR-028 with justification.

### 3.8 Contributions & settings

- **Commands** (`modules/browser/contributions.ts`): Open Browser Window (`Cmd+Shift+B` proposal), New Tab (`Cmd+T`), Close Tab (`Cmd+W`), Reopen Closed Tab (`Cmd+Shift+T`), Focus Address Bar (`Cmd+L`), Reload (`Cmd+R`), Next/Prev Tab (`Ctrl+Tab`/`Ctrl+Shift+Tab`), Show History (`Cmd+Y`), Bookmark This Page (`Cmd+D`). Chrome-window keybindings are scoped to the browser window (the shell registers its own handler from the same declarations; they must not fire in the IDE window).
- **Window toggle (owner requirement): `` Cmd+` `` alternates between the browser window and the main app window.** The one keybinding registered in *both* windows (declared once, handled by both the IDE shortcut handler and the browser shell handler): from the main window it focuses the most-recently-focused browser window (opening one if none exists is a settings-candidate nicety, default no-op); from any browser window it focuses the main window. Backed by a `browser_toggle_focus` command — Rust tracks last-focused browser window in the registry and drives native focus. Note: `` Cmd+` `` is macOS's native cycle-app-windows shortcut; our in-webview handler intercepts it while our windows are focused, which is exactly the surface we control — behavior degrades to the OS default only in edge states (e.g. a native dialog focused), which is acceptable.
- **Settings** (SettingsDialog, manual for now): default search engine, homepage / new-tab URL, "reopen last session" toggle, clear-history action.

### 3.9 Design layer — layout, classes, typography

> Layout structure set by the owner (2026-07-17). Every shared class named below is **verified present** in `src/lib/styles/_commons.sass` and in use by the ide/notes/ai/designer layouts.

**Structure — the browser is a standard module layout** (same skeleton as `ClassicIdeLayout` / `NotesLayout`):

```html
<div class="module-wrapper browser-wrapper">
	<div class="browser-header">     <!-- 108px, three 36px rows + 0 gap -->
		<div class="browser-header-top"></div> <!--area for all tabs--> 
		<div class="browser-header-mid"></div> <!--area for back/forward/reload · explorer strip, (address input, star at right end) · window actions-->
		<div class="browser-header-bot"></div> <!--bookmarks row -->
	</div>
	<div class="inside-module-wrapper">  <!-- fills remaining height -->
		<aside class="module-sidebar browser-left">  
			<!-- collapsible, collapsed by default, persisted; shared resizer classes/behavior; EMPTY in v1 -->
		</aside>
		<div class="module-central">
			<div class="central-carrier browser-viewport"> 
				<!-- native content webview tracks this element's rect (§3.1) -->
			</div>
		</div>
		<aside class="module-sidebar browser-right">  <!-- same as browser-left; EMPTY in v1 -->
		</aside>
	</div>
</div>
```

```sass
.browser-wrapper
	padding: var(--sz-8)
	display: flex
	flex-direction: column
	gap: 0

.browser-header
	display: flex
	flex-direction: column
	width: 100%
	height: var(--sz-108)
	gap: 0

.browser-header-top
	padding-left: 88px	// macOS traffic-light inset — platform-conditional

.browser-header-top, .browser-header-mid, .browser-header-bot
	height: var(--sz-36)
```

**Rules & notes:**

- **Header 108px = 3 × 36, zero gap.** The size scale (`--sz-*`) is 1/2/4/8/12/16/24/32/40/48/64/96/128 — **--sz-36 and --sz-108 have been created for use here**.
- **No footer.** `inside-module-wrapper` takes all remaining height (it already does: `flex: 1`).
- **Sidebars are standard module sidebars:** `module-sidebar` + `sidebar-carrier`/`sidebar-content` internals, the shared resizer handle classes, `sidebar-collapsed-zone` for collapse — identical behavior to ide/notes. Collapsed by default; user-set collapse/width persisted (copy the notes-module persistence pattern: `sidebarNCollapsed` + expanded-width fields in layout prefs). **Empty in v1** — they exist as structure; candidates later: history/bookmarks panel left, vault or AI-context right.
- `browser-left` / `browser-right` / `browser-viewport` modifier classes are added **only if** a style can't live on the shared class — default to bare `module-sidebar` / `central-carrier`.
- **Traffic-light inset:** the 88px `padding-left` applies only when the window actually uses an overlay titlebar on macOS (`titleBarStyle: Overlay`); gate it by platform/window-config, not unconditionally, or Windows/Linux get a dead 88px.
- **Viewport = layout truth for the native webview.** The `central-carrier.browser-viewport` rect drives `browser_set_viewport_bounds` (§3.1). Sidebar drag/toggle and window resize therefore move the *page itself* — the resize handles' drag must stay smooth with a live webview tracking them (spike/verify in P1; throttle rect reports to animation frames). Rounded-corner framing of the webview is a P1 spike question; if the native surface can't be clipped, the viewport gets square corners.
- **Tokens only, semantic layer only:** chrome surfaces on `--background10/…`, borders `--border-secondary`, text `--text-primary/secondary`, accent `--theme-color`. The browser must feel like the same app in a different frame — no browser-special palette.
- **Class vocabulary from the registry:** new classes follow `docs/design/07-class-registry.md` conventions + utility primitives (`05-utility-primitives.md`); typography per `03-typography.md` / `13-control-text-taxonomy.md` (chrome controls are control text; tab labels are truncated label text). Every new class lands in the registry via the styling-docs-builder skill (Rule 10).
- **Module SASS files** (`modules/browser/styles/`): `_browser-shell.sass` (wrapper/header/rows above), `_tabstrip.sass`, `_omnibox.sass`, `_vault.sass`, `_history.sass` — imported from `src/lib/styles/index.sass`. `browser-` prefix; the monolith's old `browser-*` rules die with it (prefix reused, rules not).
- **bits-ui:** deferred out of this plan — see §3.10.
- **Row assignment (owner decision 2026-07-17):** tabs own the top row (traffic-light inset applies here), nav/address/actions the mid row, bookmarks the bottom row — three dedicated 36px rows, no sharing. The bookmarks row is therefore **core layout, not an optional extra** (§3.4/P4 updated); whether it can be hidden is a settings candidate (§3.8), and hiding it shrinks the header to 2 rows (another reason for the calc-based height token).
- **Still open (owner input welcome):** tab visual style within the top row, star-filled state treatment, new-tab page design, light/dark treatment of the viewport seam.

### 3.10 bits-ui — deferred to its own follow-up plan

**Decision (owner, 2026-07-17): bits-ui adoption is NOT part of this plan.** It adds unnecessary load right now. A separate **BROWSER-BITS-UI-PLAN** (or an extension of BITS-UI-ADOPTION-PLAN) gets written *after* the browser core works, mapping primitives to surfaces then.

What this plan does instead, and the two things it must get right so that later swap stays cheap:

- **v1 builds all chrome UI hand-rolled** with the app's existing patterns and classes (same as every other module today). The monolith's native `confirm()` is still replaced in P2 — with a simple module-styled confirm dialog, not `AlertDialog`.
- **Overlay coordination is load-bearing regardless of UI library:** any floating layer (vault popover, menus, dialogs, omnibox suggestions) renders in the chrome webview, which normally sits *below* the content webview (§3.1). The module ships one `overlayCoordinator` utility — a counting rune store every overlay's open-state reports into, driving `browser_set_chrome_overlay(open > 0)` from a single `$effect`. This exists in v1 no matter what renders the overlays.
- **Keep the swap contained:** overlay-ish components (popovers, menus, confirm dialog, suggestion listbox) expose controlled `open` props and keep their trigger/content structure — so a future bits-ui migration replaces component internals without touching call sites, state, or the coordinator.

---

## 4. Phases

Every phase gate = **(a)** typecheck + unit + contract suites green, **(b)** `browser-demolition.test.ts` extended with that phase's newly-dead symbols and green, **(c)** the phase's user-visible flow driven in the *running app* (`run-fractalengine` skill) with confirmation the new path served it (§1b.4), **(d)** docs updated (area doc + ADR + design doc + `pnpm docs:filetables` + INDEX where applicable).

### P0 — Extraction & demolition (no behavior change where avoidable)
- **Smoke-test first:** load/save the real encrypted vault through the current runtime keychain path and record the result in §1a (the one ⚠ on the vault row).
- Scaffold `src/lib/modules/browser/` and `src-tauri/src/browser/` skeletons.
- Move vault state out of `ide.svelte.ts` into `vault.svelte.ts` (own undo domain); migrate all callers in the same changeset; delete the `state/browser.svelte.ts` shim and every vault field/method on `ideState` — no facade left behind (§1b.2–3).
- Convert the canvas browser tile to the launcher card (§3.6); delete iframe path.
- **Create `tests/unit/browser-demolition.test.ts`** seeded with the P0 dead symbols (`browserState`, vault members on `ideState`, iframe/sandbox path markers).
- **Accept:** vault CRUD/import/TOTP works exactly as before from the (still-old) standalone window *in the running app*; `ideState` has zero vault fields; demolition test green; all suites green.

### P1 — Window/tab engine (Rust) + spike
- **Spike first (timeboxed):** on macOS WKWebView, validate (a) N child webviews with show/hide switching, (b) content webview positioned to an arbitrary viewport rect over a full-window chrome webview, (c) z-order flip for overlays (chrome above content and back), (d) live rect tracking during sidebar resize — smooth at animation-frame throttle, (e) whether the native surface can be corner-clipped to match `central-carrier` styling, (f) per-webview back/forward. Record findings; pick overlay strategy (§3.1) accordingly. Watch the known WKWebView repaint quirks (cf. the box-shadow/image-flash issue previously hit in this app).
- Implement `BrowserRegistry`, window/tab lifecycle, addressed command set, `browser:event` contract with `navEpoch`; delete the old six commands, fixed labels, and `BrowserChromeHeight` mutex.
- IPC gateway + mock `MockTabEngine` + contract test updates.
- **Accept:** two browser windows, each with 3+ tabs, independent nav state; close/reopen tab works; events correctly addressed under interleaved navigation (adversarial test: navigate tab A, activate B, close A mid-load — no cross-tab bleed, no stale-epoch application).

### P2 — Chrome UI
- `BrowserShell` + TabStrip + NavControls + Omnibox (no suggestions yet) + BrowserMenu; rewrite `/browser` route; window keybindings incl. the `` Cmd+` `` main↔browser toggle wired in both windows (`browser_toggle_focus`); drag-region/maximize behavior preserved.
- Vault popover re-homed into the new chrome as `vault/` components (visual re-skin only, logic from P0).
- **Accept:** full browsing session driven purely from the new chrome in Tauri; same chrome fully interactive under `pnpm dev` mock; styles token-only, module SASS.

### P3 — History
- `storage.rs` tables + FTS5 + capture in `history.rs`; IPC quartet; HistoryPanel; omnibox suggestions (history + bookmarks merged, keyboard navigable).
- Fixture tests: malformed rows, duplicate URLs, boundary timestamps; debounced repeat visits.
- **Accept:** visits recorded from real navigation incl. redirects; suggestion ranking sane; clear-range works and empties FTS too.

### P4 — Bookmarks integration
- Schema migration evolving the existing `bookmarks` table to the §3.4 shape (+ folders); FTS wiring; module-neutral IPC (`bookmark*`) + mock parity, superseding the old `listBookmarks`/`addBookmark` surface in the same changeset; `state/bookmarks.svelte.ts` with its own undo domain; star button + edit popover; omnibox bookmark hits; bookmarks row (`browser-header-bot`) populated (P2 ships it as an empty placeholder row).
- **Accept:** star/unstar round-trips through SQLite in the running app; bookmark edits are atomically undoable; bookmark hits rank above history in omnibox suggestions; a scratch script (or test) proves the data is readable via bare IPC with zero `modules/browser/` imports (§3.4a contract); dependency rule enforced by the demolition test from P4 on — no `modules/bookmarks/` imports in `modules/browser/` and no `modules/browser/` state imports anywhere outside it.

### P5 — Credential bridge (autofill + capture + generator + export)
- `autofill.rs` injection path (entry-id-only IPC, escaped one-shot script); registrable-domain matching; Fill + copy actions from VaultPopover against the active tab.
- Save-password capture flow (§3.5): submit detection → Rust-held candidate → chrome prompt → encrypted write; per-origin decline memory.
- Password generator in VaultForm and save prompt; vault export to Bitwarden-compatible JSON via native save dialog.
- Security review pass: injection script audit, no vault read path from page, capture payload never exposes the password to the chrome webview, event-source validation on all `browser:*` handlers.
- **Accept:** login form on a real site fills on click; signing up on a real site with a generated password lands an entry in the vault via the prompt; export→re-import round-trips losslessly; hostile page cannot trigger or observe vault operations (add a test page under `tests/` that tries). Bitwarden exit criteria (§3.5.1) 1–3 demonstrably met.

### P6 — Settings, session restore, docs closure
- Settings entries (§3.8); "reopen last session" (persist open tabs per window on close, restore on `browser_window_open` when enabled).
- **ADR-029 (or next): "Browser Module Rebuild"** superseding the architecture half of ADR-007 (vault/TOTP decisions stay, marked as re-homed); update ADR-007 status/notes and correct its stale claims (seed-on-first-run and `bundle.resources` vendoring no longer exist in code); new `docs/areas/browser.md` including the vault file location + backup procedure (§3.5.1 criterion 4); design docs for new components; regenerate INDEX + file tables.
- Full Audit Completeness Protocol pass (mutation inventory: vault + bookmarks undoable, navigation/history explicitly not; async nav under cancellation/out-of-order; persisted fixtures).

---

## 5. Explicit non-goals (v1)

Downloads manager, extensions/ad-block, multiple profiles/containers, cookie manager UI, Bitwarden *sync* (import/export only — the vault replaces Bitwarden, it doesn't talk to it), tab audio indicators, find-in-page, devtools toggle UI, embedded (in-canvas) page rendering. Each is a candidate follow-up; none blocks the core promise: **windows, tabs, history, bookmarks, and a vault good enough to retire Bitwarden**.

## 6. Deletion ledger

Every row becomes a forbidden symbol in `browser-demolition.test.ts` in the phase listed; P6's closing audit confirms ledger ↔ forbidden-list 1:1 coverage (§1b.5).

| What dies | Phase | Forbidden markers (grep) |
|---|---|---|
| `src/lib/state/browser.svelte.ts` shim + `browserState` import sites | P0 | `browserState`, `state/browser.svelte` |
| Vault fields/methods on `ideState` | P0 | `passwordsList`, `matchingLogins`, `importBitwardenFile` etc. outside `modules/browser/` |
| Iframe fallback, sandbox handling, "(Simulated)" nav | P0 | `browser-iframe`, `allow-same-origin`, `(Simulated)` |
| Fixed labels, `BrowserChromeHeight` mutex, `browser_set_content_bounds` protocol | P1 | `BROWSER_WINDOW_LABEL`, `BROWSER_CHROME_LABEL`, `BROWSER_CONTENT_LABEL`, `BrowserChromeHeight`, `browser_set_content_bounds` |
| Old 6-command IPC surface (`open_browser_window`, un-addressed `browser_navigate/reload/go_back/go_forward`) + mock twins + `browser:native-event` | P1 | old command names in `ipc.ts`/`ipc-mock.ts`/`lib.rs`, `browser:native-event` |
| `src/lib/components/Browser.svelte` + its `_commons`/component SASS rules | P2 | `components/Browser.svelte`, orphaned `browser-*` rules outside `modules/browser/styles/` |
| Native `confirm()` in vault delete flow | P2 | `confirm(` within `modules/browser/` |
| Stale ADR-007 claims | P6 | (doc correction, not grep) |

## 7. Risks

| Risk | Mitigation |
|---|---|
| Tauri multi-webview is `unstable`; per-platform bounds/z-order/transparency quirks | P1 spike before committing to the overlay model; documented fallback (two-state height reporting) |
| WKWebView repaint/decode quirks (seen before in this app) | Keep chrome compositing simple: no shadows over webview seams; verify on macOS first |
| Event races across tabs/windows | Addressed events + `navEpoch` stamps + adversarial interleaving tests (P1 acceptance) |
| Autofill injection as attack surface | User-triggered only, id-only IPC, escaped one-shot script, security pass in P5 |
| Vault extraction breaking IDE persistence/undo | P0 is isolated and fully test-gated before any engine work starts |
| Cookie/session behavior tied to platform webview store | Accept for v1 (same as ADR-007 note); profiles deferred |
