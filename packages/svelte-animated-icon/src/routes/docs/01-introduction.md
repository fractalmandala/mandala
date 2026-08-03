---
title: Introduction
id: 1
group: getting started
description: "What svelte-animated-icon is, why animated icons, and the core ideas - tree-shakeable, multi-library, Svelte 5, native WAAPI."
---

- **5 icon libraries out of the box** — Phosphor (~1,500 icons), Remix (1,441), Flowbite (444), Hero (515), and Ion (324) — each with 2–3 variants, totalling nearly 10,000 icon variants and over 100,000 animated combinations.
- **20+ animation templates** - `draw`, `spin`, `jelly`, `cascade`, `pop`, `orbit`, `tada`, `flip`, `wave`, `glitch`, and more - each tuned to feel right on icon-scale geometry.
- **A shared animation engine** (`AnimatedIcon`) that also accepts raw SVG strings, so you can animate any custom shape you draw.

## The core ideas

Four design decisions shape everything else in the library:

### 1. Tree-shakeable

Each icon is its own component. `import { Gear } from 'svelte-animated-icon/phosphor'` pulls in **only** `Gear.svelte` plus the shared animation engine. The other ~1,499 icons never enter your bundle. Icons you don't use cost zero bytes.

### 2. Multi-library via subpath exports

Five libraries ship today — `svelte-animated-icon/phosphor`, `/remix`, `/flowbite`, `/hero`, and `/ion`. Each is a separate subpath, so adding a new icon set doesn't bloat projects that don't import it.

### 3. Built for Svelte 5

Props use `$props()`. State uses `$state` and `$derived`. Effects use `$effect`. No `export let`, no `$:`, no `svelte/store` - the codebase is a clean reference for idiomatic Svelte 5.

### 4. Native Web Animations API

Animations run on the browser's built-in WAAPI, not a third-party library. That means:

- **No runtime dependency** to install, audit, or version-bump for animation logic.
- **Hardware-accelerated** transforms and opacity out of the box.
- **Composable** - you can pause, reverse, scrub, or chain animations using the standard `Animation` API.

## A 10-second preview

```svelte
<script>
  import { Gear, Heart, ArrowRight } from 'svelte-animated-icon/phosphor';
</script>

<Gear template="spin" trigger="hover" size={24} />
<Heart template="jelly" trigger="mount" size={32} variant="fill" />
<ArrowRight template="draw" trigger="hover" size={20} />
```

Hover the gear to spin it, mount with a heart that wobbles, and an arrow that draws its outline on hover. No CSS, no animation config - the templates are baked in.

## Where to go next

- **[Installation](/docs/02-installation)** - install the package and meet the peer dependency.
- **[Quick Start](/docs/03-quick-start)** - animate your first icon in under a minute.
- **[Usage](/docs/04-usage)** - the two ways to use the library: per-icon components vs. the `AnimatedIcon` core.

If you want to understand the engine first, **[How It Works](/docs/23-how-it-works)** walks through the WAAPI template model.