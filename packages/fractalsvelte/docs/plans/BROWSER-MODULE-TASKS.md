---
id: browser-module-tasks
title: Browser Module — Execution Task Streams (A/B/C)
type: plan
tags: [plan, browser, tasks, streams, execution, parallel]
status: proposed
updated: 2026-07-17
---


Execution breakdown of [BROWSER-MODULE-PLAN.md](BROWSER-MODULE-PLAN.md) into **3 parallel streams** for 3 agents. Read the plan first — this file says *who does what in what order*; the plan says *what and why*. Section references (§) point into the plan.

---

## Ground rules (all agents)

1. **Read before writing:** `AGENTS.md`, `BROWSER-MODULE-PLAN.md` (entire), and this file. The plan's §1b cutover-enforcement rules and §1a verified-foundations rules are binding.
2. **Branches:** `browser/stream-a`, `browser/stream-b`, `browser/stream-c` (worktrees recommended, matching the designer-hygiene stream pattern). Rebase on `master` at every checkpoint; merge to `master` only at the checkpoints listed below, gates green.
3. **File ownership is exclusive** (table below). If your task needs a change in another stream's file, you write the request in your PR description and the owning stream lands it — never edit it yourself. Exception: the four **shared append-zones** (see table) may be appended to by any stream, conflicts resolved at checkpoints.
4. **Every merge passes:** `svelte-check`, `vitest run`, `cargo test`, `browser-demolition.test.ts` (once it exists, C1), and — for user-visible work — the running-app check (§1b.4, `run-fractalengine` skill).
5. **No new "existing thing" trust:** if a task leans on something not ✅ in §1a, verify it first and record the result in §1a.
6. **Docs discipline per merge** (AGENTS.md Rule 10): area docs, design docs, ADRs, `pnpm docs:filetables`, INDEX regeneration — the stream that lands the code lands its docs.

### File ownership

| Path | Owner |
|---|---|
| `src-tauri/src/browser/**` (new), `src-tauri/src/lib.rs` (browser sections), `tauri.conf.json` | **A** |
| `src/lib/modules/browser/components/**`, `styles/**`, `state/browser.svelte.ts`, `state/suggestions.svelte.ts`, `src/routes/browser/**`, `contributions.ts`, launcher-card tile | **B** |
| `src/lib/modules/browser/state/vault.svelte.ts`, `state/bookmarks.svelte.ts`, `state/history.svelte.ts`, `src/lib/state/ide.svelte.ts` (extraction edits), `src-tauri/src/storage.rs`, vault Rust sections, `tests/unit/browser-demolition.test.ts` | **C** |
| `src/lib/modules/browser/types.ts` | **A defines (A1), then frozen** — changes only by joint agreement at a checkpoint |
| SHARED append-zones: `src/lib/ipc.ts` + `src/lib/ipc-mock.ts` (each stream appends only its own commands), `src/lib/styles/index.sass` (import lines), `lib.rs` `invoke_handler` list, `docs/INDEX.md` | any, append-only |

### Checkpoints (merge/sync points)

| # | What must be true | Gates |
|---|---|---|
| **S0** | A1 merged: `types.ts` + IPC/event contract frozen, stub commands registered | B1, C3 start against real signatures |
| **S1** | C1 merged: vault extracted from `ideState`, demolition test exists | B5 (chrome cutover) may begin |
| **S2** | A4 + B3 integrated: real tabs driven from new chrome in the running app | P1/P2 acceptance run jointly |
| **S3** | C3 + A7 + B6/B7: history captured end-to-end, surfaces live | P3 acceptance |
| **S4** | C5 + A8: autofill fills a real login form; capture prompt works | P5 acceptance + security pass |
| **S5** | All streams: P6 closure — settings, session restore, ADR-029, ledger↔demolition 1:1 audit | plan complete |

---

## Stream A — Native Engine (Rust)

Owns: window/tab engine, webview layout, events, history capture wiring, autofill injection. Plan refs: §3.1, §3.3 (capture), §3.5 (injection side), P1.

