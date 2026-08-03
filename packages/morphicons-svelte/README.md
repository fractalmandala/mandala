# morphicons-svelte

Svelte 5 bindings for [`morphicons`](https://www.npmjs.com/package/morphicons), with
SSR-safe initial paths and a browser-owned morph driver after mount.

## Install

```sh
pnpm add morphicons-svelte
```

The package supports Svelte 5 and can be used from SvelteKit routes, components,
or other Svelte applications.

## Basic usage

Icons are data, not framework-specific components. Lucide's `IconNode` values,
normalized stroke paths, and the built-in examples all work with the same adapter.

```svelte
<script lang="ts">
  import { MorphIcon } from "morphicons-svelte";
  import { Menu, X } from "lucide";

  let open = $state(false);
</script>

<button onclick={() => (open = !open)} aria-expanded={open}>
  <MorphIcon icon={open ? X : Menu} label={open ? "Close" : "Menu"} />
</button>
```

`MorphIcon` also accepts `from`, `to`, and `progress` for a controlled morph:

```svelte
<MorphIcon from={Menu} to={X} progress={0.5} strokeWidth={1.5} />
```

The adapter renders the initial path during SSR. Once mounted, `morphicons/dom`
owns the path attribute, so transitions can be interrupted and retargeted without
hydration-time DOM replacement. The `spring` prop accepts the core presets
(`smooth`, `snappy`, and `bouncy`) or a `MorphOptions` object.

## Included examples

The package exports two small ready-to-use pairs:

```ts
import { MenuCloseIcon, PlayPauseIcon } from "morphicons-svelte";
```

The SvelteKit demo route in this repository is intentionally kept outside `src/lib`.
It includes a searchable Lucide grid, Heroicons and Tabler examples, stroke-width
controls, spring controls, scrubbing, a code sample, and the any-stroke-set note.
Only `src/lib` is packaged for consumers.

## Development

```sh
pnpm install
pnpm check
pnpm test
pnpm build
pnpm dev
```

The package is MIT licensed. The demo icon data retains the licenses of its
upstream icon families.
