---
title: SvelteKit Page Options
description: Configuring page rendering behavior in SvelteKit — prerender, ssr, csr, trailingSlash — plus project configuration, project types, and project structure.
knowledge-bank:
  - 10-sveltekit
tags:
  - sveltekit
  - page-options
  - rendering
  - configuration
  - prerendering
  - ssr
  - csr
sources:
  - svelteDocs-10-page-options
  - svelteDocs-60-configuration
  - svelteDocs-05-project-structure
  - svelteDocs-03-project-types
  - svelteDocs-02-creating-a-project
  - svelteDocs-01-introduction
  - svelteKitDocs-01-overview
  - svelteKitDocs-02-getting-started
  - svelteKitDocs-03-svelte-files
  - svelteKitDocs-04-svelte-js-files
  - svelteKitDocs-13-basic-markup
  - svelteKitDocs-39-faq
related:
  - SvelteKit-Routing
  - SvelteKit-Adapters-Deployment
  - SvelteKit-Environment-Modules
timestamp: 2026-06-21
source: Wiki repo
---

SvelteKit provides per-route rendering configuration through exported constants in `+page.js` / `+page.server.js` and `+layout.js` / `+layout.server.js`.

## Page Options

### prerender

When `true`, the page is rendered to static HTML at build time. Requires the static adapter or a hybrid adapter.

```js
export const prerender = true
```

### ssr

When `true` (default), the page is rendered on the server. Set to `false` for client-only rendering.

```js
export const ssr = false
```

### csr

When `true` (default), client-side JavaScript is loaded for the page. Set to `false` to produce static HTML without hydration.

```js
export const csr = false
```

### trailingSlash

Controls whether routes have trailing slashes: `'always'`, `'never'`, `'ignore'`.

```js
export const trailingSlash = 'always'
```

## Project Structure

```
my-project/
  src/
    lib/      — Shared components and utilities
    params/   — Route parameter matchers
    routes/   — Application routes
    app.html  — HTML template
    hooks.client.js / hooks.server.js
  static/     — Static assets
  svelte.config.js
```

## Project Types

SvelteKit supports multiple project types:

- **Web app (default):** Full SSR + CSR with all features
- **Single-page app (SPA):** Disable SSR, all rendering on client
- **Static site:** All pages prerendered at build time
- **Hybrid:** Mix of static, SSR, and SPA pages per route

## Configuration

`svelte.config.js` is the central configuration file:

```js
import adapter from '@sveltejs/adapter-node'

export default {
  kit: {
    adapter: adapter(),
    paths: { base: '/app' },
    files: { routes: 'src/routes' }
  }
}
```

## Getting Started

Create a new project:

```sh
npx sv create myapp
cd myapp
npm install
npm run dev
```

SvelteKit uses Vite under the hood with automatic HMR for development.

## See Also
- [SvelteKit Adapters and Deployment](SvelteKit-Adapters-Deployment) — selecting the right adapter for your rendering strategy
- [SvelteKit Routing](SvelteKit-Routing) — how routes work with different page options
- [SvelteKit Environment and Modules](SvelteKit-Environment-Modules) — environment variable configuration
