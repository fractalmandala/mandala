---
title: SvelteKit Error Handling
description: Error handling architecture in SvelteKit — expected errors, unexpected errors, error pages, error boundaries, redirects, and structured error patterns at route and application boundaries.
knowledge-bank:
  - 10-sveltekit
tags:
  - sveltekit
  - error-handling
  - error-boundaries
  - error-pages
  - redirects
sources:
  - svelteDocs-26-errors
  - Error-Handling-in-SvelteKit
  - Error-Handling-at-the-Boundary
  - Errors-and-Redirects-in-SvelteKit
related:
  - SvelteKit-Routing
  - SvelteKit-Form-Actions
  - SvelteKit-Hooks-Server
  - Svelte-Built-in-Components
timestamp: 2026-06-21
source: Wiki repo
---

SvelteKit provides a structured error handling system that distinguishes between expected errors (user-facing, like validation failures) and unexpected errors (bugs, infrastructure failures).

## Expected Errors

Use `error()` from `@sveltejs/kit` to throw expected errors:

```js
import { error } from '@sveltejs/kit'

export const load = async ({ params }) => {
  const post = await db.findPost(params.slug)
  if (!post) throw error(404, 'Post not found')
}
```

Expected errors are caught by the nearest `+error.svelte` and can include custom data.

## Unexpected Errors

Unexpected errors (uncaught exceptions) are caught by `handleError` in hooks and the nearest `+error.svelte`. They should be logged on the server and a generic message shown to the user.

## Error Pages

### +error.svelte

Create per-route or app-level error pages:

```svelte
<script>
  import { page } from '$app/stores'
</script>

<h1>{$page.status}: {$page.error?.message}</h1>
<p>Something went wrong.</p>
<a href="/">Go home</a>
```

### Default Error Page

SvelteKit provides a default error page if no `+error.svelte` exists. Override it at the root layout level.

## Error Boundaries

Use `<svelte:boundary>` for component-level error isolation:

```svelte
<svelte:boundary onerror={(error, reset) => reset()}>
  <Widget />
</svelte:boundary>
```

This prevents a single component's failure from crashing the entire page. The `onerror` callback provides the error and a `reset` function.

## Redirects

Use `redirect()` from `@sveltejs/kit` to redirect during load functions and actions:

```js
import { redirect } from '@sveltejs/kit'

export const load = async () => {
  throw redirect(302, '/login')
}
```

Common status codes:
- `302` — temporary redirect
- `303` — see other (after form submission)
- `307` — temporary redirect (preserves method)
- `308` — permanent redirect

## Error Handling Layers

| Layer | Purpose |
|---|---|
| `<svelte:boundary>` | Component-level error isolation |
| `+error.svelte` | Route-level error display |
| `hooks.handleError` | Global error logging and sanitization |
| Fallback error page | Catch-all for unhandled route errors |

## See Also
- [SvelteKit Hooks and Server Runtime](SvelteKit-Hooks-Server) — `handleError` for global error handling
- [SvelteKit Form Actions](SvelteKit-Form-Actions) — error handling in form submissions
- [Svelte Built-in Components](Svelte-Built-in-Components) — `<svelte:boundary>` for component-level errors
- [CALM Systems Philosophy](CALM-Systems-Philosophy) — error handling at boundaries principle
