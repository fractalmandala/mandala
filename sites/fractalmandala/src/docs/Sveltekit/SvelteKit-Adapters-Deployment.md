---
title: SvelteKit Adapters and Deployment
description: Deployment adapters for SvelteKit — adapter-auto, adapter-node, adapter-static, adapter-vercel, adapter-netlify, adapter-cloudflare, adapter-cloudflare-workers, writing custom adapters, and SPA mode.
knowledge-bank:
  - 10-sveltekit
tags:
  - sveltekit
  - adapters
  - deployment
  - hosting
  - ssr
  - static-site
  - serverless
sources:
  - svelteDocs-14-adapters
  - svelteDocs-15-adapter-auto
  - svelteDocs-16-adapter-node
  - svelteDocs-17-adapter-static
  - svelteDocs-18-single-page-apps
  - svelteDocs-19-adapter-cloudflare
  - svelteDocs-20-adapter-cloudflare-workers
  - svelteDocs-21-adapter-netlify
  - svelteDocs-22-adapter-vercel
  - svelteDocs-23-writing-adapters
  - svelteKitDocs-47-hydratable
related:
  - SvelteKit-Page-Options
  - SvelteKit-Routing
  - SvelteKit-Environment-Modules
timestamp: 2026-06-21
source: Wiki repo
---

Adapters transform a built SvelteKit app into output suitable for a specific deployment platform. They are configured in `svelte.config.js`.

## Official Adapters

### adapter-auto

Auto-detects the deployment platform and selects the appropriate adapter. Supports Vercel, Netlify, Cloudflare Pages, and Azure Static Web Apps.

### adapter-node

Runs the app as a standalone Node.js server:

```js
import adapter from '@sveltejs/adapter-node'
export default { kit: { adapter: adapter() } }
```

Output can be run with `node build/index.js`. Supports middleware mode for embedding in existing Node servers.

### adapter-static

Generates static HTML files for all prerendered pages. Best for sites that don't need SSR:

```js
import adapter from '@sveltejs/adapter-static'
export default { kit: { adapter: adapter() } }
```

Pages must be prerenderable or must have `ssr=false` with a fallback page for SPA mode.

### adapter-vercel

Deploys to Vercel with serverless functions, edge functions, and ISR support. Leverages Vercel-specific features like image optimization.

### adapter-netlify

Deploys to Netlify with serverless functions and edge functions. Supports Netlify Forms and Netlify Functions.

### adapter-cloudflare

Deploys to Cloudflare Pages with Pages Functions for SSR. Optimized for the Cloudflare Workers runtime.

### adapter-cloudflare-workers

Deploys directly to Cloudflare Workers. More low-level than the Pages adapter.

## SPA Mode

Set `ssr: false` at the root layout and use `adapter-static` with a fallback page for fully client-side rendered apps.

## Writing Custom Adapters

Adapters are objects conforming to the `Adapter` type:

```ts
interface Adapter {
  name: string
  adapt: (builder: Builder) => Promise<void>
}
```

The `Builder` API provides access to build output, routes, and prerendered pages.

## See Also
- [SvelteKit Page Options](SvelteKit-Page-Options) — prerender, ssr, csr configuration per route
- [SvelteKit Routing](SvelteKit-Routing) — how routes affect adapter output
- [SvelteKit Environment and Modules](SvelteKit-Environment-Modules) — environment variables for deployment configuration