- **A1 — Contract freeze.** Write `src/lib/modules/browser/types.ts`: `Tab`, `BrowserWindowInfo`, `BrowserEvent` (tagged union: `tab-created | tab-closed | tab-activated | nav-started | nav-committed | title-changed | favicon-changed | load-finished | load-failed | window-closed`, every payload `{ windowId, tabId, navEpoch }`), `Suggestion`, command parameter types. Add the full IPC command list from §3.1 to `ipc.ts`/`ipc-mock.ts` as typed stubs (`throw new Error('not implemented')` in mock is fine at this stage) + `lib.rs` stub registrations, keeping `ipc-contract.test.ts` green. **Accept:** contract test green; B and C can code against signatures. *(→ S0. Do this first; it's half a day.)*
- **A2 — P1 spike (timeboxed, macOS/WKWebView).** Validate: N child webviews show/hide; content webview positioned to arbitrary rect over full-window chrome webview; z-order flip both ways; live rect tracking at animation-frame throttle during simulated sidebar drag; corner-clipping feasibility; per-webview back/forward. Watch known WKWebView repaint quirks. **Accept:** findings recorded in plan §1a + §3.1 fallback chosen if needed. **A blocking failure here pauses all streams for a re-plan — report immediately.**
- **A3 — Window lifecycle.** `BrowserRegistry` (app-managed state), `browser_window_open(url?)`, `browser_window_close`, `browser_toggle_focus` (§3.8: registry tracks last-focused browser window), unique labels per window/webview. **Accept:** two windows open/close/focus-toggle cleanly; Rust unit tests for registry.
- **A4 — Tab engine.** `browser_tab_create/close/activate/reorder/reopen_closed`, `browser_navigate/reload/stop/go_back/go_forward` (all `{windowId, tabId}`-addressed), URL normalization (http(s)-only, search fallback), `browser:event` emission with `navEpoch`, closed-tab stack, popup (`window.open`) → new tab. **Accept:** P1 acceptance incl. the adversarial interleaving test (navigate A, activate B, close A mid-load — no bleed, no stale-epoch application).
- **A5 — Layout commands.** `browser_set_viewport_bounds(windowId, rect)` (logical px), `browser_set_chrome_overlay(windowId, open)`. **Accept:** spike-validated behavior reproduced via IPC from a test page.
- **A6 — Demolition (engine).** Delete old six commands, `BROWSER_*_LABEL` consts, `BrowserChromeHeight` mutex, `browser:native-event`; extend demolition test with these symbols (coordinate with C, who owns the test file — supply the list in the PR). **Accept:** demolition + contract tests green. *(Same changeset as A3–A5 merges where feasible — §1b.2 no dual-path.)*
- **A7 — History capture** (`browser/history.rs`, after C3 lands schema). Record on `nav-committed` + `title-changed`; final-URL-only for redirect chains; debounce identical consecutive visits (few seconds). **Accept:** real navigation in the running app produces correct rows incl. redirects; Rust tests with C3's fixtures.
- **A8 — Autofill & capture bridge** (`browser/autofill.rs`, after C5 interface). `browser_autofill(windowId, tabId, entryId)`: resolve credentials Rust-side via C's vault API, inject escaped one-shot fill script (`input` events, self-destruct). Submit-detection init script reporting `{origin, username}` only (never the password to chrome) → Rust-held candidate → `browser:event` prompt request. **Accept:** P5 acceptance items that belong to injection (real-site fill; hostile test page can't trigger/observe vault ops).
- **A9 — Session restore backend** (P6, with C6's blob schema). Persist open tabs per window on close; restore on `browser_window_open` when the setting is on. **Accept:** kill-and-relaunch restores tabs.

## Stream B — Chrome UI (Frontend Shell)

Owns: everything the user sees in the browser window, the mock tab engine, contributions/keybindings. Plan refs: §3.2, §3.9, §3.10 (hand-rolled + overlayCoordinator), §3.6, §3.8, P2.

- **B1 — Mock tab engine + state mirror** (after S0). Implement `MockTabEngine` in `ipc-mock.ts` (in-memory windows/tabs, instant `nav-committed`/`title-changed` with derived titles, mock history recording) replacing A1's stubs; `state/browser.svelte.ts` mirror class (per-window via `?win=` param, event-filtered, `navEpoch`-stale-dropping). **Accept:** contract test green; unit tests for mirror incl. stale-epoch drops; tabs open/navigate in `pnpm dev`.
- **B2 — Shell layout** (§3.9, verbatim). `BrowserShell.svelte` + `_browser-shell.sass`: `module-wrapper browser-wrapper`, 3×36px header rows (`--sz-36`/`--sz-108`, already in tokens), `inside-module-wrapper` with both `module-sidebar`s (collapsible, collapsed-by-default, persisted via the notes-pattern prefs; shared resizer classes), `central-carrier browser-viewport` with ResizeObserver → `browser_set_viewport_bounds` (animation-frame throttled), platform-gated 88px traffic-light inset on the top row, drag-region/maximize. Rewrite `/browser` route to mount the shell. **Accept:** layout correct in `pnpm dev` at multiple sizes; sidebar collapse persists across reload; styles token-only, indented SASS, no `<style>` blocks.
- **B3 — TabStrip + NavControls.** Custom tab strip (top row): favicons, titles, close buttons, middle-click close, drag reorder, overflow scroll, new-tab button; nav controls (mid row) with per-tab `canGoBack/Forward` disabled states; address input (plain, no suggestions) with Enter-to-navigate. **Accept (S2, with A4):** full browsing session in the running Tauri app; same chrome fully interactive on mock in `pnpm dev`.
- **B4 — Overlay system.** `overlayCoordinator` (counting rune store → single `$effect` → `browser_set_chrome_overlay`); `BrowserMenu` (⋯), module-styled confirm dialog (replaces native `confirm(` — demolition entry), popover/menu primitives hand-rolled with controlled `open` props (§3.10 swap-cheap rule). **Accept:** any open overlay flips chrome above content and back; zero native `confirm(` in module.
- **B5 — Cutover & demolition (UI)** (after S1). Delete `src/lib/components/Browser.svelte` + its SASS rules; convert canvas `browser` tile to launcher card (§3.6); re-home vault UI as `vault/VaultPopover|VaultList|VaultForm` consuming C's `vault.svelte.ts` (visual re-skin; logic stays C's); supply B's demolition symbols to C. **Accept:** old component gone, vault flows work in new chrome in the running app, demolition test green.
- **B6 — Omnibox suggestions** (after C3/C4 IPC; mock first). Suggestion dropdown (history + bookmarks merged, bookmarks ranked above, keyboard navigable) via `state/suggestions.svelte.ts` (debounced). **Accept:** P3's suggestion acceptance on mock and real data.
- **B7 — History & bookmarks surfaces** (after C3/C4). `HistoryPanel` (grouped by day, search, per-row delete, clear-range via confirm dialog + preset Select), `BookmarkStar` (star toggle + quick-edit popover), `BookmarksRow` populated (was placeholder from B2). **Accept:** P3/P4 UI acceptance in running app.
- **B8 — Contributions, keybindings, settings UI** (§3.8; toggle needs A3). All commands + keybindings scoped to browser window; `` Cmd+` `` toggle wired in BOTH windows (browser shell handler + IDE handler via core contributions — coordinate the one-line IDE-side hook with C who owns `ide.svelte.ts` edits, or land in `coreContributions.ts` which is B-editable for this task); settings section in `SettingsDialog` (search engine Select, homepage, session-restore + bookmarks-row Switches). **Accept:** `contribution-contracts.test.ts` green; shortcuts work only in their scopes; toggle works from both windows.

## Stream C — Data & Credentials

Owns: vault extraction + v2, history/bookmarks storage + IPC + frontend data state, demolition test, docs closure. Plan refs: §3.3–§3.5.1, P0, P3–P6.

- **C1 — Vault extraction (P0 — start immediately, no dependencies).** (a) Runtime smoke-test: load/save real encrypted vault through current keychain path, record in §1a. (b) Create `modules/browser/state/vault.svelte.ts`: move ALL vault fields/methods off `ideState` (`passwordsList`, `matchingLogins`, `vaultTotpCount`, CRUD, `importBitwardenFile`, load/save); own `UndoHistory` + `registerUndoDomain`; **unhook from IDE snapshots** (remove `passwordsList` from capture/restore, remove `pushUndo` on navigation); **lazy load** (decrypt on first browser use, not IDE boot); **rename away from the `VaultBridge` collision** (notes-module workspace vaults — do not touch). Migrate `Browser.svelte`'s imports (old window keeps working); delete `state/browser.svelte.ts` shim. (c) Create `tests/unit/browser-demolition.test.ts` seeded with P0 symbols; C owns this file — other streams submit their symbol lists to you. **Accept:** P0 acceptance in the plan, verified in the running app.
- **C2 — Vault v2 logic.** Registrable-domain matching taking a URL parameter (kills the `ideState.browserUrl` coupling — per-tab ready for B); TOTP copy action; import demoted to overflow-menu-only migration path; unit tests incl. malformed/legacy/boundary vault fixtures. **Accept:** matching correct for subdomain/eTLD cases; fixtures pass.
- **C3 — History data layer** (after S0). `storage.rs`: `history_urls` + `history_visits` + FTS5 virtual table w/ triggers (proven pattern); IPC `historySearch/historyRecent/historyDeleteUrl/historyClearRange` + mock parity; `state/history.svelte.ts` (query state for B's panel — history is NOT an undo domain); fixture tests (malformed rows, duplicate URLs, boundary timestamps). **Accept:** Rust + unit tests green; clear-range empties FTS too; A7 unblocked with schema + write API.
- **C4 — Bookmarks data layer** (after S0). Schema migration evolving the existing `bookmarks` table to §3.4 shape (+ `bookmark_folders`); module-neutral IPC (`bookmark*`) superseding `listBookmarks`/`addBookmark` **in the same changeset** (demolition entries for old signatures); `state/bookmarks.svelte.ts` with own undo domain; mock parity; §3.4a proof (scratch test reading data via bare IPC with zero `modules/browser/` imports); both-direction dependency rules added to demolition test. **Accept:** P4 data acceptance; migration tested against a DB created by the old schema.
- **C5 — Credential bridge (data side)** (interface agreed with A before A8). Entry-id → credential resolution callable from Rust autofill (id-only from frontend, §3.5); save-prompt candidate flow state + per-origin decline memory (persisted); password generator (length/symbols, defaults); Bitwarden-compatible JSON export via native save dialog; security tests (no vault read path exposed to page or chrome beyond §3.5's contract). **Accept:** P5 data-side acceptance; export→re-import round-trips losslessly.
- **C6 — Closure (P6, jointly at S5).** Session-restore blob schema (versioned, sanitized, fixtures) for A9; settings persistence entries; **ADR-029** superseding ADR-007's architecture half + ADR-007 stale-claims correction; `docs/areas/browser.md` (incl. vault file location + backup procedure — §3.5.1 criterion 4); design docs for new components; `pnpm docs:filetables` + INDEX; final audit: deletion ledger ↔ demolition-test forbidden list 1:1; Audit Completeness Protocol pass; §3.5.1 Bitwarden exit criteria walkthrough with the owner, then secure deletion of `vendors/bitwarden_export_*.json`.

---

## Dependency graph (summary)

```
A1 ──→ S0 ──→ B1 ──→ B2 ──→ B3 ─┐
A2 ──→ A3 ──→ A4 ────────────────┼→ S2 → B4 ─┐
              A5 ────────────────┘           │
C1 ──→ S1 ──────────────→ B5 ←──────────────┘
C2 (anytime after C1)
S0 ──→ C3 ──→ A7 ──→ S3 ←── B6, B7 ←── C4
C5 ──→ A8 ──→ S4
A9, B8, C6 ──→ S5
```

**Start simultaneously:** A1+A2 (A), C1 (C), B may pre-read and scaffold nothing until S0 — first real B task is B1. If B's agent starts before S0, it can draft `_browser-shell.sass` + static shell markup against §3.9 (no IPC) without conflict.

## What "done" means (any stream, any task)

Plan §1b.4: green suites ≠ done. Drive the flow in the running app, confirm the new path served it, extend the demolition test, land the docs. If a task's acceptance can't be demonstrated, the task is open — no exceptions, that's how the AI module rotted.
