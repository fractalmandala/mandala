---
id: contributions
title: Contributions Area
type: area
tags: [contributions, registry, commands]
relates_to: [ADR-025]
summary: Covers the contribution registry for commands, keybindings, and menu actions.
updated: 2026-07-22
---

# Contributions Area

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

## File table

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`contributions.svelte.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/contributions.svelte.ts) | contributions.svelte.ts |
| [`coreContributions.ts`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/state/coreContributions.ts) | Side-effect import: bookmarks module contributions register on load |
| [`contribution-contracts.test.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/unit/contribution-contracts.test.ts) | Side-effect imports — registers stubs in Stream B's worktree; real entries post-merge. |

<!-- filetable:end -->
