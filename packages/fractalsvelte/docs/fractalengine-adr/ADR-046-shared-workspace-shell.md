---
id: ADR-046
title: Use a Shared Workspace Shell for Module Geometry
type: adr
tags: [shell, layout, paneforge, persistence, undo-redo, modules]
summary: Moves reusable pane geometry, persistence, resizing, and shell motion into one application-level workspace shell while modules retain functional state.
relates_to: [ADR-003, ADR-006, ADR-014, ADR-015, ADR-026, ADR-043]
status: accepted
updated: 2026-07-22
---


**Status:** Accepted
**Date:** 2026-07-19

## Context

Notes and Dev both required resizable, collapsible workspace surfaces, but each held independent copies of sidebar geometry, persistence, pointer handling, and layout undo state. Code, Design, Agent, Media, and Docs subsequently exposed the same duplication. That made workspace layouts behave differently despite sharing the same application chrome.

The application already uses Paneforge for resizable panes. We also need the migration to preserve working legacy layouts until the new shell profiles have been verified.

## Decision

We will use `workspaceLayout.svelte.ts` and `WorkspaceShell.svelte` as the shared owner of workspace geometry. The shell persists profile-specific surface sizes and collapsed state, groups resize gestures into one undo step, and exposes optional left-secondary and right surfaces.

Modules provide rendered content through Svelte snippets and keep domain data, editor state, and module-specific interactions. Notes is the four-surface pilot; Dev and Code, Design, Agent, Media, and Docs are three-surface profiles. Their former layout state remains in the repository while module-specific domain migrations are completed.

The shell uses Paneforge for pane mechanics and SASS semantic tokens for divider, surface, focus, and motion styling. It does not introduce Tailwind, Shadcn, or an additional motion runtime.

## Consequences

### Positive

- Collapse, resize, persistence, focus handling, and reduced-motion behavior now share one implementation.
- Notes and Dev layout mutations participate in their active undo domains through composite histories.
- New module profiles can compose three and four surface layouts without duplicating pointer-resize code.

### Negative

- The migration temporarily retains legacy layout state and components, increasing short-term code surface.
- Profile migrations must preserve module-specific controls and test both new and legacy layouts before obsolete state is removed.

## Alternatives considered

### Keep module-owned layout state

Rejected because each new surface variation would continue to copy persistence, undo, accessibility, and resize mechanics across modules.

### Adopt Shadcn application-shell blocks

Rejected because the project does not use Tailwind and already has Paneforge plus Bits UI primitives that fit the existing Svelte/SASS stack.

### Add a separate motion library

Rejected because pane geometry animations can be expressed with Paneforge, CSS transitions, Svelte lifecycle, and the existing View Transitions API without another runtime dependency.
