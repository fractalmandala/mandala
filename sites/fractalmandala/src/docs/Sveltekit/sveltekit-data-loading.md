---
title: SvelteKit Data Loading
description: Comprehensive guide to SvelteKit load functions — universal vs server load, page vs layout data, using parent, parallel loading, fetch, streaming, cookies and headers, URL data, invalidation, and re-running load functions.
knowledge-bank:
  - 10-sveltekit
tags:
  - sveltekit
  - data-loading
  - load-functions
  - server-side-rendering
  - streaming
sources:
  - svelteDocs-08-load
  - Introduction-to-SvelteKit-Load
  - SvelteKit-Universal-vs-Server-Load
  - SvelteKit-Page-Data-vs-Layout-Data
  - pluspage.js-in-SvelteKit-Universal
  - pluspage.server.js-in-SvelteKit
  - pluslayout.js-in-SvelteKit-Universal
  - pluslayout.server.js-in-SvelteKit
  - The-SvelteKit-page-Object-A
  - Fetch-in-SvelteKit-Load-Functions
  - Cookies-and-Headers-in-SvelteKit
  - Using-URL-Data-in-SvelteKit-Load
  - Using-parent-in-SvelteKit-Load
  - Parallel-Loading-and-Avoiding
  - Rerunning-Load-Functions-and
  - Streaming-Data-with-Promises-in
  - SvelteKit-Data-Loading-Capstone-A
  - SvelteKit-Data-Loading-Capstone-A (1)
  - Load-Functions-Are-Pure-Calm
  - When-to-Refresh-Data-Calm-Systems
related:
  - SvelteKit-Routing
  - SvelteKit-Form-Actions
  - SvelteKit-Hooks-Server
  - SvelteKit-Navigation
  - SvelteKit-Page-Options
timestamp: 2026-06-21
source: Wiki repo
---

SvelteKit load functions are the primary mechanism for fetching data before rendering a page or layout. They run on the server (and optionally on the client for client-side navigation).

## Load Function Types

### Universal Load (`+page.js` / `+layout.js`)

Runs on both server and client. Can access browser APIs but cannot use server-only modules.

```js
export const load = async ({ params, fetch, url }) => {
  const res = await fetch(`/api/posts/${params.slug}`)
  const post = await res.json()
  return { post }
}
```

### Server Load (`+page.server.js` / `+layout.server.js`)

Runs only on the server. Can access cookies, headers, server-only modules, and databases directly.

```js
export const load = async ({ cookies, locals, params }) => {
  const user = await db.findUser(locals.userId)
  return { user }
}
```

## Page vs Layout Data

- **Page data** is specific to one route. Defined in `+page.js`.
- **Layout data** is shared across all child routes. Defined in `+layout.js`. Child pages and layouts can access parent layout data via `await parent()`.

## Key Concepts

### The Page Object

The `$page` store (from `$app/stores`) provides reactive access to the current page's data, params, url, and route info in components.

### Fetch in Load Functions

SvelteKit provides a server-side `fetch` that works the same as the browser API. It respects cookies and can fetch from internal API routes. External fetch is also supported, including credential forwarding.

### Cookies and Headers

Server load functions have access to `cookies` (with `get`, `set`, `delete`) and `request.headers`. Changes to cookies in load functions are reflected in the response.

### URL Data

Load functions provide `url` with search params, allowing data loading to depend on query string values.

### Using `parent()`

Call `await parent()` to access data from parent layouts, enabling composition of data dependencies.

## Advanced Patterns

### Parallel Loading

Multiple `load` functions at the same level run in parallel. Use the `await parent()` pattern carefully to avoid unnecessary serialization.

### Re-running Load Functions

Load functions re-run when:
- The URL changes (params, URL search params)
- The page is accessed via a direct navigation
- `invalidate(url)` or `invalidateAll()` is called
- Server load functions re-run on every server request by default

### Streaming

Return promises from load functions to enable streaming — the page renders immediately with fallback content while the promise resolves.

```js
export const load = async () => {
  return {
    streamedData: new Promise(async (resolve) => {
      const data = await fetchSlowApi()
      resolve(data)
    })
  }
}
```

### Avoiding Waterfalls

Be mindful of the data loading waterfall pattern. Load independent data in parallel, and only await parent data when truly needed.

## See Also
- [SvelteKit Routing](SvelteKit-Routing) — how routes determine which load functions run
- [SvelteKit Navigation](SvelteKit-Navigation) — how client-side navigation triggers re-running loads
- [SvelteKit Form Actions](SvelteKit-Form-Actions) — how form actions interact with load data
- [SvelteKit Hooks and Server Runtime](SvelteKit-Hooks-Server) — hooks that run before load functions
