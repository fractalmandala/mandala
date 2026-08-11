---
id: ADR-019
title: Separate SvelteKit Development and Production Generation Directories
type: adr
tags: [sveltekit, build, development, reliability]
summary: Isolates SvelteKit dev and production generated output so a production build cannot corrupt a running development server.
relates_to: [ADR-001]
status: accepted
updated: 2026-07-13
---


**Status:** Accepted
**Date:** 2026-07-13
**Decision makers:** FractalEngine maintainers

## Context

SvelteKit development and production generation previously shared `.svelte-kit`. Running `pnpm build` while `pnpm dev` was active reproducibly failed with `ENOTEMPTY` while replacing `.svelte-kit/output`, and either process could invalidate files the other still needed. Validation builds must not interrupt an active browser session.

Generated TypeScript configuration must also resolve consistently for editor diagnostics and `svelte-check`. The repository needs deterministic, ignored output locations.

## Decision

We will use `.svelte-kit-dev` for the development server and SvelteKit's standard `.svelte-kit` directory for production generation, while TypeScript extends both generated configurations.

The dev script supplies `FRACTALENGINE_BUILD_OUT_DIR=.svelte-kit-dev`; `svelte.config.js` defaults to `.svelte-kit`; and `tsconfig.json` extends both generated configurations so diagnostics work with or without the active dev server. Package scripts synchronize both directories before dev, check, and build. Before `vite build`, a bounded cleanup script removes only the selected generated directory's `output` child and the static `build` destination, with path-containment checks and filesystem retries. Cleaning `build` also prevents Finder-created `.DS_Store` metadata from causing adapter-static to fail with `ENOTEMPTY`.

## Consequences

### Positive

- Production builds complete while the development server remains active.
- Development watching cannot react to production generator churn.
- TypeScript and Svelte diagnostics use SvelteKit's standard generated configuration without configuration warnings.
- Consecutive check/build/E2E phases no longer depend on a single non-retrying directory removal succeeding under filesystem churn.

### Negative

- A workspace can temporarily contain two generated SvelteKit trees, increasing local disk use.
- Direct `vite dev` calls that bypass the package script do not receive the development override.
- Direct `vite build` calls bypass the guarded pre-clean step; repository validation must use `pnpm build`.

### Neutral

- Both generated directories are gitignored and disposable. The obsolete `.svelte-kit-build` directory may remain locally until normal generated-file cleanup.

## Alternatives Considered

### Continue sharing `.svelte-kit`

Rejected because concurrent dev/build execution reproduces a filesystem replacement failure and risks nondeterministic generated state.

### Stop development before every build

Rejected because it disrupts feedback and makes automated validation depend on user-owned process state.

### Generate TypeScript configuration in the development directory

Rejected because editor diagnostics should not require a running development server; sync and build both generate the build-default directory.

### Use a custom production directory

Rejected after `.svelte-kit-build` made consecutive sync/build phases intermittently race while removing its output tree. SvelteKit's standard directory is the supported contract for generated TypeScript configuration and production output.

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|--------------|
| ADR-001 | Use Tauri 2 + SvelteKit (Svelte 5 Runes) as the IDE Framework | Refines ADR-001's SvelteKit development and build workflow. |
