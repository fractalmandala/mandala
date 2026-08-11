---
id: contributions
title: Contributions Area
type: area
tags: [contributions, registry, commands]
relates_to: [ADR-025]
summary: Covers the contribution registry for commands, keybindings, and menu actions.
updated: 2026-07-22
---

## Purpose & boundaries

The Contributions area manages the central command and shortcut registry system.

## State & persistence

- **Registry State**: Handled in `state/contributions.svelte.ts`.

## Extension points

- **Registry Additions**: Declarations in module-scoped `contributions.ts` files automatically loaded at startup.
- **Keybindings**: Map custom keyboard mappings matching layout triggers.

## Cross-area edges

- **Palette Renderers**: Command Palette and native layout menus render items straight from the registry.
- **Workspace controls**: Code, Design, Agent, and Media sidebar commands route through `workspaceLayout` with the same profile/surface pairs used by the active-module header controls.

## Gotchas

- **Initialization**: Contributions are static and must be registered during application initialization.
