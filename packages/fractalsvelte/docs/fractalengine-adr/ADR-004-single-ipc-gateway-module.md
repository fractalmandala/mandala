---
id: ADR-004
title: Single IPC Gateway Module for All Tauri API Calls
type: adr
tags: [ipc, tauri, architecture]
summary: Routes every Tauri API command through one gateway module (ipc.ts) with a parallel browser mock (ipc-mock.ts) to keep pnpm dev working outside Tauri.
relates_to: [ADR-001]
status: accepted
updated: 2026-07-13
---


**Status:** Accepted
**Date:** 2026-06-24
**Decision makers:** Backend Lead, Frontend Lead

---

## Context

FractalEngine runs as a Tauri 2 desktop application where the frontend (SvelteKit) communicates with the Rust backend via Tauri's `invoke()` IPC mechanism. The application exposes multiple native commands: filesystem operations (`list_directory`, `read_file`, `write_file`), AI model management (`runLocalModel`, `downloadModel`, `downloadProgress`), password database operations (`loadPasswordDatabase`, `savePasswordDatabase`), and browser window management (`openBrowserWindow`).

Without a disciplined import strategy, any component could import `@tauri-apps/api/core` directly and call `invoke()` with hardcoded command names and inline error handling. This creates several problems:

- If the Tauri command signature changes, every call site must be updated individually.
- The browser development mode (`pnpm dev` outside Tauri) requires mock implementations — without a gateway, every component that calls Tauri APIs would need conditional `isTauri()` checks and mock imports.
- Inline error handling would be inconsistent across the codebase — some components might swallow errors, others might surface them differently.
- Hardcoded command strings create a fragile coupling between frontend code and Rust command names.

The project needs to support two runtime modes: Tauri (desktop) and browser (development preview). In browser mode, all filesystem operations must fall back to an in-memory virtual filesystem.

---

## Decision

We will route all Tauri API calls through a single gateway module at `src/lib/ipc.ts`. This module:

1.  Exports typed async functions for every Tauri command (e.g., `listDirectory(path)`, `readFile(path)`, `writeFile(path, content)`, `selectDownloadDirectory()`).
2.  Detects the runtime environment using `__TAURI_INTERNALS__ in window` and dispatches to either the real Tauri `invoke()` or the mock implementation.
3.  Maintains a parallel mock module at `src/lib/ipc-mock.ts` that implements the same interface using an in-memory virtual filesystem.
4.  Defines shared TypeScript types and interfaces (`FileEntry`, etc.) that both the real and mock implementations consume.
5.  Owns a defensive event-listener boundary: failed Tauri listener registration and unlisten operations are logged and contained so callers retain a safe synchronous cleanup function.

**Import rule:** No component or state module may import `@tauri-apps/api/core` directly or call `invoke()` inline. All IPC goes through `src/lib/ipc.ts`. State modules like `ide.svelte.ts` and `canvas.svelte.ts` import IPC functions only from this gateway.

**Mock rule:** The mock module must be kept in sync with the real `ipc.ts` interface. Any new command added to `ipc.ts` must have a corresponding mock implementation.

---

## Consequences

### Positive

- Changing a Tauri command signature requires edits in exactly two files: `ipc.ts` (the typed wrapper) and the Rust `lib.rs` command handler. All call sites are type-checked against the wrapper.
- Browser development (`pnpm dev`) works identically to the desktop app — the mock module provides deterministic virtual filesystem behavior, enabling UI development and E2E testing without Tauri.
- New developers can understand the full IPC surface area by reading a single file — all Tauri commands are listed as exported functions with their TypeScript signatures.
- Error handling is centralized: the gateway can implement consistent error formatting, logging, or user-facing notifications for all IPC failures.

### Negative

- Every new Tauri command requires three changes: the Rust command in `lib.rs`, the wrapper in `ipc.ts`, and the mock in `ipc-mock.ts`. This is a small overhead per command but ensures all three layers stay synchronized.
- The `isTauri()` check runs on every call, adding negligible runtime cost but slightly more code than a direct `invoke()` import. For high-frequency operations this is acceptable — filesystem operations are gated by user interaction, not called in tight loops.
- The gateway pattern does not prevent state modules from importing the gateway and caching results locally — stale caches are a module-level concern, not a gateway concern.

### Neutral

- The gateway currently exports functions, not a class — this is intentional to allow tree-shaking unused commands from the browser bundle. If the gateway grows beyond 20-30 commands, it may be split into domain sub-modules (e.g., `ipc/fs.ts`, `ipc/ai.ts`, `ipc/vault.ts`) re-exported through the main `ipc.ts`.

---

## Alternatives Considered

### Direct `invoke()` calls in components

Rejected immediately because this scatters Tauri knowledge across the codebase. Any command rename or signature change would require hunting down all call sites. Browser mode would require every component to conditionally handle the `__TAURI_INTERNALS__` check, leading to duplicated mock logic.

### Auto-generated IPC bindings from Tauri commands

Tauri offers a `generate` feature that creates TypeScript bindings from Rust command definitions. We rejected this because the generated code is verbose, requires specific Tauri CLI commands to regenerate on every command change, does not provide mock support, and would force the project to depend on generated files that are hard to audit. Hand-written gateway functions with explicit TypeScript types are more readable and maintainable.

### Class-based IPC service

Considered wrapping all IPC calls in a singleton `IpcService` class with dependency injection for the mock. Rejected because the module-level function approach is simpler (no class instantiation, no DI container) and tree-shakes better. The singleton pattern also makes it harder to reason about initialization order.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-001 | Use Tauri 2 + SvelteKit as the IDE Framework | This ADR manages the IPC boundary created by the Tauri decision |
| ADR-007 | In-App Browser with Password Vault and 2FA | Password vault operations (`loadPasswordDatabase`, `savePasswordDatabase`) go through this gateway |
