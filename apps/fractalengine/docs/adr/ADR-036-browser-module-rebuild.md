---
id: ADR-036
title: Rebuild the Browser as a Native Tab Module
type: adr
tags: [browser, native, tabs, session, vault, security]
summary: Replaces the single-window browser architecture with native tab registry ownership, module-scoped renderer state, and versioned session snapshots.
relates_to: [ADR-004, ADR-006, ADR-007, ADR-016, ADR-028]
status: accepted
updated: 2026-07-17
---

# ADR-036: Rebuild the Browser as a Native Tab Module

**Status:** Accepted
**Date:** 2026-07-17
**Decision makers:** Desktop Platform Lead, Frontend Lead, Product Owner

## Context

The former browser exposed one fixed native content webview through unaddressed commands and mixed the chrome, vault, and IDE state into one component. That model could not represent independent windows or tabs, made navigation events easy to drop, and coupled encrypted credentials to IDE persistence and undo snapshots.

The app needs app-level history and bookmarks, while the browser needs private presentation state. Credentials must remain behind the native crypto/keychain boundary, and browser-session recovery must not persist native labels, credentials, or unvalidated URLs.

## Decision

We will use a native browser registry for window and tab ownership, a browser module for renderer state and UI, and a versioned sanitized session snapshot for optional tab restoration.

Every native command and event is addressed by window and tab, and events carry a navigation generation so renderer mirrors can reject stale work. The session file stores only HTTP(S) tab URLs and active-tab indexes, removes URL credentials and fragments, bounds input sizes, and is written atomically under the application-data directory. Vault CRUD remains module-scoped and undoable; navigation, tab lifecycle, and history remain explicitly outside undo.

## Consequences

### Positive

- Multiple browser windows and tabs have independent native ownership instead of sharing fixed labels.
- Renderer chrome can be developed against a typed mock while native navigation, history capture, and credential resolution stay authoritative.
- A corrupt, future-version, or hostile session blob restores no tabs rather than sending unsafe data to a webview.
- Vault data remains separate from IDE snapshots and is backed up as its encrypted native file.

### Negative

- Native registry and session lifecycle code must be kept in parity with the typed IPC mock and tested on each supported webview platform.
- Session restoration deliberately loses page state, history position, scroll position, and fragments; it restores tabs, not a browser-profile clone.
- Cookie and login-session behavior still depends on the platform webview data store, so profiles and containers remain future work.

### Neutral

- The legacy browser component and single-window IPC surface are removed by the demolition guard rather than kept as compatibility paths.
- Bitwarden remains an import/export compatibility format only; this decision does not introduce live Bitwarden synchronization or authorize deletion of user exports.

## Alternatives Considered

### Retain the single fixed native webview

Rejected because fixed labels and unaddressed IPC make two browser windows and tab-local event ordering impossible to guarantee.

### Persist the full native webview state

Rejected because native labels, webview state, and potentially sensitive navigation data are platform-specific and cannot be safely or reliably recreated across launches.

### Keep browser state inside IDE state

Rejected because vault credentials and browser lifecycle mutations have different persistence and undo requirements from IDE layout state.

## Related Decisions

| ADR | Relationship |
| --- | --- |
| ADR-004 | Extends the single typed IPC gateway to browser commands and events. |
| ADR-006 | Defines the separate undo boundary for vault and bookmark mutations. |
| ADR-007 | Supersedes its browser architecture while retaining its vault and TOTP intent. |
| ADR-016 | Depends on the encrypted vault envelope boundary. |
| ADR-028 | Depends on the hostile-page and native-secret security boundary. |
