---
title: SvelteKit Environment and Modules
description: SvelteKit environment variable modules ($env/static/private, $env/static/public, $env/dynamic/private, $env/dynamic/public), the $lib alias, $service-worker module, and server-only module restrictions.
knowledge-bank:
  - 10-sveltekit
tags:
  - sveltekit
  - environment-variables
  - modules
  - env
  - server-only
sources:
  - svelteDocs-51-$app-environment
  - svelteDocs-55-$app-server
  - svelteDocs-59-$env-dynamic-private
  - svelteDocs-60-$env-dynamic-public
  - svelteDocs-61-$env-static-private
  - svelteDocs-62-$env-static-public
  - svelteDocs-63-$lib
  - svelteDocs-64-$service-worker
  - svelteDocs-28-service-workers
  - svelteDocs-29-server-only-modules
  - svelteDocs-30-snapshots
  - svelteDocs-52-$app-forms
  - svelteDocs-61-cli
  - svelteDocs-62-types
related:
  - SvelteKit-Data-Loading
  - SvelteKit-Hooks-Server
  - SvelteKit-Adapters-Deployment
  - SvelteKit-TypeScript
timestamp: 2026-06-21
source: Wiki repo
---

SvelteKit provides strict module boundaries for environment variables and app-specific imports, preventing accidental exposure of secrets to the client.

## Environment Variable Modules

### $env/static/private

Build-time private environment variables. Only importable in server modules. Throws if accessed on the client.

```js
import { API_KEY } from '$env/static/private'
```

Variables are inlined at build time. Changes require a rebuild.

### $env/static/public

Build-time public environment variables. Must be prefixed with `PUBLIC_`. Importable anywhere.

```js
import { PUBLIC_API_URL } from '$env/static/public'
```

### $env/dynamic/private

Runtime private environment variables. Only importable in server modules. Values are resolved at runtime.

```js
import { env } from '$env/dynamic/private'
```

### $env/dynamic/public

Runtime public environment variables. Must be prefixed with `PUBLIC_`. Importable anywhere.

```js
import { env } from '$env/dynamic/public'
```

## The $lib Alias

The `$lib` alias maps to `src/lib/` for clean imports:

```js
import { Button } from '$lib/components/Button.svelte'
import { db } from '$lib/server/db'
```

Files in `src/lib/server/` are server-only and cannot be imported into client code.

## Server-Only Modules

Files in `src/lib/server/` and `$env/static/private` / `$env/dynamic/private` are restricted to server-side usage. Importing them in client code produces a build error.

## $app Modules

- **`$app/environment`** — Runtime build info (`version`, `build`, `dev`, `prerendering`)
- **`$app/server`** — Server-only utilities (`ReadOnlyFormData`)
- **`$app/paths`** — App path configuration (`base`, `assets`)
- **`$app/state`** — Reactive page state in Svelte 5 (`getStores`, `page`)
- **`$app/stores`** — Svelte 4 store-based page API (`page`, `navigating`, `updated`)
- **`$app/forms`** — Form enhancement utilities (`enhance`, `applyAction`)
- **`$app/navigation`** — Navigation utilities (`goto`, `preloadData`, `invalidate`, `invalidateAll`, `pushState`, `replaceState`)
- **`$app/types`** — TypeScript types for SvelteKit stores

See [SvelteKit Navigation](SvelteKit-Navigation) and [SvelteKit Form Actions](SvelteKit-Form-Actions) for details on specific modules.

## $service-worker Module

Available in service worker files (`src/service-worker.js`):

```js
import { build, files, version } from '$service-worker'
```

Provides the build output, static files, and app version for caching strategies.

## See Also
- [SvelteKit Data Loading](SvelteKit-Data-Loading) — where environment variables are used
- [SvelteKit Hooks and Server Runtime](SvelteKit-Hooks-Server) — where private env vars are accessed
- [SvelteKit TypeScript](SvelteKit-TypeScript) — typing App.Platform for platform-specific env
