---
id: ADR-023
title: IDE Module Extraction and Kernel Deferral
type: adr
tags: [ide, module, extraction, architecture]
summary: Extracts classic IDE layout components into a self-contained module under src/lib/modules/ide/ and defers the kernel (Rust) architecture to a future phase.
relates_to: [ADR-010]
status: accepted
updated: 2026-07-15
---

# ADR-023: IDE Module Extraction and Kernel Deferral

**Status:** Accepted
**Date:** 2026-07-15
**Decision makers:** Architecture Lead

---

## Context

The FractalEngine codebase has been progressively modularized with two prior extractions: the Designer module (`ADR-021`) and the Notes module (`ADR-022`). Each extraction moved a domain's components, state, and styles out of the core `src/lib/components/` and `src/lib/styles/` directories into a self-contained `src/lib/modules/<domain>/` tree, with the goal of keeping the core focused on shell infrastructure and cross-cutting concerns.

The IDE surface — `ClassicIdeLayout`, `Editor`, `Sidebar`, `Terminal`, and `TreeNode` — remained in `src/lib/components/` after both prior phases, alongside their three indented SASS files (`_editor.sass`, `_sidebar.sass`, `_terminal.sass`) in `src/lib/styles/components/`. This was the last block of feature-specific components still in the flat core directory.

At the same time, the undo-system wiring had accumulated a directional violation: `src/lib/state/undo.svelte.ts` (core) directly imported the Designer and Notes module state files to register their undo domains. Every prior module extraction deferred this inversion because it touched all three domains at once, but the IDE extraction provides the natural boundary to do it — the core's `undo.svelte.ts` should know about domain ids and coordinator infrastructure, not module imports.

A separate concern is the status of `src/lib/state/ide.svelte.ts` (~2,500 lines). Unlike the Designer and Notes modules, the IDE state is not a self-contained domain. It is the application kernel: it manages AI providers and Copilot streaming, the password manager and in-app browser, settings, marketplaces, project memory and sessions, logs, workspaces, undo coordination, and the IDE-specific file-system/tabs/terminal state. Extracting only the IDE-UI state slices (tabs, files, terminal) would require a bridge for the majority of the undo/workspace snapshot — the inverse of the Notes situation, at roughly 10× the size. The kernel therefore remains in place, and this ADR records the boundary explicitly.

Finally, the module extraction creates a known set of core→module import edges (the `tileKinds.ts` core file imports Editor, Sidebar, and Terminal as tile components) — the same pattern that exists for AIChat→Designer panels.

---

## Decision

We will extract the IDE feature surface — ClassicIdeLayout, Editor, Sidebar, Terminal, TreeNode, fileIcons, and their three SASS files — into `src/lib/modules/ide/`, and we will invert the undo-domain registration so that each module registers itself with the core coordinator rather than being imported by it.

Specifically:

1. **IDE surface moved:** The five components plus `fileIcons.ts` reside in `src/lib/modules/ide/components/` and `src/lib/modules/ide/fileIcons.ts`. The three SASS files reside in `src/lib/modules/ide/styles/`. The lazy import in `src/routes/+page.svelte` and the `tileKinds.ts` cross-module imports are updated to the new paths.

2. **Undo self-registration inverted:** `src/lib/state/undo.svelte.ts` no longer imports Designer or Notes module files. Each module's state file (`notes.svelte.ts`, `designcanvas.svelte.ts`) calls `registerUndoDomain()` at module scope, the same way the core domains (`canvas`, `ide`) are registered. Registration remains startup-eager because `+layout.svelte` imports both module state files at module scope.

3. **The kernel stays put:** `src/lib/state/ide.svelte.ts` remains in `src/lib/state/` as a core file. Its section inventory covers: AI providers and provider management, Copilot streaming sessions, password manager and in-app browser, application settings, model and skills marketplaces, project memory and session history, log buffer, workspace serialization, undo-domain coordinator, and IDE-specific file-system, tabs, and terminal state. The `ai/browser/settings` facade files (`src/lib/state/{ai,browser,settings}.svelte.ts`) are preserved as seams for future decomposition.

4. **Core→module edges accepted:** The cross-module imports in `tileKinds.ts` (core→ide) and the AIChat→Designer panels edge are documented as known violations to be resolved during a future kernel decomposition, not fixed in this phase.

---

## Consequences

### Positive

- All three feature domains (designer, notes, ide) now follow the same module layout, making the codebase structure consistent.
- `undo.svelte.ts` is a pure core file — it imports no module files, only `ide/app/canvas` state. Module undo domains are self-registering.
- The kernel's boundaries are explicitly documented, preventing future attempts to extract it prematurely.
- The `ai/browser/settings` facade files are explicitly identified as seams for the future kernel split.

### Negative

- Four documented core→module import edges exist: `tileKinds.ts` → Editor, Sidebar, Terminal (ide); AIChat → DesignLayout (designer). These must be resolved in a later kernel-decomposition phase.
- `ide.svelte.ts` remains large (~2,500 lines) with no immediate path to decomposition. Any new feature requiring IDE state must continue to add to it.
- The `+layout.svelte` import of module state files for eager undo registration is an implicit coupling — if a module's state file is removed or renamed, the undo domain registration breaks silently at module-scope evaluation time.

### Neutral

- The three SASS files now live under `modules/ide/styles/`, consistent with the designer and notes style locations.
- Routing docs for the five moved components are renamed to reflect their new module paths.

---

## Alternatives Considered

### Defer module extraction entirely until a kernel decomposition

Keep all IDE components in `src/lib/components/` alongside the kernel and extract everything at once when `ide.svelte.ts` is decomposed. Rejected because the flat core directory is a growing readability burden — every new IDE component goes into the same directory as shell infrastructure, marketplaces, and templates. The extraction is mechanically independent of the kernel decomposition and provides immediate consistency benefits.

### Extract the IDE UI state from ide.svelte.ts alongside the components

Move tabs, file-system, and terminal state out of `ide.svelte.ts` into a new `modules/ide/state/` directory. Rejected because the IDE-specific state is tightly interleaved with the kernel — undo snapshots, workspace serialization, and configuration all reference IDE state. Prying them apart would require changing `ideState`'s public API and reworking every consumer, a scope that exceeds the current phase. The ADR recording of the kernel boundary is the correct first step.

### Introduce a tile-component registry abstraction to eliminate the core→module import

Create a registry pattern that allows `tileKinds.ts` to discover IDE components without importing them directly. Rejected because the component count is small (three), the pattern is already established (AIChat→Designer was accepted in ADR-021), and introducing a registry abstraction for three imports is over-engineering before the kernel decomposition determines the right architecture.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-021 | Designer Module Extraction | Established the module-extraction pattern this ADR follows; also introduced the AIChat→designer core→module edge this ADR documents as accepted |
| ADR-022 | Notes Module Extraction | Earlier module extraction using the same pattern |
| ADR-006 | Mandatory Undo/Redo Boundary | The undo infrastructure this ADR's inversion preserves |
| ADR-015 | App Template Routing and Domain State Boundaries | Established the template/domain model that keeps module state files eagerly imported via `+layout.svelte` |

---

## Notes

The four documented core→module edges should be revisited during any future decomposition of `ide.svelte.ts`. At that point, a module registry or dependency injection mechanism may be warranted — but only if the number of edges grows substantially beyond the current four.
