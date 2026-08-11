---
title: "Choose route data and SSR boundaries"
description: "Decide between SvelteKit universal loads, server loads, layouts, actions, endpoints, and browser effects."
type: how-to
---

# Choose route data and SSR boundaries

Use the narrowest boundary that preserves behavior.

| Behavior | File or boundary |
| --- | --- |
| Public data safe in browser and SSR | `+page.ts` |
| Database, secrets, auth, private environment, or `getServerSideProps` | `+page.server.ts` |
| Shared route data | `+layout.ts` or `+layout.server.ts` |
| Form mutation | `+page.server.ts` action |
| Standalone API endpoint | `+server.ts` |
| Browser DOM or storage behavior | component `$effect`, `onMount`, or explicit `browser` guard |

SvelteKit documents universal loads as running on server and browser, while server loads
run only on the server. Server load output must be transportable; current SvelteKit
uses `devalue`-compatible serialization rather than limiting every value to JSON.
[Official loading data reference](https://svelte.dev/docs/kit/load).

## Browser-only checklist

List every use of `window`, `document`, `localStorage`, canvas, observers, or DOM-bound
animation targets in the receipt. Set one SSR mode:

- `safe` — no browser-only work;
- `browser-effect` — work is inside `$effect` or `onMount` with cleanup;
- `browser-guard` — work is protected by `browser`; or
- `disabled` — exceptional, with a reason.

Never return functions, component constructors, DOM nodes, browser objects, or unresolved
server-only objects from a server load.

## Route typing

Use generated route types after `svelte-kit sync`:

```ts
// +page.server.ts
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ locals }) => {
	return { user: locals.user }
}
```

```svelte
<script lang="ts">
	import type { PageProps } from './$types'

	let { data }: PageProps = $props()
</script>
```
