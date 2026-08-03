# svelte-icons

A Svelte 5 icon package generated from SVG folders.

## Add Icons

Put SVG files in `src/lib/iconsets/<set-name>/`.

```text
src/lib/iconsets/
	phosphor/
		airplay.svg
		warning-diamond.svg
	remix/
		add-line.svg
```

Then run:

```sh
pnpm generate
```

The generator creates tree-shakable modules under `src/lib/<set-name>/` and a set barrel at `src/lib/<set-name>.ts`.

## Use

```svelte
<script lang="ts">
	import { Icon } from 'svelte-icons';
	import phosphorAirplay from 'svelte-icons/phosphor/airplay';
</script>

<Icon icon={phosphorAirplay} size={24} title="AirPlay" />
```

Icons use `currentColor`, so they inherit from the CSS `color` of the icon itself or any parent.

Use an icon directly:

```svelte
<script lang="ts">
	import { Icon } from 'svelte-icons';
	import phosphorHouse from 'svelte-icons/phosphor/house';
</script>

<Icon icon={phosphorHouse} />
```

Use an icon inside a button and change the icon color from the button hover state:

```svelte
<button class="tool-button" aria-label="Open">
	<Icon icon={phosphorHouse} size={20} />
</button>

<style>
	.tool-button {
		color: #52525b;
	}

	.tool-button:hover {
		color: #0f766e;
	}
</style>
```

Use different sizes:

```svelte
<Icon icon={phosphorHouse} size={16} />
<Icon icon={phosphorHouse} size="2rem" />
```

Apply hover behavior to the icon itself:

```svelte
<Icon class="hover-icon" icon={phosphorHouse} size={24} />

<style>
	.hover-icon {
		opacity: 0;
		transition: opacity 140ms ease;
	}

	.hover-icon:hover {
		opacity: 1;
	}
</style>
```

You can also import named icons from a set barrel:

```svelte
<script lang="ts">
	import { Icon } from 'svelte-icons';
	import { phosphorWarningDiamond } from 'svelte-icons/phosphor';
</script>

<Icon icon={phosphorWarningDiamond} />
```

The per-icon subpath form imports exactly one icon module:

```ts
import phosphorAirplay from 'svelte-icons/phosphor/airplay';
```

## Publish

```sh
pnpm check
pnpm prepack
npm publish
```

When you add another folder inside `src/lib/iconsets`, rerun `pnpm generate`, bump the package version, and publish again. The wildcard exports already expose new sets as `svelte-icons/<set>` and `svelte-icons/<set>/<icon>`.
