---
id: ADR-001
title: Use Tauri 2 + SvelteKit (Svelte 5 Runes) as the IDE Framework
type: adr
tags: [framework, tauri, sveltekit, architecture]
summary: Adopts Tauri 2 + SvelteKit with Svelte 5 Runes as the foundational desktop app framework for FractalEngine Studio.
relates_to: [ADR-002, ADR-004]
status: accepted
updated: 2026-06-25
---


**Status:** Accepted
**Date:** 2026-06-24
**Decision makers:** Backend Lead, Frontend Lead, Product Owner

---

## Context

FractalEngine is a desktop IDE application targeting macOS, Windows, and Linux. The application needs to combine native OS capabilities (file system access, subprocess management, window management, native dialogs) with a rich, reactive frontend for code editing, canvas-based layout, terminal emulation, and an AI copilot interface.

Two fundamental choices define the architecture: how to deliver the desktop shell (native vs. web-based) and what frontend framework to use. The team evaluated several combinations:

- Electron with React or Vue — mature but heavyweight (~120MB baseline binary), high memory consumption, no native titlebar integration without additional modules.
- Tauri with React — much smaller binary (~5MB), Rust backend for native commands, lower memory footprint, but React's virtual DOM overhead is unnecessary given the application's state complexity.
- Tauri with Svelte — same binary advantages, Svelte's compile-time approach produces minimal JavaScript bundles, and Svelte 5 introduces runes as a first-class reactive primitive without the `svelte/store` abstraction.

The team operates across macOS (Apple Silicon and Intel) and Linux, with a small engineering team of 3-5 developers. The application must support development inside a web browser (`pnpm dev` outside Tauri) for rapid iteration and accessibility testing.

The existing monorepo at `apps/fractalengine/` already uses `pnpm` workspaces and TypeScript throughout.

---

## Decision

We will use Tauri 2 as the desktop shell with SvelteKit (adapter-static) and Svelte 5 runes as the frontend framework for FractalEngine IDE.

We chose Tauri over Electron because the ~5MB vs ~120MB binary size difference matters for a developer tool that ships across three platforms, and the Rust backend provides safe, performant native command handlers without the Node.js runtime overhead. We chose Svelte 5 over React because Svelte's compile-time reactivity eliminates the virtual DOM, produces smaller bundles, and the runes API (`$state`, `$derived`, `$effect`, `$props`) provides a unified reactivity model that replaces both `svelte/store` and `$:` reactive labels. We chose SvelteKit with `adapter-static` rather than raw Svelte because SvelteKit provides file-based routing, a build pipeline, and a development server out of the box, while the static adapter produces a single-page application for Tauri's webview.

---

## Consequences

### Positive

- Binary size of ~5-10MB per platform compared to ~120MB+ with Electron, making downloads and updates significantly faster.
- Rust backend enables safe filesystem operations, subprocess management for local AI model execution, and direct system API access without Node.js or sidecar processes for basic operations.
- Svelte 5 runes eliminate the runtime overhead of virtual DOM diffing — the compiler generates direct DOM update code at build time.
- Development can proceed entirely in the browser via `pnpm dev` using the IPC mock module, enabling frontend engineers to work without installing Tauri or Rust toolchain.
- Static adapter with fallback to `index.html` ensures the SPA works correctly inside Tauri's webview regardless of routing.
- SvelteKit's TypeScript integration via `.svelte-kit/tsconfig.json` provides strict type-checking across the entire frontend.

### Negative

- Svelte 5 and runes are a relatively new paradigm (post-2024); team members must learn runes-based reactivity and cannot rely on legacy Svelte 4 patterns or community resources that still reference `$:` labels and `svelte/store`.
- Tauri 2's plugin ecosystem is less mature than Electron's — integrations like window state, file dialogs, and auto-update require explicit plugin configuration in `Cargo.toml` and capability declarations.
- The IPC boundary between Rust and the frontend introduces serialization overhead for every native command; high-frequency operations (e.g., real-time file watching) must be carefully batched or streamed via events.
- The overlay titlebar (`titleBarStyle: "Overlay"`) and hidden title require custom draggable regions in the frontend, adding layout complexity.

### Neutral

- Rust must be maintained as a build dependency for all developers and CI pipelines — the team must include Rust toolchain installation in onboarding documentation.
- The `fractals-styler` JIT plugin for Vite must be maintained in parallel to provide design-token-driven utility classes.

---

## Alternatives Considered

### Electron with React

Electron provides a mature desktop shell with extensive plugin ecosystem and DevTools integration. Rejected because the ~120MB baseline binary size is excessive for a developer tool, memory consumption is typically 2-3x higher than Tauri, and React's virtual DOM adds unnecessary overhead for an IDE where most DOM updates are localized to editing surfaces and canvas tile positions.

### Tauri with React

Tauri's binary advantages apply, but React's functional component model with hooks (useState, useEffect, useMemo) creates ceremony around state management that Svelte 5's runes eliminate. For an application with complex shared state across 10+ components, Svelte's simpler reactivity model reduces boilerplate and potential for stale-closure bugs.

### Electron with Svelte 4

Combines Electron's mature shell with Svelte 4's efficient compiler. Rejected because Electron's binary size and memory overhead remain, and Svelte 4's `$:` reactive labels and `svelte/store` API are less ergonomic than Svelte 5 runes for complex state graphs. The legacy `$:` syntax does not compose well — refactoring reactive statements requires understanding implicit dependency tracking, which is error-prone.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-002 | Svelte 5 Runes-Only State Management | Enabled by this ADR; runes are the reactivity foundation |
| ADR-003 | Two-Layer CSS Token System with Indented SASS | Complementary; the styling architecture runs within SvelteKit |
| ADR-004 | Single IPC Gateway Module for All Tauri API Calls | Required by this ADR; bridges the Rust ↔ frontend boundary |
