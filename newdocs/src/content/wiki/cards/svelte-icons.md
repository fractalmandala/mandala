---
title: svelte-icons
description: Svelte 5 icon package generated from SVG folders — drop SVGs into an iconset, run pnpm generate, import tree-shakable icons that inherit currentColor.
tags: [package, svelte, icons, generator]
type: card
module: packages/svelte-icons
path: packages/svelte-icons
created: 2026-08-06
updated: 2026-08-06
---

A Svelte 5 icon package generated from SVG folders. Add SVGs, run the generator, and get tree-shakable per-icon modules.

## Adding icons

Put SVG files under `src/lib/iconsets/<set-name>/`:

```text
src/lib/iconsets/
	phosphor/
		airplay.svg
		warning-diamond.svg
	remix/
		add-line.svg
```

Then run `pnpm generate`. The generator creates tree-shakable modules under `src/lib/<set-name>/` and a set barrel at `src/lib/<set-name>.ts`.

## Usage

```svelte
<script lang="ts">
  import { Icon } from 'svelte-icons';
  import phosphorAirplay from 'svelte-icons/phosphor/airplay';
</script>

<Icon icon={phosphorAirplay} size={24} title="AirPlay" />
```

Icons use `currentColor`, so they inherit the CSS `color` of the icon or any parent. Current sets include `phosphor`.
