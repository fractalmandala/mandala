---
title: SvelteKit Navigation
description: Client-side navigation in SvelteKit — anchor navigation, programmatic navigation, preloading, link options, shallow routing, and the $app/navigation and $app/stores modules.
knowledge-bank:
  - 10-sveltekit
tags:
  - sveltekit
  - navigation
  - client-side-routing
  - preloading
  - shallow-routing
  - link-options
sources:
  - svelteDocs-27-link-options
  - svelteDocs-31-shallow-routing
  - Navigation-in-SvelteKit-Anchor
  - SvelteKit-Prefetching-preloadData,
  - svelteDocs-53-$app-navigation
  - svelteDocs-54-$app-paths
  - svelteDocs-56-$app-state
  - svelteDocs-57-$app-stores
related:
  - SvelteKit-Routing
  - SvelteKit-Data-Loading
  - SvelteKit-Page-Options
timestamp: 2026-06-21
source: Wiki repo
---

SvelteKit provides a seamless client-side navigation system that works with standard `<a>` elements while offering programmatic control and performance optimization.

## Standard Navigation

### Anchor Elements

Standard `<a href="/about">` elements work automatically with SvelteKit's client-side router. The router intercepts clicks and performs client-side navigation without full page reloads.

```svelte
<a href="/blog">Blog</a>
<a href="/blog/hello-world">Post</a>
```

### Programmatic Navigation

Use `goto()` from `$app/navigation`:

```svelte
<script>
  import { goto } from '$app/navigation'
</script>
<button onclick={() => goto('/dashboard')}>Dashboard</button>
```

## Preloading

SvelteKit preloads linked pages on hover by default, fetching data before the user clicks. This provides instant navigation.

```html
<a href="/blog" data-sveltekit-preload-data="hover">Blog</a>
```

Preload options: `"hover"`, `"tap"`, `"off"`, `"viewport"` (when element enters viewport).

Use `preloadData(url)` from `$app/navigation` for programmatic preloading.

## Link Options

Data attributes on anchor elements control navigation behavior:

- `data-sveltekit-preload-data` — Controls data preloading
- `data-sveltekit-reload` — Forces a full page reload
- `data-sveltekit-replacestate` — Replaces current history entry
- `data-sveltekit-keepfocus` — Keeps focus after navigation
- `data-sveltekit-noscroll` — Prevents scroll reset

## Shallow Routing

Update the URL without running load functions using `pushState` and `replaceState`:

```js
import { pushState } from '$app/navigation'
pushState('/page?filter=active', {})
```

The `$page.state` store provides access to custom state passed during programmatic navigation.

## Navigation Stores

- **`$page.url`** — Current URL (reactive)
- **`$page.params`** — Current route parameters
- **`$page.data`** — Combined data from all matching load functions
- **`$page.state`** — Custom state from shallow routing
- **`$page.status`** — HTTP status code
- **`$page.error`** — Current error (if any)

## Navigation Lifecycle

- `beforeNavigate` callback — runs before navigation
- `afterNavigate` callback — runs after navigation
- `onNavigate` callback — runs for client-side navigation

## See Also
- [SvelteKit Routing](SvelteKit-Routing) — how routes are defined and matched
- [SvelteKit Data Loading](SvelteKit-Data-Loading) — how navigation triggers data loading
- [SvelteKit Page Options](SvelteKit-Page-Options) — configuration for routing and navigation behavior
