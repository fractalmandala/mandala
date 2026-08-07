---
id: browser
title: Browser Area
type: area
tags: [browser, tabs, history, bookmarks, vault, session]
summary: Describes native browser-window ownership, renderer module boundaries, encrypted vault operations, and safe session recovery.
relates_to: [ADR-004, ADR-006, ADR-016, ADR-028, ADR-036]
updated: 2026-07-17
---

# Browser Area

The browser is a standalone native-window module. Rust owns browser windows, tabs, webviews, navigation generations, and viewport placement. The renderer in `src/lib/modules/browser/` mirrors browser events and renders chrome; it does not infer native navigation state.

Every `BrowserLauncherCard` uses the native `browser_window_open` gateway in Tauri, including cards shown in application drawers. Browser-only development instead opens the `/browser` route in a new tab.

## Ownership and persistence

| Concern | Owner | Persistence | Undo |
| --- | --- | --- | --- |
| Windows, tabs, navigation | `src-tauri/src/browser/mod.rs` | Process state; optional session snapshot | No |
| Session tabs | `src-tauri/src/browser/session.rs` | `browser-session.json` in the app-data directory | No |
| History and bookmarks | `src-tauri/src/storage.rs` | `fractalengine.db` in the app-data directory | Bookmarks only |
| Vault entries | `src/lib/modules/browser/state/vault.svelte.ts` and native crypto/keychain IPC | Encrypted `passwords.json` in the app-data directory | Yes |
| Browser chrome | `src/lib/modules/browser/` | Renderer preferences/settings | No |

The session snapshot is versioned and treated as hostile input. It contains only sanitized HTTP(S) URLs and active-tab indexes. URL credentials and fragments are removed; invalid, malformed, unsupported-version, empty, or over-limit data is ignored. Writes use a temporary sibling file followed by rename so a partial write cannot replace the prior snapshot.

Native traffic-light close requests unregister the window from the browser engine before macOS completes the close. The root-layout unsaved-work guard is installed only for the primary `main` window, so its shared layout cannot intercept a browser traffic light. Teardown is idempotent, so an explicit `browser_window_close` command and a later native destruction event cannot leave stale tabs or persist a window that has already been closed.

## Vault backup and recovery

The browser vault remains encrypted through the native crypto/keychain boundary. Back up the application-data `passwords.json` file **together with access to the OS keychain account used by FractalEngine**; a copied encrypted file alone cannot be decrypted on a machine without the corresponding key material. Restore by closing FractalEngine, replacing the encrypted vault file from a known-good backup, and reopening the app. Never back up decrypted exports in a shared folder.

Bitwarden JSON is an explicit one-time import/export compatibility path, not a sync service. Confirm imports and exports on a non-production copy before retiring another password manager. This documentation does not authorize deletion of `vendors/bitwarden_export_*.json` or a Bitwarden account; that requires a user-confirmed migration walkthrough.

## Security boundary

Autofill takes an entry id from chrome, resolves credentials in Rust, and injects an escaped one-shot script into the selected active page. Page code cannot enumerate vault entries or call vault IPC. The submit-capture bridge reports metadata only; it must never return a password to chrome.

## Test and audit expectations

- Event consumers must drop stale `navEpoch` work.
- The omnibox handles a non-composing Enter directly on its focused input and stops propagation
  before navigation, so shell-level keybindings cannot consume the address-bar action.
- Its Go button calls that same navigation path, providing a direct pointer-control fallback.
- Address-bar navigation resolves the active tab from the native registry at the command boundary,
  so early input cannot be dropped while the renderer event mirror is still seeding. If the window
  has no tabs, that same action creates and activates a native tab at the submitted URL.
- The `/browser` route waits for the current Tauri chrome webview label and derives the window
  id from its `browser-chrome-<windowId>` prefix. Route state remains a browser-preview fallback,
  but native state is never created for the placeholder `main` id.
- Navigation and history deletion require failure/cancellation/out-of-order checks but are not undo domains.
- Vault and bookmark mutations are atomic undo transactions.
- Browser replacements add their legacy marker to `tests/unit/browser-demolition.test.ts` in the same change.
- Session fixtures cover malformed JSON, future versions, invalid URLs, credential stripping, active-index bounds, and disk round trips.

