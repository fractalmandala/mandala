---
id: ADR-003
title: Two-Layer CSS Token System with Indented SASS
type: adr
tags: [design-tokens, sass, styling]
summary: Establishes a two-layer (Primitives -> Semantic) CSS variable token system authored in indented SASS, consumed by components via semantic variables only.
relates_to: [ADR-001]
status: accepted
updated: 2026-06-25
---

# ADR-003: Two-Layer CSS Token System with Indented SASS

**Status:** Accepted
**Date:** 2026-06-24
**Decision makers:** Frontend Lead, Product Owner

---

## Context

FractalEngine has a rapidly evolving UI with 10+ components, three major layout generations (legacy three-column → flexible layout → spatial canvas board), and a requirement to support VS Code-compatible theme swapping at runtime. The application needs a styling system that satisfies four constraints:

1. **Theme switching**: Users can select from hundreds of VS Code themes at runtime — the styling system must support swapping all color values without recompilation.
2. **Design consistency**: Colors, spacing, radii, and shadows must follow a defined scale rather than ad-hoc values scattered across component files.
3. **Component isolation**: Each component's styles should be maintainable without inspecting other components' CSS.
4. **No hardcoded values**: Components must never hardcode colors, font sizes, spacing, radii, or shadows — all visual properties must come from a centralized token system.

The team uses Svelte 5, which by default encourages scoped `<style>` blocks per component. However, scoped styles cannot reference CSS custom properties dynamically in all cases, and VS Code theme engines require CSS variables at the `:root` level to enable runtime swapping.

The project also uses `fractals-styler`, a JIT CSS utility plugin for Vite that generates utility classes from design tokens.

---

## Decision

We will use a two-layer CSS token architecture with indented SASS (`.sass`) syntax, organized as follows:

**Layer 1 — Primitives** (`_primitives.sass`): Utility classes (`.box`, `.row`, `.grid`, flex helpers, responsive modifiers) that provide layout primitives without any color or theme binding. These are pure structural utilities.

**Layer 2 — Semantic tokens** (`_tokens.sass`): CSS custom properties at `:root` level that map semantic names to values. Tokens follow an `--{property}-{modifier}` naming convention:

- `--text-primary`, `--text-secondary`, `--text-tertiary` — text color scale
- `--background10` through `--background50` — background shade scale (10 = darkest, 50 = lightest)
- `--border-primary`, `--border-secondary`, `--border-tertiary` — border color scale
- `--theme-color`, `--theme-color-alt` — accent colors controlled by the VS Code theme engine

Each component stylesheet (in `src/lib/styles/components/_*.sass`) consumes semantic CSS variables only, never hardcoded values. The `_tokens.sass` file is the single point of change for all visual properties.

Dynamic component variants use semantic class names rather than injecting raw visual values through `style:` directives. Template categories, for example, map to `--template-category-*` semantic aliases, while thumbnail geometry lives in the external component stylesheet.

**Enforcement rules:**

- No `<style>` blocks in `.svelte` files — all styles live in `src/lib/styles/components/_*.sass`.
- Component SASS files are imported through `src/lib/styles/index.sass`.
- Semantic tokens are referenced as `var(--token-name)` in SASS, never as raw hex values.
- The SASS compiler enforces indented syntax (`.sass`): single-tab indentation, no curly braces, no semicolons.

---

## Consequences

### Positive

- Theme switching is a single `:root` variable override — the VS Code theme engine writes new values to `--text-primary`, `--background10`, etc., and all components react immediately without recompilation.
- Component styles are fully portable — any component can be moved or reused as long as the token system is present. No magic numbers or hardcoded colors exist in component files.
- The separation between `_primitives.sass` (structural) and `_tokens.sass` (thematic) means layout changes do not affect theme work and vice versa, enabling parallel development.
- The `fractals-styler` Vite plugin consumes the same tokens to generate utility classes, providing a shorthand for common patterns (`.row.ycenter.xbetween`) without duplicating token definitions.
- Indented SASS enforces a consistent visual structure across all stylesheets — the lack of braces and semicolons reduces visual noise and makes formatting disputes impossible.

### Negative

- Developers must open two files to style a new component: the `.svelte` file for markup and the `_componentname.sass` file for styles. This adds context-switching overhead compared to co-located `<style>` blocks.
- The SASS file-per-component pattern creates 13+ stylesheet files in `src/lib/styles/components/` that must be maintained and imported through the index.
- CSS custom variables used in SASS require `var()` function calls, which are slightly more verbose than direct SASS variables.
- Developers new to indented SASS must learn the significant-whitespace syntax, which differs from both SCSS and standard CSS.

### Neutral

- The `_tokens.sass` file also defines z-index scale, shadow variables, overlay backgrounds, and other shared constants — it serves as the single source of truth for all design constants beyond just colors.
- Module legend dot colors (`$module-code`, `$module-design`, etc.) are defined as SASS variables derived from tokens, providing semantic mapping for tile kind indicators.

---

## Alternatives Considered

### Co-located `<style>` blocks in Svelte components

Rejected because Svelte's scoped styles make theme swapping impossible without CSS custom properties, and scattering style definitions across 10+ `.svelte` files creates no single point of control for visual consistency. The token system would need to be duplicated or imported in every component.

### SCSS (curly-brace SASS)

Rejected in favor of indented SASS because indented SASS enforces consistent formatting by eliminating braces and semicolons. The indented syntax is significantly cleaner for a codebase with many stylesheet files and eliminates formatting debates in code review.

### CSS-in-JS (emotion, styled-components)

Rejected because CSS-in-JS libraries add runtime overhead for style injection, conflict with Svelte's compile-time approach, and do not integrate well with the `fractals-styler` Vite plugin. The project already uses Svelte's built-in scoping — a CSS-in-JS solution would duplicate that capability.

### Tailwind CSS

Tailwind's utility-first approach provides rapid prototyping but requires every component to use dozens of class-name combinations, making theme customization cumbersome. The two-layer token system provides similar utility via `_primitives.sass` (`.box`, `.row`, `.grid`) without the verbose class-name strings, and with full control over the token naming convention.

---

## Related Decisions

| ADR | Title | Relationship |
|-----|-------|-------------|
| ADR-001 | Use Tauri 2 + SvelteKit as the IDE Framework | This ADR provides the styling layer for the SvelteKit app |
| ADR-005 | Spatial Canvas Board Layout | Canvas-specific styles in `_canvas.sass`, `_tile.sass`, `_minimap.sass`, `_dock.sass` all follow this two-layer pattern |

---

## Notes

The `:root` scope for tokens means that any iframe or nested webview within the application will not inherit these tokens automatically — embedded contexts must explicitly load the token set. This is currently not an issue since no runtime iframes exist beyond the in-app browser's webview.
