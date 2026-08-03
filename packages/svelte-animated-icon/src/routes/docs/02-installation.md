---
title: Installation
id: 2
group: getting started
description: "Install with npm/pnpm, the Svelte 5 peer dependency, and the subpath import paths."
---

Install [svelte-animated-icon](https://www.npmjs.com/package/svelte-animated-icon) with your package manager of choice. The library has **one peer dependency**: Svelte 5.


```bash
npm install svelte-animated-icon
```

```bash
pnpm add svelte-animated-icon
```

```bash
yarn add svelte-animated-icon
```

## Requirements

- **Svelte `^5.0.0`** - the library uses `$props()`, `$state`, `$derived`, and `$effect`. It will not work on Svelte 3 or 4.
- **A modern browser** - animations run on the Web Animations API, which is supported in every evergreen browser.

There are no other runtime dependencies.

## Importing

The package exposes six subpaths:

| Subpath | What it contains |
|---|---|
| `svelte-animated-icon` | The shared `AnimatedIcon` component, templates, types, and `clearProps` |
| `svelte-animated-icon/phosphor` | ~1,500 Phosphor icons (`regular`, `light`, `fill`) |
| `svelte-animated-icon/remix` | 1,441 Remix icons (`line`, `fill`) |
| `svelte-animated-icon/flowbite` | 444 Flowbite icons (`outline`, `solid`) |
| `svelte-animated-icon/hero` | 515 Hero icons (`outline`, `solid`) |
| `svelte-animated-icon/ion` | 324 Ionicons (`outline`, `filled`) |

```ts
// Core engine + types
import { AnimatedIcon, TEMPLATES, getTemplate } from 'svelte-animated-icon';

// Per-icon components — pick the library you need
import { Gear, Heart, ArrowRight } from 'svelte-animated-icon/phosphor';
import { Home } from 'svelte-animated-icon/remix';
```

> **Why subpaths?** Each library is independent — importing from `/phosphor` never pulls in Remix, Flowbite, or any other set. Tree-shaking then eliminates the individual Phosphor icons you didn't import. See [Tree Shaking](/docs/24-tree-shaking) for the full mechanism.

## Verifying the install

Drop this into any `.svelte` file and hover the icon:

```svelte
<script>
  import { Gear } from 'svelte-animated-icon/phosphor';
</script>

<Gear template="spin" />
```

If the gear spins on hover, you're set. If not, head to [Troubleshooting](/docs/29-troubleshooting).

## Next

- **[Quick Start](/docs/03-quick-start)** - your first animated icon in under a minute.
- **[Usage](/docs/04-usage)** - the two ways to consume the library.