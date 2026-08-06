# Svelte 4 → Svelte 5 Migration Cheat Sheet

> Quick reference for migrating from Svelte 4 to Svelte 5. Every pattern shows the OLD way and the NEW way.

---

## Reactivity

### Reactive Variables

```svelte
<!-- SVELTE 4 -->
<script>
  let count = 0;
  $: doubled = count * 2;
  $: console.log('Count:', count);
</script>
<button on:click={() => count++}>{count} (doubled: {doubled})</button>
```

```svelte
<!-- SVELTE 5 -->
<script>
  let count = $state(0);
  let doubled = $derived(count * 2);
  $effect(() => console.log('Count:', count));
</script>
<button onclick={() => count++}>{count} (doubled: {doubled})</button>
```

### Reactive Objects

```svelte
<!-- SVELTE 4 -->
<script>
  let user = { name: 'Alice', age: 30 };
  $: greeting = `Hello ${user.name}`;

  function birthday() {
    user.age += 1; // Triggers update
  }
</script>
```

```svelte
<!-- SVELTE 5 -->
<script>
  let user = $state({ name: 'Alice', age: 30 });
  let greeting = $derived(`Hello ${user.name}`);

  function birthday() {
    user.age += 1; // Still works - deep reactivity
  }
</script>
```

### Reactive Arrays

```svelte
<!-- SVELTE 4 -->
<script>
  let items = [1, 2, 3];
  function addItem() {
    items.push(4); // Triggers update
  }
</script>
```

```svelte
<!-- SVELTE 5 -->
<script>
  let items = $state([1, 2, 3]);
  function addItem() {
    items.push(4); // Still works - deep reactivity
  }
</script>
```

---

## Props

### Basic Props

```svelte
<!-- SVELTE 4 -->
<script>
  export let title = 'Default';
  export let count;
</script>
<h1>{title}: {count}</h1>
```

```svelte
<!-- SVELTE 5 -->
<script>
  let { title = 'Default', count } = $props();
</script>
<h1>{title}: {count}</h1>
```

### Rest Props

```svelte
<!-- SVELTE 4 -->
<script>
  export let known;
  // $$restProps contains all other props
</script>
<div {...$$restProps}>{known}</div>
```

```svelte
<!-- SVELTE 5 -->
<script>
  let { known, ...rest } = $props();
</script>
<div {...rest}>{known}</div>
```

### Two-Way Binding

```svelte
<!-- SVELTE 4 -->
<!-- Child.svelte -->
<script>
  export let value = '';
</script>
<input bind:value />

<!-- Parent.svelte -->
<Child bind:value={myValue} />
```

```svelte
<!-- SVELTE 5 -->
<!-- Child.svelte -->
<script>
  let { value = $bindable('') } = $props();
</script>
<input bind:value />

<!-- Parent.svelte -->
<script>
  let myValue = $state('');
</script>
<Child bind:value={myValue} />
```

---

## Events

### Component Events

```svelte
<!-- SVELTE 4 -->
<!-- Child.svelte -->
<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  function handleClick() {
    dispatch('customEvent', { data: 'value' });
  }
</script>
<button on:click={handleClick}>Click</button>

<!-- Parent.svelte -->
<Child on:customEvent={(e) => console.log(e.detail)} />
```

```svelte
<!-- SVELTE 5 -->
<!-- Child.svelte -->
<script>
  let { onCustomEvent } = $props();

  function handleClick() {
    onCustomEvent?.({ data: 'value' });
  }
</script>
<button onclick={handleClick}>Click</button>

<!-- Parent.svelte -->
<script>
  function handleCustom(e) {
    console.log(e);
  }
</script>
<Child onCustomEvent={handleCustom} />
```

### DOM Events

```svelte
<!-- SVELTE 4 -->
<button on:click={handler}>Click</button>
<input on:input={handler} on:keydown={handler} />
<div on:click|stopPropagation={handler}>Click</div>
```

```svelte
<!-- SVELTE 5 -->
<button onclick={handler}>Click</button>
<input oninput={handler} onkeydown={handler} />
<script>
  function handleClick(e) {
    e.stopPropagation();
    // handler logic
  }
</script>
<div onclick={handleClick}>Click</div>
```

---

## Slots → Snippets

### Default Slot

```svelte
<!-- SVELTE 4 -->
<!-- Card.svelte -->
<div class="card">
  <slot />
</div>

<!-- Usage -->
<Card>Content here</Card>
```

```svelte
<!-- SVELTE 5 -->
<!-- Card.svelte -->
<script>
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>
<div class="card">
  {@render children()}
</div>

<!-- Usage -->
<Card>Content here</Card>
```

### Named Slots

```svelte
<!-- SVELTE 4 -->
<!-- Card.svelte -->
<div class="card">
  <div class="header"><slot name="header" /></div>
  <div class="body"><slot /></div>
  <div class="footer"><slot name="footer" /></div>
</div>

<!-- Usage -->
<Card>
  <span slot="header">Title</span>
  <p>Body content</p>
  <span slot="footer">Footer</span>
</Card>
```

