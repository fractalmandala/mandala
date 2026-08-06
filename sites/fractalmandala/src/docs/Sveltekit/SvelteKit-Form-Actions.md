---
title: SvelteKit Form Actions
description: Handling forms in SvelteKit — the actions API, progressive enhancement with use:enhance, validation, error handling, redirects, and multipart form data.
knowledge-bank:
  - 10-sveltekit
tags:
  - sveltekit
  - forms
  - form-actions
  - progressive-enhancement
  - validation
sources:
  - svelteDocs-09-form-actions
  - Forms-and-Progressive-Enhancement
  - Errors-and-Redirects-in-SvelteKit
  - Error-Handling-in-SvelteKit
  - pluspage.server.js-in-SvelteKit
related:
  - SvelteKit-Data-Loading
  - SvelteKit-Routing
  - SvelteKit-Error-Handling
timestamp: 2026-06-21
source: Wiki repo
---

SvelteKit form actions handle server-side form processing with progressive enhancement, supporting JavaScript-free submission and enhanced client-side behavior.

## Defining Actions

Actions are exported from `+page.server.js` (or `+layout.server.js`):

```js
// +page.server.js
export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData()
    const email = data.get('email')
    // Process form...
    return { success: true }
  },
  login: async ({ request, cookies }) => {
    // Named action
  }
}
```

Each action receives the standard load function event (`request`, `cookies`, `locals`, `params`, `url`) and must return either:
- A plain object (available as `form` in the page component)
- `throw redirect()` to navigate elsewhere
- `throw error()` for validation or processing errors

## Enhanced Forms

Use `use:enhance` from `$app/forms` for progressive enhancement:

```svelte
<script>
  import { enhance } from '$app/forms'
</script>

<form method="POST" action="?/login" use:enhance>
  <input name="email" type="email" />
  <button>Submit</button>
</form>
```

`use:enhance` handles form submission via `fetch`, updates the `form` store, and manages loading states. It degrades gracefully to standard form submission when JavaScript is disabled.

## Validation and Error Handling

Return validation errors as structured data:

```js
export const actions = {
  register: async ({ request }) => {
    const data = await request.formData()
    const email = data.get('email')

    if (!email || !email.includes('@')) {
      return { error: 'Invalid email', values: { email } }
    }

    return { success: true }
  }
}
```

Access the result in the page component:

```svelte
{#if form?.error}
  <p class="error">{form.error}</p>
{/if}
```

## Redirects after Actions

Use `throw redirect(303, '/success')` to redirect after successful form submission. The 303 status code tells the browser to navigate via GET.

## See Also
- [SvelteKit Data Loading](SvelteKit-Data-Loading) — how form submissions interact with load function data
- [SvelteKit Error Handling](SvelteKit-Error-Handling) — error handling patterns with forms and actions
- [SvelteKit Routing](SvelteKit-Routing) — how form action endpoints relate to routes
