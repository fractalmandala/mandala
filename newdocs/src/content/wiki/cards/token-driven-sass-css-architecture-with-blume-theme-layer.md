---
title: Token-Driven SASS + CSS Architecture with Blume Theme Layer
description: The Fractal Monorepo uses a layered, token-driven styling system built on SASS (indented syntax) and modern CSS custom properties, with a dedicated theme layer for documentation sites.
tags: [frontend_style]
type: card
module: repo
path: apps/fracta/src
created: 2026-08-05
updated: 2026-08-06
---

The Fractal Monorepo uses a layered, token-driven styling system built on SASS (indented syntax) and modern CSS custom properties, with a dedicated theme layer for documentation sites.

**Core styling approach:**
- Apps (fracta, shradhapp) use "token-driven indented SASS" as the primary methodology, with design tokens defined in JSON files (`design-tokens.json` that specify spacing, radius, typography, motion durations, and component architecture
- The shared `@fractaldesign/fractal-svelte` package provides reusable Svelte 5 components with SASS-based styles, organized under `src/lib/styles/` with mixins and a cohesive design system
- Documentation sites (fractalhome) use Blume framework with a pure CSS theme layer (`theme.css` that overlays Tailwind utilities via CSS variables using oklch color space

**Design tokens structure:**
- Token files define semantic values: colors (primitive and semantic light/dark modes), spacing scales, radii, typography fonts and sizes, motion durations, and architectural layers
- Shradhapp's tokens include motion principles ("stateful only", "transform and opacity only", "reduced motion first") and component architecture hierarchy
- Fractalwiki uses a comprehensive JSON schema with primitive colors, semantic themes per mode, typography scale, spacing rhythm, and radii

**CSS methodology patterns:**
- Heavy use of CSS custom properties (`--blume-*`, `--fh-*`, `--site-*` for theming and design consistency
- oklch color space throughout for perceptually uniform color manipulation with `color-mix()` functions
- Indented SASS with mixins (e.g., `+interactive` for consistent interaction states across components
- BEM-like naming conventions for site-specific styles (`.fh-button`, `.fh-tag-pill`, `.site-header`
- Responsive design through CSS Grid layouts and media queries with mobile-first breakpoints

**Theme system:**
- Dark/light mode support via `[data-theme="dark"]` attribute selectors
- Consistent focus management with visible outlines for accessibility
- Reduced motion support through `prefers-reduced-motion` media queries
- Glassmorphism effects using backdrop-filter and semi-transparent surfaces

**Component styling organization:**
- Shared components in `packages/fractal-svelte/src/components/` with individual style modules
- Site-specific overrides in each app/site's root CSS files
- Motion animations handled through `@humanspeak/svelte-motion` peer dependency
- Typography system using Google Sans, JetBrains Mono, and system font stacks
