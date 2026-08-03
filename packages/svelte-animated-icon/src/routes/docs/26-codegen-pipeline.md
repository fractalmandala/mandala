---
title: Codegen Pipeline
id: 26
group: guides-and-advanced
description: "How generate.js turns SVG folders into per-icon components."
---

`scripts/generate.js` reads SVG folders and produces the per-icon `.svelte` components and barrel files that consumers import from. This page walks through what it does, line by line.

## What it produces

For each `SETS` entry, the script writes:

```
src/lib/<set>/
  icons/
    Acorn.svelte
    Airplane.svelte
    ...
  index.ts
```

- One `.svelte` component per icon, named by PascalCasing the stem from `nameFromFile`.
- One `index.ts` barrel that exports every icon under its component name.

## The `SETS` config

```js
const SETS = [
  {
    name: 'phosphor',
    variants: {
      regular: 'static/svg/phosphor-regular',
      light:   'static/svg/phosphor-light',
      fill:    'static/svg/phosphor-fill'
    },
    defaultVariant: 'regular',
    nameFromFile: (filename, variant) =>
      filename.replace('.svg', '').replace(`-${variant}`, ''),
    stripSuffix: { fill: '-fill', light: '' }
  },
  {
    name: 'remix',
    variants: {
      fill: 'static/svg/remixicons-fill',
      line: 'static/svg/remixicons-line'
    },
    defaultVariant: 'line',
    nameFromFile: (filename, variant) =>
      filename.replace('.svg', '').replace(`-${variant}`, ''),
    stripSuffix: {}
  },
  {
    name: 'flowbite',
    variants: {
      outline: 'static/svg/flowbite-outline',
      solid:   'static/svg/flowbite-solid'
    },
    defaultVariant: 'outline',
    nameFromFile: (filename) => filename.replace('.svg', ''),
    stripSuffix: {}
  },
  {
    name: 'hero',
    variants: {
      outline: 'static/svg/heroicons-outline',
      solid:   'static/svg/heroicons-solid'
    },
    defaultVariant: 'outline',
    nameFromFile: (filename) => filename.replace('.svg', ''),
    stripSuffix: {}
  },
  {
    name: 'ion',
    variants: {
      outline: 'static/svg/ionicons-outline',
      filled:  'static/svg/ionicons-filled'
    },
    defaultVariant: 'outline',
    nameFromFile: (filename, variant) =>
      filename.replace('.svg', '').replace(`-${variant}`, ''),
    stripSuffix: {}
  }
];
```

Each entry tells the script:

- What to call the resulting library (`name` → subpath and folder).
- Which folders contain the source SVGs (`variants`).
- What to default to (`defaultVariant`).
- How to derive the icon's name from its filename (`nameFromFile`).
- How to clean up variant suffixes (`stripSuffix`).

## The pipeline

### 1. Read & match

For each set, the script reads every SVG file from each variant directory. It uses `nameFromFile` to compute the icon's stem, then groups files by stem. An icon needs a file for *at least one* variant to be generated - it doesn't need to ship in all three.

### 2. Strip the wrapper

Each SVG comes out of the source folders looking roughly like:

```html
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="none"/>
  <path d="…" stroke="currentColor" …/>
</svg>
```

The script:

1. Removes the outer `<svg …>` and closing `</svg>`.
2. Removes the bounding `<rect width="…" height="…" fill="none"/>`.
3. Normalizes hardcoded colors (`stroke="black"`, `fill="black"`) to `currentColor`.
4. Wraps the remaining inner markup in `<g fill="…">` — using the SVG's own `fill` attribute if present, or `currentColor` if absent — so fill-type icons (Phosphor fill, Ion filled, etc.) whose paths have no `fill` attribute inherit the icon's color instead of rendering as SVG-default black.

The result is the `svg` string the component embeds. See [AnimatedIcon](/docs/14-animated-icon) for why inner-only is what the engine expects.

### 3. Write per-icon components

For each icon:

```svelte
<!-- src/lib/phosphor/icons/Acorn.svelte (auto-generated) -->
<script lang="ts">
  import AnimatedIcon from '../../core/AnimatedIcon.svelte';

  const VARIANTS: Record<string, string> = {
    regular: `<g fill="currentColor"><path d="…" fill="none" stroke="currentColor" …/></g>`,
    light:   `<g fill="currentColor"><path d="…" stroke-width="12"/></g>`,
    fill:    `<g fill="currentColor"><path d="…"/></g>`
  };

  interface Props {
    variant?: string;
    [key: string]: unknown;
  }

  let { variant = 'regular', ...rest }: Props = $props();
</script>

<AnimatedIcon svg={VARIANTS[variant]} {...rest} />
```

Each generated file:

- Embeds every variant as a raw string in a `VARIANTS: Record<string, string>` constant, wrapped in `<g fill="currentColor">` so all paths inherit the icon's color.
- Forwards everything else (`...rest`) to `AnimatedIcon`, so all the props documented in [Usage](/docs/04-usage) work without re-declaring them.

### 4. Write the barrel

```ts
// src/lib/phosphor/index.ts  (one per library)
export { default as Acorn } from './icons/Acorn.svelte';
export { default as Airplane } from './icons/Airplane.svelte';
// ... one line per icon in the library
```

The barrel is what consumers get when they `import { Gear } from 'svelte-animated-icon/phosphor'`. With named imports, bundlers only follow the lines they actually use. See [Tree Shaking](/docs/24-tree-shaking).

## Running it

```sh
node scripts/generate.js
```

There are no flags or arguments. The script is idempotent - re-running it overwrites the same files with no leftover state.

## When to regenerate

- After adding or removing SVGs in a variant folder.
- After upgrading the source icon set (Phosphor, Remix, etc.) to a new version.
- After adding a new library - see [Adding an Icon Library](/docs/25-adding-library).
- After changing anything in `SETS`.

Commit the generated files. Consumers install the published package and don't run this script themselves.

## Gotchas

- **Don't hand-edit generated files.** Your changes are wiped on the next run. Customize at the consumer side instead - see [Custom SVG Icons](/docs/21-guide-custom-svg).
- **`nameFromFile` must be deterministic.** Two different filenames producing the same component name will collide silently.
- **Empty folders.** A variant folder with no SVGs is silently skipped - make sure the path is right if you expect icons to appear.
- **Non-256 viewBoxes.** The script doesn't normalize viewBox; it preserves whatever the source SVG had. Icons with a different viewBox will render correctly but templates may scale oddly. Normalize upstream.