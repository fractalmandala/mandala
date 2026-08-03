---
title: Quick Start
id: 3
group: getting started
description: "Drop in your first icon and animate it on hover in under a minute."
---

From `npm install` to a spinning, hovering icon takes three steps.

## 1. Install

```sh
pnpm add svelte-animated-icon
```

(Or `npm install` / `yarn add` - see [Installation](/docs/02-installation).)

## 2. Import an icon

Open any `.svelte` file and import a single named component. Each icon is tree-shakeable, so importing `Gear` doesn't drag in the other 1,499 icons.

```svelte
<script>
  import { Gear } from 'svelte-animated-icon/phosphor';
</script>

<Gear />
```

At this point you already have a working icon - just static.

## 3. Pick a template

Add a `template` prop. Templates are the animation names baked into the library.

```svelte
<Gear template="spin" />
```

Hover the gear. It spins.

## Try a few more

The same icon can wear very different personalities:

```svelte
<Gear template="spin" size={24} />
<Gear template="draw" size={24} />
<Gear template="jelly" size={24} />
<Gear template="tada" size={24} />
```

Browse the full list in the [Templates Catalog](/docs/16-templates-catalog).

## Change when it fires

By default icons animate on hover. Switch to **mount** (fires once on load) or **controlled** (you drive it with state):

```svelte
<Gear template="jelly" trigger="mount" />
<Gear template="draw" trigger="controlled" active={isOpen} />
```

See [Triggers](/docs/08-triggers) for the full breakdown.

## Where to go next

- **[Usage](/docs/04-usage)** - per-icon components vs. the `AnimatedIcon` core.
- **[Icon Type](/docs/07-icon-type)** - switch between `regular`, `light`, and `fill` variants.
