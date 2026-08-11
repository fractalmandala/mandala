---
id: browser
title: Browser Area
type: area
tags: [browser, tabs, history, bookmarks, vault, session]
summary: Describes native browser-window ownership, renderer module boundaries, encrypted vault operations, and safe session recovery.
relates_to: [ADR-004, ADR-006, ADR-016, ADR-028, ADR-036]
updated: 2026-07-17
---


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
