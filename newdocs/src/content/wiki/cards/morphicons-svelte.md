---
title: morphicons-svelte
description: Svelte 5 bindings for morphicons — SSR-safe initial paths with a browser-owned morph driver for interruptible icon transitions.
tags: [package, svelte, icons, animation, morph]
type: card
module: packages/morphicons-svelte
path: packages/morphicons-svelte
created: 2026-08-06
updated: 2026-08-06
---

Svelte 5 bindings for [`morphicons`](https://www.npmjs.com/package/morphicons), with SSR-safe initial paths and a browser-owned morph driver after mount. Icons are data (Lucide-style `IconNode` values), so any normalized icon source works with the same adapter.

## Usage

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

Controlled morphs via `from`, `to`, and `progress`:

```svelte
<MorphIcon from={Menu} to={X} progress={0.5} strokeWidth={1.5} />
```

## How it works

- During SSR the adapter renders the initial path.
- Once mounted, `morphicons/dom` owns the path attribute, so transitions can be interrupted and retargeted without restarting.
- Install with `pnpm add morphicons-svelte`; works from SvelteKit routes, components, or plain Svelte 5 apps.
