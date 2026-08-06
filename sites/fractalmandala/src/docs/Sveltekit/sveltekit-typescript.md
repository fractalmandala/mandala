---
title: SvelteKit TypeScript
description: TypeScript integration in SvelteKit — $types for typed load functions, app.d.ts declarations (App.Locals, App.PageData, App.PageState, App.Platform, App.Error), and type-safe patterns across routing boundaries.
knowledge-bank:
  - 10-sveltekit
tags:
  - sveltekit
  - typescript
  - type-safety
  - types
sources:
  - svelteDocs-62-types
  - SvelteKit-TypeScript-$types-The
  - Type-Safety-in-SvelteKit
  - SvelteKit-app.d.ts-The-Complete
  - svelteKitDocs-50-typescript
  - svelteDocs-58-$app-types
related:
  - SvelteKit-Hooks-Server
  - SvelteKit-Data-Loading
  - SvelteKit-Authentication
  - Svelte-5-Runes
timestamp: 2026-06-21
source: Wiki repo
---

SvelteKit provides automatic type generation for load functions, ensuring data flows are type-safe across the server-client boundary.

## Generated $types

When you create `+page.svelte` and `+page.ts` in the same route, SvelteKit generates a `$types.d.ts` file with typed interfaces:

```ts
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ params, fetch }) => {
  return { post: await fetchPost(params.slug) }
}
```

Key types:
- `PageLoad` / `LayoutLoad` — for universal load functions
- `PageServerLoad` / `LayoutServerLoad` — for server-only load functions
- `PageData` / `LayoutData` — returned data shape
- `Actions` / `RequestHandler` — for form actions and API routes

## app.d.ts Declarations

The `src/app.d.ts` file is the central type declaration for SvelteKit's application interface:

```ts
declare global {
  namespace App {
    interface Locals {
      user: User | null
    }
    interface PageData {
      title: string
    }
    interface PageState {
      modal: boolean
    }
    interface Platform {
      env: Env
      context: ExecutionContext
    }
    interface Error {
      code: number
      message: string
    }
  }
}

export {}
```

- **`App.Locals`** — Type for `event.locals` in hooks and load functions
- **`App.PageData`** — Type for `$page.data` across all routes
- **`App.PageState`** — Type for custom page state (shallow routing)
- **`App.Platform`** — Type for platform-specific data (Cloudflare, etc.)
- **`App.Error`** — Type for error objects passed to `+error.svelte`

## $app Types Module

The `$app/types` module provides utility types for working with SvelteKit's stores and navigation:

```ts
import type { Page } from '$app/types'
```

## Best Practices

- Always type `App.Locals` in `app.d.ts` for auth data
- Use generated `$types` for load function signatures
- Type form action return values for safe form handling
- Use the `satisfies` keyword with `PageLoad` for inline validation
- Keep `app.d.ts` minimal — only app-wide interfaces

## See Also
- [SvelteKit Data Loading](SvelteKit-Data-Loading) — typed load functions
- [SvelteKit Hooks and Server Runtime](SvelteKit-Hooks-Server) — typing locals
- [SvelteKit Authentication](SvelteKit-Authentication) — typed auth data
- [Svelte 5 Runes](Svelte-5-Runes) — TypeScript with runes ($state, $derived)