## File table

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`mod.rs`](file:////Users/amrit/fractals/apps/fractalengine/src-tauri/src/browser/mod.rs) | mod.rs |
| [`session.rs`](file:////Users/amrit/fractals/apps/fractalengine/src-tauri/src/browser/session.rs) | ! Versioned, disk-backed browser session snapshots. |
| [`BookmarksRow.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/BookmarksRow.svelte) | Bookmarks Row — bottom row of browser header (§3.9/P4/B7) |
| [`BookmarkStar.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/BookmarkStar.svelte) | Bookmark Star — toggle + quick-edit popover (§3.4/P4/B7) |
| [`BrowserConfirm.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/BrowserConfirm.svelte) | Module-styled confirm dialog — replaces native confirm() in the browser module. |
| [`BrowserLauncherCard.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/BrowserLauncherCard.svelte) | Browser Launcher Card — replaces the old embedded Browser in canvas tiles, AI work panel, |
| [`BrowserMenu.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/BrowserMenu.svelte) | Browser Menu — ⋯ overflow menu (§3.10/B4) |
| [`BrowserShell.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/BrowserShell.svelte) | Browser Shell — standalone-window chrome root (§3.9) |
| [`HistoryPanel.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/HistoryPanel.svelte) | History Panel — searchable visit list, delete entry, clear range (§3.3/B7) |
| [`NavControls.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/NavControls.svelte) | Navigation Controls — back, forward, reload/stop (§3.9/B3) |
| [`Omnibox.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/Omnibox.svelte) | Omnibox — address input with suggestion dropdown (§3.9/B3 → B6) |
| [`showConfirm.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/showConfirm.ts) | Programmatic confirm dialog — replaces window.confirm() in the browser module. |
| [`TabStrip.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/TabStrip.svelte) | Tab Strip — custom tabs in the header top row (§3.9/B3) |
| [`VaultForm.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/vault/VaultForm.svelte) | Vault Form — add/edit credential form (§3.5/B5) |
| [`VaultList.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/vault/VaultList.svelte) | Vault List — login entry rows with Fill, copy, TOTP (§3.5/B5) |
| [`VaultPopover.svelte`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/components/vault/VaultPopover.svelte) | Vault Popover — popover shell with tabs (Matching / All / Add-Edit) (§3.5/B5) |
| [`contributions.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/contributions.ts) | Browser Module — Contributions Registry (§3.8) |
| [`bookmarks.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/state/bookmarks.svelte.ts) | * Browser view of the app-level bookmark store. Data remains module-neutral in storage/IPC. |
| [`browser.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/state/browser.svelte.ts) | Strip www. and use hostname as a reasonable default |
| [`history.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/state/history.svelte.ts) | history.svelte.ts |
| [`overlayCoordinator.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/state/overlayCoordinator.svelte.ts) | Overlay Coordinator — counting store for chrome overlay state (§3.10/B4) |
| [`registrableDomain.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/state/registrableDomain.ts) | registrableDomain.ts |
| [`suggestions.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/state/suggestions.svelte.ts) | Omnibox suggestions — merged history + bookmarks (§3.2/B6) |
| [`vault.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/state/vault.svelte.ts) | vault.svelte.ts |
| [`_browser-shell.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/styles/_browser-shell.sass) | Browser Shell Layout — standard module layout (§3.9) |
| [`_history.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/styles/_history.sass) | Browser History Panel — grouped by day, searchable, deletable |
| [`_omnibox.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/styles/_omnibox.sass) | Browser Omnibox — address input + suggestion dropdown |
| [`_tabstrip.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/styles/_tabstrip.sass) | Browser Tab Strip — custom tabs in the header top row |
| [`_vault.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/styles/_vault.sass) | Browser Password Vault — popover, list, form |
| [`types.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/modules/browser/types.ts) | Browser Module — Type Definitions (§3.1 contract freeze) |
| [`browser-demolition.test.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/unit/browser-demolition.test.ts) | browser-demolition.test.ts |
| [`browser-navigation.test.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/unit/browser-navigation.test.ts) | browser-navigation.test.ts |
| [`browser-vault-matching.test.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/unit/browser-vault-matching.test.ts) | browser-vault-matching.test.ts |

<!-- filetable:end -->
