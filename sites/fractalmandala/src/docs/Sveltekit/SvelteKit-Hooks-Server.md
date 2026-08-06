---
title: SvelteKit Hooks and Server Runtime
description: Server runtime hooks in SvelteKit — hooks.server.js and hooks.client.js, the handle function, handleFetch, handleError, locals, and server-side middleware patterns.
knowledge-bank:
  - 10-sveltekit
tags:
  - sveltekit
  - hooks
  - middleware
  - server-runtime
  - locals
  - handle
sources:
  - svelteDocs-25-hooks
  - SvelteKit-hooks.server.ts-locals,
  - svelteKitDocs-45-lifecycle-hooks
  - svelteKitDocs-46-imperative-component-api
  - svelteKitDocs-47-hydratable
  - svelteKitDocs-48-best-practices
related:
  - SvelteKit-Data-Loading
  - SvelteKit-Authentication
  - SvelteKit-Error-Handling
  - SvelteKit-Environment-Modules
timestamp: 2026-06-21
source: Wiki repo
---

Hooks are functions that run at the application lifecycle level in SvelteKit, providing middleware-like functionality.

## hooks.server.js

Runs on the server for every request. The primary hooks are:

### handle

Wraps every request. Receives the `event` object and a `resolve` function. Can modify the request, add to locals, or short-circuit the response.

```js
// hooks.server.js
export async function handle({ event, resolve }) {
  event.locals.user = await getUserFromSession(event.cookies)
  return await resolve(event)
}
```

### handleFetch

Intercepts all `fetch` calls made in load functions and actions. Useful for adding auth headers or modifying request URLs.

```js
export async function handleFetch({ event, request, fetch }) {
  request.headers.set('Authorization', `Bearer ${event.locals.token}`)
  return fetch(request)
}
```

### handleError

Catches unhandled errors during rendering or data loading. Log errors and return a sanitized error object.

```js
export function handleError({ error, event }) {
  console.error('Server error:', error)
  return { message: 'An unexpected error occurred' }
}
```

## hooks.client.js

Runs on the client for navigation events:

```js
// hooks.client.js
export function handleError({ error, event }) {
  console.error('Client error:', error)
}
```

## The `locals` Object

`event.locals` is populated in `handle` and available in all subsequent load functions and actions. It's the standard place for authentication data, database connections, and request-scoped state.

```ts
// app.d.ts (typing locals)
declare global {
  namespace App {
    interface Locals {
      user: { id: string; name: string } | null
    }
  }
}
```

## Lifecycle Hooks

Beyond the server hooks, Svelte 5 provides component lifecycle functions: `onMount`, `onDestroy`, `beforeUpdate`, `afterUpdate`, and `tick`. These run in both server and client components.

## Best Practices

- Load user/session data in `handle` rather than in every load function
- Use `handleFetch` for consistent fetch configuration
- Keep hooks thin — delegate to separate modules
- Type `App.Locals` in `app.d.ts` for full type safety
- Avoid heavy computation in hooks (it runs on every request)

## See Also
- [SvelteKit Authentication](SvelteKit-Authentication) — common auth patterns that use hooks
- [SvelteKit Data Loading](SvelteKit-Data-Loading) — where locals are consumed
- [SvelteKit Error Handling](SvelteKit-Error-Handling) — error handling across hooks and routes
- [SvelteKit TypeScript](SvelteKit-TypeScript) — typing App.Locals and other app boundaries
