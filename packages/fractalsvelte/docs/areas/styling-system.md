---
id: styling-system
title: Styling System Area
type: area
tags: [styling, sass, tokens]
relates_to: [ADR-003]
summary: Pointer document linking CSS variables, tokens, and classical indented SASS structures.
updated: 2026-07-15
---

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
