---
id: 09-mixins-breakpoints
title: Responsive Breakpoint Mixins and Helpers
type: design
tags: [responsive, breakpoints, mixins, sass]
summary: Documents the responsive breakpoint mixins and helper functions available for layout adjustments.
relates_to: [04-layout-system, 02-sass-variables]
updated: 2026-06-25
---

# SASS Mixins & Breakpoints

**Source:** [_mixins.sass](file:///Users/amrit/fractals/apps/fractalengine/src/lib/styles/_mixins.sass)

---

## Available Mixins

| Mixin | Trigger | Purpose |
|-------|---------|---------|
| `+bp-xs` | `max-width: 720px` | Extra small screens / narrow panels |
| `+bp-sm` | `max-width: 1024px` | Tablet / narrow viewports |
| `+bp-bs` | `min-width: 721px` | Baseline (above xs) |
| `+bp-lg` | `min-width: 1025px` | Desktop / wide screens |
| `+bp-xl` | `min-width: 1201px` | Extra wide screens |

## Usage

```sass
.card
    padding: 8px
    +bp-sm
        padding: 4px
```

These are custom mixins for scoping non-JIT classes to breakpoints. The JIT engine (`virtual:fractals-styler.css`) handles its own utility classes automatically — these mixins are for manual override scenarios.

---

## Inline breakpoints in `_primitives.sass`

The primitives file also embeds media queries directly for `.mwrap` (row wraps at ≤1024px) and `.mleft` (box left-aligns at ≤1024px when combined with `.xright`).
