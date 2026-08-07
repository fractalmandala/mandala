---
id: ADR-007
title: In-App Browser with Integrated Password Vault and 2FA
type: adr
tags: [browser, vault, 2fa, security]
summary: Historical record for the original browser and vault; browser architecture is superseded by ADR-036 while encrypted vault and TOTP intent remain.
relates_to: [ADR-004, ADR-006, ADR-016, ADR-028, ADR-036]
status: superseded
updated: 2026-07-17
---

# ADR-007: In-App Browser with Integrated Password Vault and 2FA

**Status:** Superseded by ADR-036 (browser architecture); vault and TOTP intent retained
**Date:** 2026-06-24
**Decision makers:** Backend Lead, Frontend Lead, Product Owner

---

## Context

FractalEngine includes an AI copilot that interacts with remote APIs (OpenAI, Anthropic, Gemini, local models) and a skills marketplace that fetches agent skill definitions from remote registries. Browsing API documentation, exploring model providers, and managing credentials are frequent tasks during IDE usage. The team identified two user needs:

1. An embedded browser panel so users can browse documentation, API references, and model registries without leaving the IDE — avoiding context-switching to a separate browser application.
2. A password vault integrated with the browser for managing API keys, credentials, and 2FA tokens — developers commonly manage dozens of API keys and service credentials across AI providers, cloud services, and registry accounts.

The password vault requirements included: Bitwarden-compatible import (users migrating from Bitwarden), searchable login list, domain-based credential matching, copy-to-clipboard username/password, show/hide password toggle, 2FA/TOTP generation for supported accounts, and CRUD operations (add, edit, delete entries).

The 2FA requirement was particularly important — many AI platforms and developer services require TOTP-based two-factor authentication. Generating TOTP codes within the password vault eliminates the need for a separate authenticator app.

The application runs inside Tauri's webview, which has access to the filesystem for persistence but not to browser extension APIs. The password database must be stored as an encrypted file on disk.

---

## Decision

### 2026-07-13 consolidation

`Browser.svelte` is the single browser chrome for classic and global-drawer placements; the duplicate `BrowserNav.svelte` implementation is removed. Browser development mode displays a deterministic safe-preview explanation because arbitrary cross-origin sites cannot be represented faithfully in an iframe. Desktop navigation remains in the isolated native child webview, and embedded content does not receive `allow-same-origin`. Vault persistence remains encrypted through the native crypto/keychain boundary; only the explicitly development-only mock uses browser storage.

We will implement an in-app browser panel with an integrated password vault featuring domain-matched login storage, CRUD operations, and client-side TOTP generation.

**Browser surfaces** ([`Browser.svelte`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Browser.svelte)):

- Embedded browser tile mode keeps the iframe fallback for now, with back/forward/reload controls and an address bar that resolves search terms to URLs.
- Standalone browser mode opens a separate Tauri parent `Window` with two child webviews: Svelte chrome (`browser-chrome`) and page content (`browser-content`). The content webview is created with `WebviewBuilder` and controlled through IPC commands (`browser_navigate`, `browser_reload`, `browser_go_back`, `browser_go_forward`, `browser_set_content_bounds`).
- The chrome webview's native bounds are exactly as tall as whatever height the frontend last reported via `browser_set_content_bounds` — by default just the `browser-header` row (~48px). The password vault popover renders inside that same chrome webview's DOM, so `Browser.svelte` measures the popover (`vaultPopoverEl`) whenever it opens/resizes and reports `header height + popover height` as the new chrome height; otherwise the popover would be present in the DOM but clipped to zero visible height by the native webview surface. A `BrowserChromeHeight` app-managed `Mutex<f64>` on the Rust side remembers the last-requested height so an OS window resize re-applies it instead of snapping back to the 48px default and re-clipping an open popover.
- The browser tile and associated state are integrated into the spatial canvas board — users can position the browser panel anywhere alongside the editor, terminal, or AI copilot.

**Password vault** (integrated into `Browser.svelte` with state in `ide.svelte.ts`):

- Two-tab interface: **Match Tab** (shows vault entries matching the current browser domain) and **All Logins Tab** (searchable full list).
- Each entry stores: name, username, password (plaintext for copy, stored in JSON), URIs, TOTP secret key (Base32-encoded), and creation/update timestamps.
- Show/hide password toggle for display; copy-to-clipboard for username and password.
- Full CRUD — add, edit, and delete entries with reactive state updates.
- CRUD and clear-vault operations are transactional and undoable: renderer state rolls back when encrypted native persistence fails, and callers receive an explicit success result.

