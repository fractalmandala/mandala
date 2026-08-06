---
title: SvelteKit Routing
description: Filesystem-based routing in SvelteKit — +page.svelte, +layout.svelte, +server.js, route parameters, optional/rest parameters, route groups, parameter matchers, advanced routing patterns, and link options.
knowledge-bank:
  - 10-sveltekit
tags:
  - sveltekit
  - routing
  - filesystem-routing
  - layouts
  - server-routes
sources:
  - svelteDocs-07-routing
  - svelteDocs-24-advanced-routing
  - svelteDocs-27-link-options
  - Advanced-SvelteKit-Routing-Patterns
  - Expert-SvelteKit-Routing
  - SvelteKit-Routing-Foundation
  - pluspage.svelte-in-SvelteKit
  - pluslayout.svelte-in-SvelteKit
  - plusserver.js-in-SvelteKit-Building
  - Navigation-in-SvelteKit-Anchor
  - SvelteKit-Prefetching-preloadData
  - svelteDocs-06-web-standards
related:
  - SvelteKit-Data-Loading
  - SvelteKit-Form-Actions
  - SvelteKit-Navigation
  - SvelteKit-Page-Options
timestamp: 2026-06-21
source: Wiki repo
---

SvelteKit uses a filesystem-based router. Routes are defined by the directory structure inside `src/routes/`, and each route folder contains route files identified by their `+` prefix.

## Route Files

- **`+page.svelte`** — A page component rendered at that route. Rendered on server (SSR) for initial request and client (CSR) for navigation.
- **`+page.js` / `+page.server.js`** — Load functions that provide data to the page.
- **`+layout.svelte`** — A layout component that wraps all child routes. Can be nested.
- **`+layout.js` / `+layout.server.js`** — Load functions for layout data.
- **`+server.js`** — API endpoint handling GET, POST, PUT, PATCH, DELETE requests.
- **`+error.svelte`** — Error page for the route and its children.

## Route Parameters

Dynamic segments are defined with `[param]` syntax:

```
src/routes/blog/[slug]/+page.svelte
```

Access parameters via `$page.params.slug` in the component, or through the load function's `params` argument.

### Optional Parameters

`[[param]]` makes a segment optional.

### Rest Parameters

`[...path]` captures all remaining segments.

## Route Groups

Parentheses `(group)` group routes without affecting the URL path:

```
src/routes/(marketing)/about/+page.svelte
src/routes/(app)/dashboard/+page.svelte
```

Useful for applying different layouts to different groups of routes.

## Parameter Matchers

Matchers validate and constrain route parameters:

```ts
// src/params/integer.ts
export const match = (value) => /^\d+$/.test(value)

// Usage: src/routes/blog/[id=integer]/+page.svelte
```

## Advanced Patterns

- **Shallow routing:** Update the URL without running load functions
- **Link options:** `data-sveltekit-preload-data`, `data-sveltekit-reload`, etc. for fine-grained navigation control
- **Prefetching:** Use `preloadData()` from `$app/navigation` to prefetch page data on hover
- **Anchor navigation:** Standard `<a>` elements work with SvelteKit's client-side router
- **Web standards:** SvelteKit routing builds on standard `Request`/`Response` objects

## See Also
- [SvelteKit Data Loading](SvelteKit-Data-Loading) — how page and layout data works
- [SvelteKit Navigation](SvelteKit-Navigation) — client-side navigation and preloading
- [SvelteKit Page Options](SvelteKit-Page-Options) — configuring route rendering behavior
- [SvelteKit Error Handling](SvelteKit-Error-Handling) — error pages and boundaries
