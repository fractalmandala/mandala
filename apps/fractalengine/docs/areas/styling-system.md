---
id: styling-system
title: Styling System Area
type: area
tags: [styling, sass, tokens]
relates_to: [ADR-003]
summary: Pointer document linking CSS variables, tokens, and classical indented SASS structures.
updated: 2026-07-15
---

# Styling System Area

## Purpose & boundaries

The Styling System area establishes visual styling standards and the SASS aggregation pipeline for the application.

## State & persistence

- **Global styling variables**: Configured in `src/lib/styles/_tokens.sass` and `_primitives.sass` (ADR-003).

## Extension points

- **CSS Tokens**: Adding new color primitives, semantic variable keys, or dark/light mode token overrides.
- **Component stylesheets**: Registered by importing them inside `src/lib/styles/index.sass`.

## Cross-area edges

- **Svelte Styling**: All Svelte components consume global semantic classes and tokens; inline `<style>` tags are prohibited.

## Gotchas

- **Classic indented SASS**: Strictly use classical indented SASS format (no curly braces, no semicolons) and single-tab indentations for styling sheets.

## File table

<!-- filetable:begin -->
| File | Description |
|---|---|
| [`_commons.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/_commons.sass) | _commons.sass |
| [`_font-imports.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/_font-imports.sass) | _font-imports.sass |
| [`_globals.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/_globals.sass) | _globals.sass |
| [`_primitives.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/_primitives.sass) | _primitives.sass |
| [`_tokens.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/_tokens.sass) | _tokens.sass |
| [`_typography.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/_typography.sass) | _typography.sass |
| [`_ai-data.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_ai-data.sass) | ai-elements data components (Stream A) — Context |
| [`_ai-elements.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_ai-elements.sass) | ai-elements styles — shared by Code, Mermaid, Actions, CopyButton. |
| [`_ai.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_ai.sass) | AI Copilot styling for global Svelte 5 elements |
| [`_appdock.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_appdock.sass) | _appdock.sass |
| [`_builder.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_builder.sass) | _builder.sass |
| [`_commandpalette.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_commandpalette.sass) | _commandpalette.sass |
| [`_dock.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_dock.sass) | _dock.sass |
| [`_layout.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_layout.sass) | Main application structure layout SASS |
| [`_minimap.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_minimap.sass) | _minimap.sass |
| [`_paneforge.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_paneforge.sass) | Replace your old .appgrid configuration with full coverage for Paneforge |
| [`_searchoverlay.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_searchoverlay.sass) | _searchoverlay.sass |
| [`_settings.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_settings.sass) | _settings.sass |
| [`_splitpanes.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_splitpanes.sass) | _splitpanes.sass |
| [`_tempfile.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_tempfile.sass) | _tempfile.sass |
| [`_templategallery.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_templategallery.sass) | Template Gallery styles (completely unused in the application) |
| [`_tooltip.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_tooltip.sass) | Tooltip — fractalui/bits-tooltip.svelte (Bits UI Tooltip primitives) |
| [`_workspace-shell.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/components/_workspace-shell.sass) | _workspace-shell.sass |
| [`index.sass`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/index.sass) | index.sass |
| [`REGISTRY.md`](file:////Users/amrit/fractals/apps/fractalengine/src/lib/styles/REGISTRY.md) | REGISTRY.md |
| [`style-contracts.test.ts`](file:////Users/amrit/fractals/apps/fractalengine/tests/unit/style-contracts.test.ts) | style-contracts.test.ts |

<!-- filetable:end -->