**2FA / TOTP generator** ([`totp.ts`](file:///Users/amrit/fractals/apps/fractalengine/src/lib/totp.ts)):

- Pure TypeScript HMAC-SHA1 implementation — no external crypto dependencies, enabling deterministic TOTP computation inside the Tauri webview.
- Accepts Base32-encoded secrets (standard TOTP format) and outputs 6-digit codes.
- Dynamic 1-second recalculation with a 30-second countdown boundary indicator.
- The implementation is self-contained: it implements SHA-1 and HMAC from scratch in TypeScript to avoid relying on the Web Crypto API, which behaves differently inside Tauri's webview vs. a standard browser.

**Persistence:**

- On startup, Tauri reads a `passwords.json` file from the workspace directory.
- If absent, the app imports and converts the bundled `vendors/bitwarden_export_20260624203541.json` as an initial seed database via `find_bitwarden_seed_export` in [lib.rs](file:///Users/amrit/fractals/apps/fractalengine/src-tauri/src/lib.rs), which checks `current_dir()` (dev) then `resource_dir()` (packaged build, via the `bundle.resources` entry in `tauri.conf.json`). The directory is `vendors/` (plural) — a prior version of this lookup pointed at `vendor/` (singular) and never actually fired; fixed in this pass.
- All CRUD operations write through to `passwords.json` via the [IPC gateway](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts) (`loadPasswordDatabase`, `savePasswordDatabase`).
- In browser development mode, `ipc-mock.ts` provides in-memory storage.
- Beyond the first-run seed, users can re-import any Bitwarden JSON export at any time via the vault popover's **Import** button, which calls `ideState.importBitwardenFile()` ([ide.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts)). It opens the native file picker (`selectFile`), reads the chosen file (`readFile`), and merges `type === 1` login items into `passwordsList` — matching by Bitwarden's own `id` field so re-importing the same export updates in place instead of duplicating.

---

## Consequences

### Positive

- Users can browse documentation and manage credentials without leaving the IDE — no context-switching to a separate browser or password manager.
- The Bitwarden-compatible import reduces migration friction for users coming from Bitwarden.
- The custom TOTP generator runs entirely client-side with no network dependency — codes are generated even when offline.
- The browser panel benefits from the spatial canvas layout: users can position it alongside the AI copilot and editor for a split-view browsing and coding workflow.
- The standalone window mode provides a full browser window experience for complex browsing sessions while the main IDE window remains focused on code.

### Negative

- Vault availability depends on the native encryption/keychain boundary. A keychain or persistence failure leaves the prior renderer state intact and requires the user to retry.
- The custom HMAC-SHA1 implementation in `totp.ts` increases the attack surface for cryptographic bugs compared to using the Web Crypto API or a well-audited library. However, TOTP codes are time-limited (30-second window), limiting the impact of a bug to brief prediction windows.
- The Bitwarden import is a manual, one-shot merge (seed on first run, or the popover's **Import** action for any later export) — ongoing sync with a live Bitwarden instance is not implemented. Users who manage credentials across multiple devices must rely on manual export/import.
- The standalone browser window uses a native child webview and does not share implementation constraints with the embedded iframe fallback. Cookie/session behavior depends on the platform webview data store and should be made explicit when tab profiles or containers are introduced.

### Neutral

- The `totp.ts` module is a pure TypeScript implementation with no dependencies — it can be unit-tested independently and reused in other contexts (e.g., a CLI tool for TOTP generation).
- The password vault's CRUD operations flow through the IPC gateway and state registry, ensuring they participate in the undo/redo system (vault edits are snapshotted before mutation).

---

## Alternatives Considered

### Reliance on external browser

Require users to open their system browser for documentation and credential management. Rejected because this breaks the IDE flow — every context switch to an external browser costs the user 5-10 seconds of focus recovery. The integrated browser with password auto-fill provides a seamless experience.

### Integration with system keychain (macOS Keychain, libsecret, Windows Credential Manager)

Rejected because Tauri 2's keychain integration requires platform-specific Rust plugins and the team's priority is cross-platform consistency with a single code path. The `passwords.json` file approach works identically on all three platforms and can be upgraded to encrypted storage without changing the data model.

### OAuth-based credential management

Delegate all credential storage to OAuth/SSO providers. Rejected because many AI provider API keys and developer service credentials do not support OAuth — they require static API tokens stored on the client.

### Web Crypto API for TOTP

Use the browser's built-in SubtleCrypto API for HMAC-SHA1. Rejected because Tauri's webview implements SubtleCrypto differently from standard browsers — the HMAC operations may behave unpredictably across Tauri versions and platforms. The pure TypeScript implementation is deterministic and portable.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-001 | Use Tauri 2 + SvelteKit as the IDE Framework | The browser panel runs inside Tauri's webview; standalone mode uses a native Tauri parent window with child webviews |
| ADR-004 | Single IPC Gateway Module for All Tauri API Calls | Password database persistence (`loadPasswordDatabase`, `savePasswordDatabase`) goes through the gateway |
| ADR-005 | Spatial Canvas Board Layout | The browser panel is available as a `browser` tile kind in the canvas |
| ADR-006 | Mandatory Undo/Redo Boundary | Vault entry CRUD operations trigger `pushUndo()` before mutations |

---

## Supersession amendment (2026-07-17)

ADR-036 supersedes this record's single-window, fixed-label, iframe-tile, and chrome-height architecture. The current browser uses native registry-owned windows and tab-addressed commands/events, while the vault lives in `src/lib/modules/browser/state/vault.svelte.ts` with native encrypted persistence. The historical claims that a vault is seeded from a bundled Bitwarden export on first run and that `bundle.resources` vendors that export are stale: neither behavior is part of the current architecture. Bitwarden JSON remains a deliberate import/export compatibility path, not a live sync integration.

## Notes

Password data is encrypted through the native crypto/keychain boundary; only the explicitly development-only browser mock uses browser storage. Clipboard copy and autofill report failures instead of claiming success, and browser address/provider URL settings accept only HTTP(S) values.

The TOTP generator uses a client-side timer (`setInterval` at 1-second granularity) to recalculate codes. This timer pauses when the browser tab is backgrounded; a visibility change handler re-triggers the timer to ensure codes do not appear stale after the user returns to the IDE.
