---
name: frontend-patterns
description: Frontend development patterns for Svelte 5 and SvelteKit — runes state management, component composition, data loading, performance optimization, and UI best practices.
metadata:
  origin: ECC
---

# Frontend Development Patterns

Modern frontend patterns for Svelte 5, SvelteKit, and performant user interfaces.

## When to Activate

- Building Svelte components (composition, props, snippets)
- Managing state (`$state`, `$derived`, `$effect`, `.svelte.ts` modules)
- Implementing data loading (SvelteKit `load`, form actions, streaming)
- Optimizing performance (fine-grained reactivity, keyed blocks, code splitting)
- Working with forms (validation, `bind:`, `use:enhance`)
- Handling routing and navigation (SvelteKit router, layout state)
- Building accessible, responsive UI patterns

## Component Patterns

### Composition Over Inheritance

```svelte
<!-- PASS: GOOD: Component composition via children and snippets -->
<!-- Card.svelte -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'default' | 'outlined';
		children: Snippet;
	}

	let { variant = 'default', children }: Props = $props();
</script>

<div class="card card-{variant}">
	{@render children()}
</div>
```

### Snippets Instead of Slots

```svelte
<!-- PASS: GOOD: Typed, parameterized snippets -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		header: Snippet;
		children: Snippet;
	}

	let { header, children }: Props = $props();
</script>

<section class="panel">
	<header>{@render header()}</header>
	<div class="panel-body">{@render children()}</div>
</section>

<!-- FAIL: BAD: Legacy named slots for new code -->
<!-- <slot name="header" /> -->
```

### Shared State via Context

```svelte
<!-- PASS: GOOD: setContext/getContext for scoped component trees -->
<!-- Tabs.svelte -->
<script lang="ts">
	import { setContext } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props { defaultTab: string; children: Snippet }
	let { defaultTab, children }: Props = $props();

	let activeTab = $state(defaultTab);
	setContext('tabs', {
		get activeTab() { return activeTab; },
		setActiveTab: (tab: string) => { activeTab = tab; }
	});
</script>

<div class="tabs">{@render children()}</div>
```

```ts
// Tab.svelte — consume with getters so reactivity survives
import { getContext } from 'svelte';

const tabs = getContext<ReturnType<typeof createTabsContext>>('tabs');
```

## State Management (Svelte 5 Runes)

### Local Component State

```typescript
// PASS: GOOD: $state with fine-grained updates
let count = $state(0);
let items = $state<Item[]>([]);

// Deep reactivity: mutation is tracked
items.push(newItem);
```

### Derived Values

```typescript
// PASS: GOOD: $derived for computed values, direct assignment only
let total = $derived(items.reduce((sum, i) => sum + i.price, 0));
let isOverBudget = $derived(total > budget);

// FAIL: BAD: Assigning to $derived or computing in $effect
// let total = $derived(0); $effect(() => { total = ... })
```

### Effects and Cleanup

```typescript
// PASS: GOOD: $effect with returned cleanup
$effect(() => {
	const controller = new AbortController();
	fetchData(query, controller.signal);
	return () => controller.abort();
});
```

### Module-Level Shared State

```typescript
// PASS: GOOD: .svelte.ts module for app-wide state
// lib/state/session.svelte.ts
interface Session { user: User | null; token: string | null }

function createSession() {
	let session = $state<Session>({ user: null, token: null });
	return {
		get current() { return session; },
		set(next: Session) { session = next; },
		clear() { session = { user: null, token: null }; }
	};
}

export const session = createSession();
```

```typescript
// FAIL: BAD: Legacy writable stores for new state
// import { writable } from 'svelte/store';
```

## Data Fetching (SvelteKit)

### Universal vs Server Load

```typescript
// PASS: GOOD: +page.server.ts for anything touching secrets or DB
export const load: ServerLoad = async ({ locals, params }) => {
	const entry = await locals.db.getEntry(params.id);
	return { entry };
};
```

```typescript
// PASS: GOOD: +page.ts for client-safe composition of data
export const load: PageLoad = async ({ data, fetch }) => {
	const extra = await fetch('/api/meta').then((r) => r.json());
	return { ...data, extra };
};
```

### Streaming Slow Data

```typescript
// PASS: GOOD: Return promises for slow data; render fast shell first
export const load: ServerLoad = async ({ locals }) => {
	return {
		title: await locals.db.getTitle(),
		slowReport: locals.db.buildReport() // streamed, not awaited
	};
};
```

### Mutations via Form Actions

```typescript
// PASS: GOOD: +page.server.ts actions with typed errors
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const title = form.get('title');
		if (typeof title !== 'string' || !title.trim()) {
			return fail(400, { title, missing: true });
		}
		await locals.db.save(title.trim());
		redirect(303, '/entries');
	}
};
```

```svelte
<!-- PASS: GOOD: Progressive enhancement with use:enhance -->
<form method="POST" use:enhance>
	<input name="title" required />
	<button>Save</button>
</form>
```

## Performance Patterns

### Fine-Grained Reactivity

```svelte
<!-- PASS: GOOD: Bind narrowly; each item re-renders independently -->
{#each items as item (item.id)}
	<ItemRow {item} />
{/each}

<!-- FAIL: BAD: One giant component re-rendering the whole list -->
```

### Keyed Blocks for Identity

```svelte
<!-- PASS: GOOD: Key resets state when identity changes -->
{#key route.id}
	<Editor content={route.content} />
{/key}
```

### Code Splitting

```typescript
// PASS: GOOD: Dynamic import for heavy components
const HeavyChart = $derived.by(() => import('$lib/components/HeavyChart.svelte'));
```

### Avoid Effect Overuse

```typescript
// FAIL: BAD: $effect to sync derivable values
// $effect(() => { doubled = count * 2; });

// PASS: GOOD: Use $derived
let doubled = $derived(count * 2);
```

## Forms and Validation

```svelte
<script lang="ts">
	import { z } from 'zod';

	const schema = z.object({
		email: z.string().email(),
		password: z.string().min(8)
	});

	let email = $state('');
	let password = $state('');
	let errors = $derived(schema.safeParse({ email, password }));
</script>

<form onsubmit={(e) => { if (!errors.success) e.preventDefault(); }}>
	<input type="email" bind:value={email} aria-invalid={!email || undefined} />
	<input type="password" bind:value={password} />
	<button disabled={!errors.success}>Submit</button>
</form>
```

## Styling Discipline (monorepo house rules)

- Single-tab **indented SASS** only — no braces, no semicolons, no new SCSS.
- External `.sass` files driven by design tokens; keep component `<style>` blocks at zero for shell UI.
- Prefer shared layout classes in `styles/` over per-component styling.
- Numeric spacing/size utilities come from the JIT styler plugin — do not hand-author utility classes it generates.

## Routing and Navigation

```typescript
// PASS: GOOD: Programmatic navigation via goto
import { goto, invalidateAll } from '$app/navigation';

await goto('/entries/new', { invalidateAll: true });
```

```svelte
<!-- PASS: GOOD: Layout state survives route changes; keep shared UI there -->
<!-- src/routes/+layout.svelte renders the shell, +page.svelte renders content -->
```

## Common Pitfalls

| Pitfall | Fix |
|---|---|
| Using `$effect` for derived values | Use `$derived` / `$derived.by` |
| Legacy stores for new state | `.svelte.ts` modules with `$state` |
| Unkeyed `{#each}` over mutable lists | Key by stable id |
| Awaiting slow queries in `load` blocks | Return the promise; stream it |
| Heavy component-level `<style>` | Move to shared `.sass` + tokens |
| Destructuring reactive objects | Read via getter or keep object intact |