```svelte
<!-- SVELTE 5 -->
<!-- Card.svelte -->
<script>
  import type { Snippet } from 'svelte';
  let {
    header,
    children,
    footer
  }: {
    header: Snippet;
    children: Snippet;
    footer: Snippet;
  } = $props();
</script>
<div class="card">
  <div class="header">{@render header()}</div>
  <div class="body">{@render children()}</div>
  <div class="footer">{@render footer()}</div>
</div>

<!-- Usage -->
<Card>
  {#snippet header()}
    <span>Title</span>
  {/snippet}

  <p>Body content</p>

  {#snippet footer()}
    <span>Footer</span>
  {/snippet}
</Card>
```

### Slot Props

```svelte
<!-- SVELTE 4 -->
<!-- List.svelte -->
<script>
  export let items;
</script>
{#each items as item}
  <slot {item} />
{/each}

<!-- Usage -->
<List items={users} let:item>
  <p>{item.name}</p>
</List>
```

```svelte
<!-- SVELTE 5 -->
<!-- List.svelte -->
<script>
  import type { Snippet } from 'svelte';
  let {
    items,
    children
  }: {
    items: any[];
    children: Snippet<[any]>;
  } = $props();
</script>
{#each items as item}
  {@render children(item)}
{/each}

<!-- Usage -->
<script>
  let users = $state([{ name: 'Alice' }, { name: 'Bob' }]);
</script>
<List {items}>
  {#snippet children(item)}
    <p>{item.name}</p>
  {/snippet}
</List>
```

---

## Stores

### Writable Store

```svelte
<!-- SVELTE 4 -->
<script>
  import { writable } from 'svelte/store';
  const count = writable(0);

  function increment() {
    count.update(n => n + 1);
  }
</script>
<button on:click={increment}>{$count}</button>
```

```svelte
<!-- SVELTE 5 -->
<script>
  let count = $state(0);

  function increment() {
    count += 1;
  }
</script>
<button onclick={increment}>{count}</button>
```

### Global Store

```svelte
<!-- SVELTE 4 -->
<!-- stores.ts -->
import { writable } from 'svelte/store';
export const theme = writable('light');

<!-- Component.svelte -->
<script>
  import { theme } from './stores';
  function toggle() {
    theme.update(t => t === 'light' ? 'dark' : 'light');
  }
</script>
<button on:click={toggle}>Current: {$theme}</button>
```

```svelte
<!-- SVELTE 5 -->
<!-- state.svelte.ts -->
class Theme {
  mode = $state<'light' | 'dark'>('light');
  toggle() {
    this.mode = this.mode === 'light' ? 'dark' : 'light';
  }
}
export const theme = new Theme();

<!-- Component.svelte -->
<script>
  import { theme } from './state.svelte.ts';
</script>
<button onclick={() => theme.toggle()}>Current: {theme.mode}</button>
```

---

## Lifecycle

### onMount / onDestroy

```svelte
<!-- SVELTE 4 -->
<script>
  import { onMount, onDestroy } from 'svelte';

  onMount(() => {
    console.log('Mounted');
    const interval = setInterval(() => { /* ... */ }, 1000);

    onDestroy(() => {
      clearInterval(interval);
    });
  });
</script>
```

```svelte
<!-- SVELTE 5 -->
<script>
  import { onMount } from 'svelte';

  onMount(() => {
    console.log('Mounted');
    const interval = setInterval(() => { /* ... */ }, 1000);

    // Return cleanup function
    return () => {
      clearInterval(interval);
    };
  });
</script>
```

### beforeUpdate / afterUpdate

```svelte
<!-- SVELTE 4 -->
<script>
  import { beforeUpdate, afterUpdate } from 'svelte';

  let count = 0;

  beforeUpdate(() => {
    console.log('About to update');
  });

  afterUpdate(() => {
    console.log('Updated');
  });
</script>
```

```svelte
<!-- SVELTE 5 -->
<script>
  let count = $state(0);

  // Use $effect for post-update logic
  $effect(() => {
    console.log('Updated:', count);
  });

  // Use $effect.pre for pre-update logic
  $effect.pre(() => {
    console.log('About to update:', count);
  });
</script>
```

---

## Context

### Basic Context

```svelte
<!-- SVELTE 4 -->
<!-- Parent.svelte -->
<script>
  import { setContext } from 'svelte';
  setContext('theme', 'dark');
</script>

<!-- Child.svelte -->
<script>
  import { getContext } from 'svelte';
  const theme = getContext('theme');
</script>
<p>Theme: {theme}</p>
```

```svelte
<!-- SVELTE 5 -->
<!-- Parent.svelte -->
<script>
  import { setContext } from 'svelte';
  let theme = $state('dark');
  setContext('theme', {
    get value() { return theme; },
    set value(v) { theme = v; }
  });
</script>

<!-- Child.svelte -->
<script>
  import { getContext } from 'svelte';
  const theme = getContext('theme');
</script>
<p>Theme: {theme.value}</p>
```

---

## SvelteKit Specific

### Load Functions

```ts
// SVELTE 4 (SvelteKit 1)
export const load = async ({ params, fetch }) => {
  const res = await fetch(`/api/posts/${params.slug}`);
  const post = await res.json();
  return { post };
};
```

