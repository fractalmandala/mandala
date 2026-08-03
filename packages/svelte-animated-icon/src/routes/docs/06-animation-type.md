---
title: Animation Type
id: 6
group: customization
description: "Choosing an animation template (draw, spin, jelly, …) and which suit line vs fill icons."
---

The `template` prop selects which animation runs. Each template is a small WAAPI script that operates on whatever shapes the icon contains - `path`, `circle`, `line`, `polyline`, `polygon`, `ellipse`, `rect` - so a single template animates **any** of the 4,000+ icons uniformly.

## Pick by feel

| Template | Vibe | Best on |
|---|---|---|
| `draw` | Pen traces the outline | line icons (regular, light) |
| `native-draw` | Same idea, slower | line icons |
| `cascade` | Shapes pop in one after another | anything with several paths |
| `pop` | Each shape bounces in | mixed / chunky icons |
| `spin` | Whole icon rotates | symmetric icons (gear, loader, settings) |
| `jelly` | Squish + wobble | friendly UI (heart, star, smile) |
| `tada` | Quick scale + rotate accent | celebratory moments (success, share, send) |
| `flip` | 3D Y-axis flip | toggleable state (play/pause, on/off) |
| `swing` | Pendulum sway | arrow-like or directional icons |
| `wave` | Sequential opacity sweep | icons with many parallel paths |
| `orbit` | Each shape rotates into place | layered icons (compass, dashboard, sun) |
| `march` | Strokes march along the path | line icons, especially dashed-feeling ones |
| `boil` | Bubbling motion | organic icons (cloud, fire, drop) |
| `glitch` | Rapid translate/jitter | status / debug indicators |
| `wipe` | Reveal mask slides across | line icons, hero moments |
| `rise` | Fade + rise from below | entrances |
| `iris` | Circular scale from center | loading indicators |
| `split` | Shape breaks apart and rejoins | playful / attention-grabbing |
| `drop` | Fall + settle | drop, pin, download |
| `stamp` | Slam into place | confirmations, approvals |
| `trace` | Outline-first, then fill | line → fill transition |
| `assemble` | Shapes converge to final position | composed icons (lock, key) |

> Browse them live on the home route or in the [Templates Catalog](/docs/16-templates-catalog).

## Line vs. fill

Templates that rely on a stroke (like `draw`, `march`, `native-draw`) **only look right on icons that have one**. Phosphor's `regular` and `light` variants are stroked; `fill` is solid.

| If your icon is… | Reach for |
|---|---|
| Stroked (`regular`, `light`) | `draw`, `native-draw`, `march`, `wipe`, `trace` |
| Solid (`fill`) | `pop`, `cascade`, `spin`, `jelly`, `tada`, `drop`, `stamp` |
| Mixed / unclear | `cascade`, `orbit`, `split`, `glitch` (geometry-agnostic) |

Templates declare their preference with a `for` field - `for: 'line'` means stroke-based, `for: 'fill'` means solid-suited, omitted means both. See `IconTemplate` in [Core Exports and Types](/docs/18-core-exports-and-types).

## Combining multiple icons in a row

When a group of icons animate together (a toolbar, a feature row), reach for templates that don't fight each other. `cascade` and `pop` already stagger by index - if you want to stagger across separate icons, drive them with [controlled triggers](/docs/08-triggers) and small `delay` differences in your own state.

## Try it on the home page

The interactive explorer on `/` lets you swap templates, variants, sizes, and triggers on the fly. The fastest way to find the template that *feels* right for an icon.