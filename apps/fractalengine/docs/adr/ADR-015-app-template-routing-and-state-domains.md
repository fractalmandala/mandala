---
id: ADR-015
title: Adopt App Template Routing and Domain State Boundaries
type: adr
tags: [routing, templates, state-management, svelte-5]
summary: Introduces an app-level template router and incremental domain state stores so Canvas, Code, Notes, Design, AI, settings, browser, and shell concerns stop sharing one monolithic state owner.
relates_to: [ADR-002, ADR-005, ADR-006, ADR-010, ADR-012]
status: accepted
updated: 2026-07-13
---

# ADR-015: Adopt App Template Routing and Domain State Boundaries

**Status:** Accepted
**Date:** 2026-06-25
**Decision makers:** Product Owner, Frontend Lead

---

## Context

FractalEngine Studio has multiple workspace streams: a spatial canvas home, a code IDE, a notes/wiki workspace, and a design canvas. The root page had become responsible for header controls, footer controls, overlay mounting, template switching, and stream-specific commands. At the same time, `canvas.svelte.ts` owned both spatial tile layout and the app-wide active template, while `ide.svelte.ts` owned code workspace state, notes vault state, AI chat, browser/passwords, settings, logs, and undo.

This made navigation and state ownership hard to reason about. Template movement could affect canvas layout persistence, notes components reached into code-oriented `ideState`, and design scene persistence existed in both `DesignLayout.svelte` and `designcanvas.svelte.ts`.

## Decision

We will use an internal app-shell template router backed by `appState`, and we will split state behind domain-specific store exports.

`appState` owns `activeTemplateId`, template gallery visibility, template metadata lookup, template application, and native menu sync. The spatial canvas store owns only freeform tile state. Domain stores such as `aiState`, `settingsState`, `browserState`, `shellState`, `notes`, and `designcanvas` become the public boundaries for their features. Where extraction is incomplete, compatibility stores may delegate to `ideState` until the underlying implementation can be moved safely.

The shell boundary is also the single owner of global-overlay visibility. Opening Settings, Command Palette, or App Dock closes the other two; all buttons and keyboard shortcuts call those shell setters instead of mutating independent flags.

## Consequences

### Positive

- Template routing no longer depends on spatial canvas state.
- The root app shell can become thinner because code, notes, design, AI, settings, and browser concerns have named state boundaries.
- Migration can proceed incrementally without breaking existing components that still depend on `ideState`.
- Native menu template checks now include the design stream.

### Negative

- Compatibility adapters temporarily add indirection while the monolithic state is split.
- Some undo behavior still delegates to the legacy `ideState` snapshot until each domain registers its own snapshot boundary.
- The design layout still uses its current renderer, but commits scene persistence through `designcanvas`; a later pass should remove the remaining local editable copy.

### Neutral

- The app keeps internal shell routing instead of URL routes such as `/code`, `/notes`, and `/design`.
- Existing workspace files can still read legacy `activeTemplateId` metadata.

## Alternatives Considered

### Keep Template Routing in Canvas State

Rejected because the spatial canvas and app stream navigation are different responsibilities. Keeping both in `canvas.svelte.ts` continued the confusion between home canvas tiles and global workspace mode.

### Move Immediately to URL Routes

Rejected for this pass because the app is Tauri/static-first and current template switching does not require deep links. URL routes can be added later after state boundaries are stable.

### Hard Split All State at Once

Rejected because `ideState` touches many components and IPC flows. Compatibility adapters allow safe migration without a single high-risk rewrite.

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-002 | Svelte 5 Runes-Only State Management | Provides the runes state model used by the new domain stores |
| ADR-005 | Adopt Spatial Canvas Board Layout with Draggable Tiles | The canvas store remains responsible for spatial tile layout |
| ADR-006 | Mandatory Undo/Redo Boundary for User-Editable State | Domain undo registration will replace the monolithic snapshot over time |
| ADR-010 | Classic IDE Layout Integration and Restoration | Code template continues to render `ClassicIdeLayout` |
| ADR-012 | Markdown Notes & Wiki Workspace with TipTap WYSIWYG Editor | Notes template now exposes notes state through the notes domain store |