```ts
// SVELTE 5 (SvelteKit 2)
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
  const res = await fetch(`/api/posts/${params.slug}`);
  const post = await res.json();
  return { post };
};
```

### Page Store

```svelte
<!-- SVELTE 4 -->
<script>
  import { page } from '$app/stores';
</script>
<p>Path: {$page.url.pathname}</p>
<p>Data: {$page.data.title}</p>
```

```svelte
<!-- SVELTE 5 -->
<script>
  import { page } from '$app/state';
</script>
<p>Path: {page.url.pathname}</p>
<p>Data: {page.data.title}</p>
```

### Form Actions

```ts
// SVELTE 4 & 5 — Same!
// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';

export const actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email');
    // ... validate and login
    throw redirect(303, '/dashboard');
  }
};
```

---

## Template Syntax

### Event Handlers

```svelte
<!-- SVELTE 4 -->
<button on:click={handler}>Click</button>
<button on:click={() => count++}>Click</button>
<input on:input={(e) => value = e.target.value} />
```

```svelte
<!-- SVELTE 5 -->
<button onclick={handler}>Click</button>
<button onclick={() => count++}>Click</button>
<input oninput={(e) => value = e.target.value} />
```

### Class Directive

```svelte
<!-- SVELTE 4 -->
<div class:active={isActive} class:disabled={isDisabled}>
  Content
</div>
```

```svelte
<!-- SVELTE 5 — Same! -->
<div class:active={isActive} class:disabled={isDisabled}>
  Content
</div>
```

### Style Directive

```svelte
<!-- SVELTE 4 & 5 — Same! -->
<div style:color={textColor} style:font-size="16px">
  Styled text
</div>
```

---

## Transitions & Animations

### Basic Transition

```svelte
<!-- SVELTE 4 -->
<script>
  import { fade } from 'svelte/transition';
  let visible = true;
</script>
{#if visible}
  <div transition:fade>Fading</div>
{/if}
```

```svelte
<!-- SVELTE 5 — Same! -->
<script>
  import { fade } from 'svelte/transition';
  let visible = $state(true);
</script>
{#if visible}
  <div transition:fade>Fading</div>
{/if}
```

---

## Quick Migration Checklist

- [ ] Replace `let` with `$state()` for reactive variables
- [ ] Replace `$:` with `$derived()` for computed values
- [ ] Replace `$:` side effects with `$effect()`
- [ ] Replace `export let` with `$props()`
- [ ] Replace `$$restProps` with rest in `$props()`
- [ ] Replace `createEventDispatcher` with callback props
- [ ] Replace `on:click` with `onclick`
- [ ] Replace `<slot />` with `{@render children()}`
- [ ] Replace named slots with snippet props
- [ ] Replace `let:item` with `{#snippet children(item)}`
- [ ] Replace `svelte/store` with `$state` classes
- [ ] Replace `$app/stores` with `$app/state`
- [ ] Replace `beforeUpdate`/`afterUpdate` with `$effect.pre`/`$effect`
- [ ] Add `compilerOptions: { runes: true }` to svelte.config.js
- [ ] Update TypeScript types if using SvelteKit

---

## Common Gotchas

### 1. Forgetting to Enable Runes

```js
// svelte.config.js
export default {
  compilerOptions: {
    runes: true  // MUST be enabled
  }
};
```

### 2. Using $effect for Derived State

```ts
// WRONG
let doubled;
$effect(() => { doubled = count * 2; });

// RIGHT
let doubled = $derived(count * 2);
```

### 3. Arrow Function in $derived

```ts
// WRONG — creates a function
let x = $derived(() => count * 2);

// RIGHT — computes the value
let x = $derived(count * 2);
```

### 4. Optional Chaining Breaking Reactivity

```ts
// WRONG — breaks if user is null
let name = $derived(user?.profile?.name);

// RIGHT — provides fallback
let name = $derived(user?.profile?.name ?? '');
```

### 5. Runes Inside Functions

```ts
// WRONG — runes must be at top level
function setup() {
  let count = $state(0);  // ERROR
}

// RIGHT
let count = $state(0);
function setup() {
  count = 10;  // OK
}
```

---

## Summary Table

| Svelte 4 | Svelte 5 |
|---|---|
| `let count` | `let count = $state(0)` |
| `$: doubled = count * 2` | `let doubled = $derived(count * 2)` |
| `$: console.log(count)` | `$effect(() => console.log(count))` |
| `export let prop` | `let { prop } = $props()` |
| `$$restProps` | `let { known, ...rest } = $props()` |
| `bind:value` on prop | `$bindable()` |
| `dispatch('event')` | `onEvent()` callback prop |
| `on:click` | `onclick` |
| `<slot />` | `{@render children()}` |
| `<slot name="x" />` | `{@render x()}` |
| `let:item` | `{#snippet children(item)}` |
| `writable(0)` | `$state(0)` |
| `$app/stores` | `$app/state` |
| `beforeUpdate` | `$effect.pre` |
| `afterUpdate` | `$effect` |
