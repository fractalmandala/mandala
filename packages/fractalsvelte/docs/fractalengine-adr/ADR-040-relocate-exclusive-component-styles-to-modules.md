---
id: ADR-040
title: Relocate Exclusive Component Styles to Modules
type: adr
tags: [styling, sass, architecture, encapsulation, modules]
summary: Relocates styling files for components used exclusively in a single module to that module's styles directory.
relates_to: [ADR-003, ADR-015, ADR-021, ADR-023, ADR-024]
status: accepted
updated: 2026-07-18
---


**Status:** Accepted
**Date:** 2026-07-18
**Decision makers:** Pair Programming Session (Antigravity AI & Developer)

---

## Context

The application architecture utilizes self-contained functional modules under `src/lib/modules/` (e.g., `designer`, `ide`, `ai`, `bookmarks`, `notes`, `media`), each owning its own components, logic, and state. Svelte 5 styling constraints (AGENTS.md Rule 6) prohibit `<style>` blocks in Svelte files, requiring externalized SASS/CSS files.

Previously, all component SASS stylesheets were placed in the global `src/lib/styles/components/` directory. However, many components are exclusive to a single module (e.g., `Tile` and `Canvas` are used only in `designer`, marketplaces are used only in `ide`, and `PromptInput`/`Conversation` are used only in `ai`). Storing these exclusive styling rules in the global folder breaks domain encapsulation, increases directory clutter, and forces developers to manage component styles far from their source code components.

---

## Decision

We will relocate SASS styling files for components used exclusively in a single functional module to that module's `styles/` folder. Only stylesheets styling components used across multiple modules or globally in the layout/routes will remain in the root `src/lib/styles/components/` folder.

Both global and module-scoped stylesheets will be registered and aggregated in the central entry point `src/lib/styles/index.sass`.

---

## Consequences

### Positive

- **Encapsulation & Cohesion**: Component logic and SASS styling remain grouped closer together within the module boundaries.
- **Root Directory Hygiene**: Reduces clutter in `src/lib/styles/components/` to only truly global, reusable UI components.
- **Safer Code Modifications**: Scopes changes to single-module styles, minimizing the risk of side-effects on other modules.

### Negative

- **Deeper Relative Imports**: Importing shared mixins or variables from the module styles folder requires deeper relative path nesting (e.g., `@use '../../../styles/tokens'`).

### Neutral

- **Centralized Aggregation**: All style files must still be declared in `src/lib/styles/index.sass` to compile correctly.
- **Documentation Parity**: File lists in documentation area maps (`docs/areas/`) must be refreshed when style files are moved.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-003 | Two-Layer CSS Token System with Indented SASS | Built upon this style system |
| ADR-015 | Adopt App Template Routing and Domain State Boundaries | Enforces the boundaries this change respects |
| ADR-021 | Designer Module Extraction | Scopes designer styles inside this module |
| ADR-023 | IDE Module Extraction and Kernel Deferral | Scopes ide styles inside this module |
| ADR-024 | AI Module — Embed-don’t-rewrite | Scopes ai styles inside this module |
