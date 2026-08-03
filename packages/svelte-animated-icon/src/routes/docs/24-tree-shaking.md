---
title: Tree Shaking, Subpaths
id: 24
group: guides-and-advanced
description: "How named imports + the exports map keep bundles tiny."
---

`svelte-animated-icon` is built to be invisible to your bundle size. Two mechanisms do the work: **named imports** (per-icon) and **subpath exports** (per-library). Together they let you ship exactly the icons you use and none you don't.

## Per-icon tree shaking

Every icon is its own `.svelte` file. There is no barrel that re-exports all 4,000+ of them - each lives in `src/lib/phosphor/icons/Gear.svelte` (and similar), and each contains only the SVG markup for its variants.

When you write:

```ts
import { Gear } from 'svelte-animated-icon/phosphor';
```

the bundler follows that import to the file behind it. The other 1,499 components never enter the dependency graph, so they never enter the bundle. `Heart`, `ArrowRight`, and friends are completely tree-shaken out.

This works because:

- The package `exports` map points at `dist/`, where `svelte-package` has placed each icon as its own file.
- Each component imports only `AnimatedIcon` and the templates - the smallest possible surface.
- There's no shared `index.ts` that re-exports everything (the `/phosphor` barrel exports them by name, but bundlers only pull the names you actually import).

## Subpath exports

Larger boundary. The package has six entry points today:

```json
{
  "exports": {
    ".":          { "types": "./dist/index.d.ts",          "svelte": "./dist/index.js" },
    "./phosphor": { "types": "./dist/phosphor/index.d.ts", "svelte": "./dist/phosphor/index.js" },
    "./remix":    { "types": "./dist/remix/index.d.ts",    "svelte": "./dist/remix/index.js" },
    "./flowbite": { "types": "./dist/flowbite/index.d.ts", "svelte": "./dist/flowbite/index.js" },
    "./hero":     { "types": "./dist/hero/index.d.ts",     "svelte": "./dist/hero/index.js" },
    "./ion":      { "types": "./dist/ion/index.d.ts",      "svelte": "./dist/ion/index.js" }
  }
}
```

Importing from `svelte-animated-icon` brings in the core (engine + templates + types). Importing from a subpath (e.g. `svelte-animated-icon/phosphor`) brings in the core *plus* that library's barrel. Crucially, other library entry points (like `/remix` or `/flowbite`) are never imported, so their components stay out of the bundle entirely.

```ts
// ✗ Imports core + Phosphor barrel - Remix is excluded.
import { Gear } from 'svelte-animated-icon/phosphor';

// ✗ Imports core + Remix barrel - Phosphor is excluded.
import { Gear } from 'svelte-animated-icon/remix';

// ✓ Core only - no icons at all.
import { AnimatedIcon, TEMPLATES } from 'svelte-animated-icon';
```

## What the docs site does differently

The home route (`/`) imports the whole Phosphor barrel on purpose - it shows every icon in a single searchable grid. That page is **not** tree-shakeable. Don't pattern-match against it when measuring your own bundle; the home page is a showcase, not a consumer.

If you ever need that "show every icon" behavior in your app, expect to pay for it.

## How to verify

Run a build of your app with your normal bundler (Vite, Rollup, Webpack, esbuild) and inspect the output for icon names. Only the icons you imported should appear. A quick test:

```ts
// app.ts
import { Gear, Heart } from 'svelte-animated-icon/phosphor';
console.log(Gear, Heart);
```

Build, then grep the output for `ArrowRight` or any icon you didn't import - it shouldn't be there.

## Why this matters

Most icon libraries ship as one big module: you `import { Gear } from 'icon-library'` and the bundler has to be clever to eliminate the other 999 components. Some succeed; many don't, and the user pays for it.

By making every icon its own file and exposing libraries via separate subpaths, `svelte-animated-icon` removes the cleverness requirement. The bundler's normal behavior - "follow the import, only include what you reach" - produces the smallest output automatically.

## A note on `sideEffects`

`package.json` declares:

```json
"sideEffects": ["**/*.css"]
```

No JS file is marked as having side effects, so bundlers are free to drop unused exports. CSS is preserved because global stylesheets have implicit side effects. If you ship your own CSS imports through this package, add them to this list.