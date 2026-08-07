---
id: sp-plan-2026-06-24-in-app-browser
title: Superpowers Plan: 2026-06-24-in-app-browser
type: archive
tags: [superpowers, plan, history]
updated: 2026-07-15
---

> **Historical superpowers implementation plan — kept as reference.**

# Implementation Plan - In-App Browser, Password Manager & TOTP Keypass

This plan outlines the architecture, database setup, state management, UI implementation, and Tauri/Browser IPC actions required to build the in-app browser with an integrated Bitwarden-style password manager and TOTP 2FA Keypass generator.

---

## User Review Required

> [!IMPORTANT]
> **Database Initialization**: The password manager database will be stored locally as `passwords.json` in the user's app data directory (or in the workspace root for development). On first launch, the app will automatically parse `vendor/bitwarden_export_20260624203541.json`, convert the Bitwarden schema to our password manager schema, and write it to `passwords.json`.
> 
> **TOTP / 2FA Keypass Support**: We will implement a custom Base32 decoder and HMAC-SHA1 hashing utility in pure TypeScript (`src/lib/totp.ts`) to generate 6-digit TOTP codes dynamically in the UI. No external NPM packages will be required, keeping the codebase lightweight and robust.
> 
> **Credential Filling & Security**: Since loading external websites in iframes or webviews blocks direct access to input fields (CORS/security constraints), we will implement a multi-modal credential utility:
> 1. **One-Click Quick Copy**: Instant clipboard copy buttons for Username, Password, and TOTP codes.
> 2. **Autofill simulation**: For mock/simulated sandbox sites (which we will use for verification), credentials will auto-fill directly into input elements.

---

## Proposed Changes

### 1. Tauri Backend & IPC Gateway

#### [MODIFY] [ipc.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc.ts)
- Add Tauri window and password database action wrappers:
  - `openBrowserWindow(url: string)`: Instantiates a new native `WebviewWindow` for standalone rendering.
  - `loadPasswordDatabase()`: Loads `passwords.json`. If it doesn't exist, reads `vendor/bitwarden_export_20260624203541.json` to initialize it.
  - `savePasswordDatabase(content: string)`: Writes the updated list of passwords to `passwords.json`.

#### [MODIFY] [ipc-mock.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/ipc-mock.ts)
- Add mock implementations for browser window and database triggers:
  - `openBrowserWindow(url: string)`: Calls `window.open` to simulate new window behavior.
  - `loadPasswordDatabase()`: Reads from browser's `localStorage` or imports the static `bitwarden_export` data directly.
  - `savePasswordDatabase(content: string)`: Saves to browser's `localStorage`.

---

### 2. State & Utilities (Svelte 5 Runes)

#### [NEW] [totp.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/totp.ts)
- Implement Base32 decoder and HMAC-SHA1 to calculate 6-digit TOTP codes based on current system time (regenerated every 30 seconds).

#### [MODIFY] [ide.svelte.ts](file:///Users/amrit/fractals/apps/fractalengine/src/lib/state/ide.svelte.ts)
- Add state variables for the browser panel and password manager:
  - `browserUrl`: current active URL ($state).
  - `browserCollapsed`: boolean visibility state ($state).
  - `browserWidth`: numeric width of panel in pixels ($state).
  - `passwordsList`: array of login credentials ($state).
  - `matchingLogins`: derived array of logins matching the host of the current `browserUrl`.
- Add methods:
  - `toggleBrowser()`: updates visibility status.
  - `loadPasswords()` / `savePasswords()`: loads and saves credentials list.
  - `addPassword(item)` / `updatePassword(item)` / `deletePassword(id)`: performs CRUD operations on the credentials database.
- Integrate browser and password state into `takeSnapshot()` and `restoreSnapshot()` to preserve the Undo/Redo boundary (Rule 8).

---

### 3. Svelte UI Components

#### [NEW] [Browser.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/lib/components/Browser.svelte)
- Create a reusable Svelte 5 component displaying the browser client.
- **Header strip**:
  - Drag handle containing title, back/forward/reload buttons.
  - Address bar input.
  - **Lock/Shield button**: Clicking toggles the password manager popover.
- **Password Manager Popover**:
  - **Match tab**: Displays matching accounts for current URL. Clicking copies Username/Password or TOTP code. Shows active 2FA Keypass codes with 30s countdown indicators.
  - **Search tab**: Search and view all accounts in the database.
  - **Add/Edit forms**: Add new credentials or edit existing ones (including custom TOTP secrets).
- **Content view**:
  - Renders a styled `iframe` pointing to the current URL.
  - Implements a loading spinner.

#### [NEW] [routes/browser/+page.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/routes/browser/+page.svelte)
- Add SvelteKit page for the standalone route.
- Fetches the URL query parameter `?url=...` on mount and passes it to `<Browser isStandalone={true} />`.
- Matches the active IDE theme styling variables.

#### [MODIFY] [routes/+page.svelte](file:///Users/amrit/fractals/apps/fractalengine/src/routes/+page.svelte)
- Add the browser panel container to the workspace flex layout, situated on the right side of the main workspace.
- Add vertical resize handle between right sidebar and the browser panel.
- Implement mouse resize handlers (`startBrowserResize`, `handleBrowserMouseMove`, `stopResize`).
- Add a browser toggle button in the header strip controls list.

---

### 4. Styles (Indented SASS)

#### [NEW] [components/_browser.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_browser.sass)
- Implement pure indented SASS rules for:
  - Browser panel wrapper, navigation address bar.
  - Password manager overlay (popover, tabs, credential row items, copy animations, keypass countdown ring, form inputs).
  - Adhere to Rule 5: classic indented syntax only (no `{`, `}`, `;`).
  - Adhere to Rule 1: consume semantic tokens only.

#### [MODIFY] [index.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/index.sass)
- Import `components/browser`.

---

## Verification Plan

### Automated Steps
1. Run `pnpm run check` to verify TypeScript definitions.
2. Run `pnpm run build` to confirm static build compatibility.

### Manual Verification
1. **Database Import**: Open the app and inspect console logs to verify that the export JSON was parsed successfully and saved as `passwords.json`.
2. **Password Manager Popover**: Navigate browser to `https://3.basecamp.com/5450358/welcome/loading`. Verify that the lock icon displays a match badge, and shows `amrit.pandey@brhat.in` as a matching login.
3. **TOTP Keypass Verification**: Find the login with TOTP key (e.g. `account.live.com`). Open its details and verify that the 6-digit 2FA code is generated and updates every 30 seconds.
4. **CRUD Actions**: Add a new login, edit its username, copy its password, and delete it. Verify all changes persist.
5. **Undo/Redo**: Edit a login or toggle visibility, and trigger `Cmd+Z` / `Cmd+Shift+Z` to verify history state updates correctly.
