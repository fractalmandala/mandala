---
kind: error_handling
name: Rust Result-based Error Handling with Tauri IPC and SvelteKit Error Pages
category: error_handling
scope:
    - '**'
source_files:
    - apps/fracta/src-tauri/src/lib.rs
    - apps/fracta/src-tauri/src/vault.rs
    - apps/fracta/src-tauri/src/workspace.rs
    - apps/fracta/src/routes/+error.svelte
    - apps/fracta/src/lib/ipc.ts
---

This monorepo uses a layered error-handling strategy centered on Rust's `Result<T, String>` type for the Tauri backend, propagated through Tauri IPC to SvelteKit frontends that render errors via framework conventions.

**Backend (Rust/Tauri)**
- All Tauri commands return either `Result<T, String>` or a domain-specific alias like `VaultResult<T>` and `WorkspaceResult<T>` (both `Result<T, String>`). Errors are plain human-readable strings produced via `format!("...")` and `.map_err(|e| e.to_string())?` chains.
- The `vault.rs` module defines `VaultResult<T> = Result<T, String>` and consistently propagates I/O failures as descriptive messages (e.g. "No vault folder has been chosen yet.", "Could not create entry: ...", "Invalid entry id: ..."). Path traversal is rejected early with explicit error strings rather than panicking.
- The `workspace.rs` module mirrors this pattern: every filesystem operation goes through `resolve()` which validates paths and returns `WorkspaceResult`, rejecting traversal, symlinks outside the workspace, and disallowed file kinds with clear error messages.
- Terminal execution uses bounded output (200 KB truncation) and a 120-second timeout; failures are returned as `Err(...)` strings rather than panics.
- No `panic!` is used in command paths; `unwrap_or_default()` and `ok().and_then()` patterns are used for non-fatal fallbacks (e.g., missing timestamps, optional metadata).
- The app entry point calls `.expect("error while running fracta")` only at the very end of `Builder::run(...)`, treating startup failure as unrecoverable.

**IPC Layer (Svelte + Tauri)**
- The frontend `ipc.ts` wraps every `@tauri-apps/api/core.invoke` call in a thin typed function returning a `Promise`. There is no centralized error wrapper — callers must handle rejections themselves.
- The `isTauri()` helper lets code branch between Tauri and browser environments, but error handling remains per-call.

**Frontend (SvelteKit)**
- A single `+error.svelte` page renders `page.status` and `page.error?.message ?? 'Something went wrong.'`, relying on SvelteKit's built-in error propagation from route handlers and server endpoints.
- Layout-level `+layout.ts` sets `prerender = true` and `ssr = false`, so runtime errors surface through the SvelteKit error page rather than custom middleware.

**Sites and Packages**
- Static sites under `sites/` use SvelteKit/Astro without custom error frameworks; any error handling would follow standard JavaScript `try/catch` and SvelteKit conventions, but no dedicated error modules were found.
- The `packages/fractal-agentic` directory is primarily agent/skill/command documentation and configuration; no TypeScript source files with error-handling logic were located.

**Conventions observed**
- Rust side: prefer `Result<T, String>` with `.map_err(...)` over panics; validate inputs early and return descriptive string errors.
- IPC side: no global error transformer — each invoke call is a Promise that may reject.
- Frontend side: rely on SvelteKit's `+error.svelte` for user-facing error display; no custom error boundary components were found.