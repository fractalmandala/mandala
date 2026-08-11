---
id: 05-utility-primitives
title: Reusable Layout Utility Classes
type: design
tags: [utilities, layout, css-classes]
summary: Catalogs reusable layout utility classes (row, col, gap*, etc.) for quick composition without bespoke CSS.
relates_to: [04-layout-system, 07-class-registry]
updated: 2026-06-25
---


> 2026-07-13: semantic icon-filter and text-decoration primitives replace static inline styles in Svelte components.

**Source:** `_primitives.sass`

---

## Flex Layout: `.box` (column)

| Class | Property | Variants |
|-------|----------|----------|
| `.box` | `display: flex; flex-direction: column` | — |
| `.box.xcenter` | `align-items: center` | — |
| `.box.xleft` | `align-items: flex-start; text-align: left` | — |
| `.box.xright` | `align-items: flex-end; text-align: right` | Responsive: ≤1024px becomes left-aligned when paired with `.mleft` |
| `.box.ycenter` | `justify-content: center` | — |
| `.box.ytop` | `justify-content: flex-start` | — |
| `.box.ybot` | `justify-content: flex-end` | — |

## Flex Layout: `.row` (row)

| Class | Property | Variants |
|-------|----------|----------|
| `.row` | `display: flex; flex-direction: row` | — |
| `.row.wrap` | `flex-wrap: wrap` | — |
| `.row.ycenter` | `align-items: center` | — |
| `.row.ytop` | `align-items: flex-start` | — |
| `.row.ybot` | `align-items: flex-end` | — |
| `.row.xbetween` | `justify-content: space-between` | — |
| `.row.xright` | `justify-content: flex-end` | — |
| `.row.xleft` | `justify-content: flex-start` | — |
| `.row.mwrap` | | ≤1024px: `flex-wrap: wrap` |

## Grid Layout

| Class | Breakpoint | Behavior |
|-------|------------|----------|
| `.grid` | All | `display: grid; grid-auto-flow: row` |
| `.grid.grid-cols-2` | ≥1025px | `grid-template-columns: repeat(2, minmax(0, 1fr))` |
| `.grid.grid-cols-3` | ≥1025px | 3 columns |
| `.grid.grid-cols-4` | ≥1025px | 4 columns |
| `.grid.grid-cols-5` | ≥1025px | 5 columns |
| `.grid.grid-cols-6` | ≥1025px | 6 columns |

---

**Composition pattern:** Combine classes: `<div class="row ycenter xbetween">` for a horizontal bar with centered items and space-between.

---

**Primitives for buttons and other reusable components**.
