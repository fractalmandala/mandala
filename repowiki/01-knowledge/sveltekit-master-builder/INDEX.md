# SvelteKit Master Builder — Progressive Decision Router

> **How to use this document:** Find your task → follow the arrow → get the exact file path, code, and convention.
> Every pattern below is battle-tested in this monorepo (Svelte 5.56+, SvelteKit 2.64+, Tauri 2.11+).

---

## QUICK DECISION TREE

```
"Build a SvelteKit project"
├── New project / scaffold        → §1 Project Setup
├── Add reactivity / state        → §2 Runes
├── Add a page / route            → §3 Routing
├── Fetch data / call an API      → §4 Data Loading
├── Build a form                  → §4.4 Form Actions
├── Build a component             → §5 Components & Snippets
├── Share state across components → §5.3 State Patterns
├── Style anything                → §6 Styling (SASS)
├── Add Tauri / desktop features  → §7 Tauri Integration
├── Add auth / protect routes     → §7.3 Authentication
├── Add TypeScript types          → §7.4 TypeScript
├── Deploy to production          → §8 Adapters & Deployment
├── Something broke               → §9 Anti-patterns & Mistakes
└── Need a quick reference        → §10 Cheat Sheets
```

---

## §1 — PROJECT SETUP

### "I need a new SvelteKit project"

**Standard web app:**
```bash
npx sv create my-app
# Choose: SvelteKit minimal / Skeleton
# Choose: TypeScript, SASS, prettier
cd my-app && pnpm install
```

**Tauri desktop app (this monorepo's pattern):**
```bash
pnpm create tauri-app my-app
# Choose: SvelteKit + TypeScript
```

### svelte.config.js — Copy-Paste

**For Tauri / SPA (adapter-static, no SSR):**
```js
import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: (filename) =>
      filename.split(/[/\\]/).includes('node_modules') ? undefined : true
  },
  kit: {
    adapter: adapter({ fallback: 'index.html' })
  }
};
export default config;
```

**For server-rendered site (adapter-vercel / adapter-node):**
```js
import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: { runes: true },
  kit: { adapter: adapter() }
};
export default config;
```

### vite.config.ts — Copy-Paste

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [sveltekit()],
  // Tauri: exclude Rust target from watch
  server: {
    port: 1420,
    strictPort: false,
    watch: { ignored: ['**/src-tauri/target/**'] }
  },
  build: { target: 'es2022' }
});
```

### Root Layout for SPA mode — `src/routes/+layout.ts`

```ts
// Disable SSR for Tauri / pure SPA
export const ssr = false;
export const prerender = true;
```

### Root Layout Shell — `src/routes/+layout.svelte`

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';
  import '../app.sass';

  let { children }: { children: Snippet } = $props();
</script>

<svelte:head>
  <title>My App</title>
</svelte:head>

{@render children()}
```

### File Structure Convention (this monorepo)

```
src/
├── routes/
│   ├── +layout.svelte          # Root shell
│   ├── +layout.ts              # ssr=false, prerender=true
│   ├── +page.svelte            # Home / entry
│   ├── +error.svelte           # Global error page
│   └── [sub-route]/
│       └── +page.svelte
├── lib/
│   ├── components/             # Reusable UI components
│   │   └── MyComponent/
│   │       ├── MyComponent.svelte
│   │       ├── MyComponent.sass
│   │       └── index.ts
│   ├── state/                  # Reactive state singletons
│   │   ├── ui.svelte.ts
│   │   ├── prefs.svelte.ts
│   │   └── data.svelte.ts
│   ├── styles/                 # Global SASS
│   │   ├── _tokens.sass
│   │   ├── _typography.sass
│   │   ├── _primitives.sass
│   │   ├── _mixins.sass
│   │   └── index.sass
│   ├── ipc.ts                  # Tauri gateway (if desktop)
│   └── utils.ts
├── app.html
└── app.d.ts
```

---

## §2 — SVELTE 5 RUNES (Reactivity Engine)

### Decision: Which rune do I need?

```
I need...
├── Reactive variable           → $state(value)
├── Computed / derived value    → $derived(expression)
├── Complex computation         → $derived.by(() => { ... })
├── Side effect (DOM, sync)     → $effect(() => { ... })
├── Component input props       → $props()
├── Two-way bindable prop       → $bindable()
├── Debug reactive value        → $inspect(value)
└── Immutable reactive value    → $state.raw(value)
```

### $state — Reactive Variables

```svelte
<script lang="ts">
  // Primitive
  let count = $state(0);

  // Object (deeply reactive via proxy)
  let user = $state({ name: 'Alice', prefs: { theme: 'dark' } });
  user.prefs.theme = 'light'; // triggers update

  // Array (deeply reactive)
  let items = $state<string[]>([]);
  items.push('new'); // triggers update

  // Immutable (no proxy — better perf for large data)
  let bigData = $state.raw(hugeArray);
  bigData = [...bigData, newItem]; // must reassign
</script>
```

### $derived — Computed Values

```svelte
<script lang="ts">
  let count = $state(0);

  // Simple derivation
  let doubled = $derived(count * 2);

  // Complex derivation (multi-statement)
  let summary = $derived.by(() => {
    const total = items.reduce((a, b) => a + b.price, 0);
    const count = items.length;
    return `Total: $${total} (${count} items)`;
  });

  // Conditional derivation
  let displayName = $derived(user?.name ?? 'Anonymous');
</script>
```

**CRITICAL RULE:** Never wrap `$derived` in an arrow function:
```ts
// WRONG — creates a function, not a value
let x = $derived(() => count * 2);

// RIGHT — computes the value directly
let x = $derived(count * 2);
```

### $effect — Side Effects

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let theme = $state('dark');

  // Runs when `theme` changes (auto-tracks dependencies)
  $effect(() => {
    document.documentElement.dataset.theme = theme;
  });

  // Cleanup on re-run or destroy
  $effect(() => {
    const handler = (e: KeyboardEvent) => { /* ... */ };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  // DOM-only code must be in onMount or guard with $app/environment
  import { browser } from '$app/environment';
  $effect(() => {
    if (!browser) return;
    // safe to use window/document here
  });
</script>
```

**DECISION: `$effect` vs `$derived`**
```
Am I computing a value from other state?
  → Use $derived (never $effect)

Am I syncing to external system (DOM, localStorage, API)?
  → Use $effect

Am I just reacting to an event?
  → Use an event handler (onclick, onchange) — NOT $effect
```

### $props — Component Inputs

```svelte
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    title: string;
    count?: number;
    onClick: () => void;
    children?: Snippet;
    class?: string;
  }

  let { title, count = 0, onClick, children, class: className }: Props = $props();
</script>

<h1 class={className}>{title}</h1>
<span>{count}</span>
<button onclick={onClick}>Go</button>
{#if children}{@render children()}{/if}
```

### $bindable — Two-Way Binding

```svelte
<!-- Child.svelte -->
<script lang="ts">
  interface Props { value: string; }
  let { value = $bindable('') }: Props = $props();
</script>
<input bind:value />

<!-- Parent.svelte -->
<script lang="ts">
  import Child from './Child.svelte';
  let name = $state('');
</script>
<Child bind:value={name} />
```

### Reactive State in `.svelte.ts` Files

```ts
// src/lib/state/ui.svelte.ts
export class UIState {
  sidebarOpen = $state(true);
  theme = $state<'light' | 'dark'>('dark');
  modalStack = $state<string[]>([]);

  get isModalOpen() {
    return this.modalStack.length > 0;
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  pushModal(id: string) { this.modalStack = [...this.modalStack, id]; }
  popModal() { this.modalStack = this.modalStack.slice(0, -1); }
}

export const ui = new UIState();
```

```svelte
<!-- Usage in any component -->
<script lang="ts">
  import { ui } from '$lib/state/ui.svelte.ts';
</script>
<button onclick={() => ui.toggleSidebar()}>Toggle</button>
{#if ui.sidebarOpen}<aside>Sidebar</aside>{/if}
```

---

## §3 — ROUTING

### File-Based Routing Map

```
src/routes/
├── +page.svelte              → /
├── +layout.svelte            → wraps ALL pages
├── about/
│   └── +page.svelte          → /about
├── blog/
│   ├── +page.svelte          → /blog
│   ├── [slug]/
│   │   └── +page.svelte      → /blog/:slug  (dynamic)
│   └── [...path]/
│       └── +page.svelte      → /blog/*  (catch-all)
├── (auth)/                   → route GROUP (no URL segment)
│   ├── login/+page.svelte    → /login
│   └── register/+page.svelte → /register
├── (app)/                    → another group
│   └── dashboard/+page.svelte → /dashboard
└── api/
    └── +server.ts            → /api (API endpoint)
```

### Route Parameters

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/state';
  // Access: page.params.slug
</script>

<!-- With load function -->
<script lang="ts">
  import type { PageLoad } from './$types';
  const { data } = $props();
  // data comes from +page.ts load function
</script>
```

```ts
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  return { slug: params.slug };
};
```

### Optional & Rest Parameters

```
[[lang]]/docs        → /docs or /en/docs  (optional)
files/[...path]      → /files/a/b/c       (rest/catch-all)
```

### Parameter Matchers

```ts
// src/params/integer.ts
export const match = (value: string) => /^\d+$/.test(value);

// Usage: src/routes/items/[id=integer]/+page.svelte
```

### Route Groups — Shared Layouts

```
src/routes/
├── (marketing)/
│   ├── +layout.svelte        → shared layout for marketing pages
│   ├── about/+page.svelte
│   └── pricing/+page.svelte
└── (app)/
    ├── +layout.svelte        → shared layout for app pages (auth required)
    ├── dashboard/+page.svelte
    └── settings/+page.svelte
```

### Navigation

```svelte
<script lang="ts">
  import { goto, preloadData } from '$app/navigation';
  import { navigating } from '$app/state';
</script>

<!-- Internal link -->
<a href="/about">About</a>

<!-- Programmatic navigation -->
<button onclick={() => goto('/dashboard')}>Go</button>

<!-- Preload on hover -->
<a href="/blog" data-sveltekit-preload-data="hover">Blog</a>

<!-- Show loading indicator -->
{#if $navigating}
  <progress></progress>
{/if}
```

### +layout.svelte — Nesting Pattern

```svelte
<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { auth } from '$lib/state/auth.svelte.ts';

  let { children }: { children: Snippet } = $props();

  // Protect route
  $effect(() => {
    if (!auth.user) goto('/login');
  });
</script>

<nav>App Nav</nav>
<main>{@render children()}</main>
```

---

## §4 — DATA LOADING & SERVER

### Decision: Which load file?

```
I need data for...
├── One page (client-safe)     → +page.ts  (universal load)
├── One page (server-only)     → +page.server.ts  (server load)
├── All child pages (shared)   → +layout.ts  or +layout.server.ts
├── A REST API endpoint        → +server.ts
└── Tauri / no-server SPA      → onMount + invoke()  (see §7)
```

### Universal Load — `+page.ts`

```ts
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch, url }) => {
  const res = await fetch(`/api/posts/${params.slug}`);
  const post = await res.json();
  return { post };
};
```

```svelte
<!-- src/routes/blog/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>
<h1>{data.post.title}</h1>
```

### Server Load — `+page.server.ts`

```ts
// src/routes/dashboard/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ cookies, locals }) => {
  const session = cookies.get('session');
  if (!session) throw redirect(302, '/login');

  const user = locals.users.get(session);
  const stats = await db.getStats(user.id);
  return { user, stats };
};
```

### Layout Load — Shared Data

```ts
// src/routes/+layout.server.ts
export const load = async ({ locals }) => {
  return {
    user: locals.user,
    theme: locals.theme
  };
};
```

```svelte
<!-- All child pages access layout data via $page.data -->
<script lang="ts">
  import { page } from '$app/state';
  // page.data.user, page.data.theme available everywhere
</script>
```

### API Endpoint — `+server.ts`

```ts
// src/routes/api/posts/+server.ts
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
  const posts = await locals.db.getPosts();
  return json(posts);
};

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  const post = await locals.db.createPost(body);
  return json(post, { status: 201 });
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
  const id = url.searchParams.get('id');
  await locals.db.deletePost(id);
  return new Response(null, { status: 204 });
};
```

### Streaming / Deferred Data

```ts
export const load = async ({ params }) => {
  return {
    // Immediate
    post: fetchPost(params.slug),

    // Deferred — page renders, then this resolves
    comments: new Promise(async (resolve) => {
      const data = await fetchComments(params.slug);
      resolve(data);
    })
  };
};
```

```svelte
{#await data.comments}
  <p>Loading comments...</p>
{:then comments}
  {#each comments as c}<p>{c.text}</p>{/each}
{:catch error}
  <p>Failed: {error.message}</p>
{/await}
```

### Re-running Load Functions

```ts
import { invalidate, invalidateAll } from '$app/navigation';

// Re-run loads that depend on this URL
await invalidate('/api/posts');

// Re-run ALL loads
await invalidateAll();
```

### Form Actions — `+page.server.ts`

```ts
// src/routes/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  login: async ({ request, cookies }) => {
    const data = await request.formData();
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    if (!email || !password) {
      return fail(400, { error: 'All fields required', email });
    }

    const user = await verifyUser(email, password);
    if (!user) {
      return fail(401, { error: 'Invalid credentials', email });
    }

    cookies.set('session', user.sessionId, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30
    });

    throw redirect(303, '/dashboard');
  },

  logout: async ({ cookies }) => {
    cookies.delete('session', { path: '/' });
    throw redirect(303, '/login');
  }
};
```

```svelte
<!-- src/routes/login/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';
  let { form }: { form: PageData } = $props();
</script>

<form method="POST" action="?/login" use:enhance>
  {#if form?.error}<p class="error">{form.error}</p>{/if}
  <input name="email" type="email" value={form?.email ?? ''} />
  <input name="password" type="password" />
  <button>Log in</button>
</form>
```

---

## §5 — COMPONENTS & SNIPPETS

### Component with Props + Snippets

```svelte
<!-- src/lib/components/Card/Card.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import './Card.sass';

  interface Props {
    title?: string;
    variant?: 'default' | 'elevated' = 'default';
    onclick?: () => void;
    header?: Snippet;
    children: Snippet;
    footer?: Snippet<[boolean]>;  // snippet with parameter
  }

  let { title, variant = 'default', onclick, header, children, footer }: Props = $props();
  let hovered = $state(false);
</script>

<div
  class="card"
  data-variant={variant}
  onmouseenter={() => hovered = true}
  onmouseleave={() => hovered = false}
  onclick={onclick}
>
  {#if header}
    <div class="card__header">{@render header()}</div>
  {:else if title}
    <div class="card__header"><h3>{title}</h3></div>
  {/if}

  <div class="card__body">
    {@render children()}
  </div>

  {#if footer}
    <div class="card__footer">
      {@render footer(hovered)}
    </div>
  {/if}
</div>
```

```svelte
<!-- Usage -->
<script lang="ts">
  import Card from '$lib/components/Card/Card.svelte';
</script>

<Card variant="elevated" onclick={() => console.log('clicked')}>
  {#snippet header()}
    <img src="/logo.png" alt="Logo" />
  {/snippet}

  <p>Main content here</p>

  {#snippet footer(isHovered)}
    <button>{isHovered ? 'Hovering!' : 'Card Footer'}</button>
  {/snippet}
</Card>
```

### Snippets — Reusable Template Fragments

```svelte
<script lang="ts">
  // Define snippet
  let { items }: { items: string[] } = $props();
</script>

{#snippet listItem(text: string, index: number)}
  <li class="item" data-index={index}>
    <span>{text}</span>
  </li>
{/snippet}

<ul>
  {#each items as item, i}
    {@render listItem(item, i)}
  {/each}
</ul>
```

### Recursive Snippets

```svelte
<!-- JSON tree viewer -->
<script lang="ts">
  type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };
  interface Props { data: JsonValue; label?: string; }
  let { data, label }: Props = $props();
  let expanded = $state<Set<string>>(new Set());
</script>

{#snippet node(value: JsonValue, path: string, key: string)}
  <div class="tree-row" style="padding-left: {path.split('.').length * 16}px">
    <button onclick={() => toggleExpanded(path)}>{key}</button>
    {#if typeof value === 'object' && value !== null}
      {#if expanded.has(path)}
        {#if Array.isArray(value)}
          {#each value as child, i}
            {@render node(child, `${path}.${i}`, `[${i}]`)}
          {/each}
        {:else}
          {#each Object.entries(value) as [k, v]}
            {@render node(v, `${path}.${k}`, k)}
          {/each}
        {/if}
      {/if}
    {:else}
      <span>{String(value)}</span>
    {/if}
  </div>
{/snippet}

{@render node(data, 'root', label ?? 'root')}
```

### Error Boundary — `<svelte:boundary>`

```svelte
<script lang="ts">
  let key = $state(0);
</script>

<svelte:boundary>
  {#key key}
    <RiskyComponent />
  {/key}

  {#snippet failed(error: Error, reset: () => void)}
    <div class="error-boundary">
      <p>Something broke: {error.message}</p>
      <button onclick={reset}>Try again</button>
    </div>
  {/snippet}
</svelte:boundary>
```

### Context API — Share State Without Props

```ts
// src/lib/context/theme.svelte.ts
import { getContext, setContext } from 'svelte';

const KEY = Symbol('theme');

export class ThemeContext {
  mode = $state<'light' | 'dark'>('dark');
  accent = $state('#6366f1');

  toggle() {
    this.mode = this.mode === 'dark' ? 'light' : 'dark';
  }
}

export function setThemeContext(ctx = new ThemeContext()) {
  setContext(KEY, ctx);
  return ctx;
}

export function getThemeContext() {
  return getContext<ThemeContext>(KEY);
}
```

```svelte
<!-- Root layout — provide -->
<script lang="ts">
  import { setThemeContext } from '$lib/context/theme.svelte.ts';
  const theme = setThemeContext();
</script>

<!-- Any descendant — consume -->
<script lang="ts">
  import { getThemeContext } from '$lib/context/theme.svelte.ts';
  const theme = getThemeContext();
</script>
<button onclick={() => theme.toggle()}>
  Current: {theme.mode}
</button>
```

---

## §6 — STYLING (Indented SASS)

### This Monorepo's Convention

**Rules:**
1. Single-tab indented `.sass` syntax ONLY (no SCSS, no braces, no colons)
2. No `<style>` blocks in `.svelte` components
3. External `.sass` file per component
4. CSS custom properties (design tokens) for all values
5. `data-slot` / `data-variant` for component styling hooks

### Token Architecture (fractaldharma pattern)

```sass
// src/lib/styles/_tokens.sass
// Two-layer system: primitives → semantic aliases

:root
  // Typography scale
  --text-xs: 0.75rem
  --text-sm: 0.875rem
  --text-md: 0.9375rem
  --text-base: 1rem
  --text-lg: 1.125rem
  --text-xl: 1.25rem
  --text-2xl: 1.5rem
  --text-3xl: 1.875rem
  --text-4xl: 2.5rem
  --text-5xl: 3.25rem

  // Size scale (4px root)
  --size2: 2px
  --size4: 4px
  --size8: 8px
  --size12: 12px
  --size16: 16px
  --size24: 24px
  --size32: 32px
  --size48: 48px
  --size64: 64px
  --size80: 80px
  --size128: 128px

  // Layout
  --content-narrow: 720px
  --content-reading: 900px
  --content-wide: 1120px
  --pane-min: 240px
  --pane-max: 360px

  // Z-index layers
  --z-panel: 10
  --z-popover: 100
  --z-dialog: 1000
  --z-toast: 2000

  // Motion
  --duration-fast: 120ms
  --duration-normal: 180ms
  --duration-panel: 220ms
  --ease-standard: cubic-bezier(0.2, 0, 0, 1)
  --ease-emphasized: cubic-bezier(0.16, 1, 0.3, 1)

// Light theme
.light
  --background-primary: #FFFFFF
  --background-secondary: #F9F8F6
  --background-tertiary: #e1e1e0
  --text-primary: #121212
  --text-secondary: #666666
  --text-tertiary: #a7a7a7
  --text-accent: #533883
  --text-accent2: #7A3F98
  --text-accent3: #D7693B
  --border-default: #efefef
  --border-light: #f1f1f1
  --border-dark: #d1d1d1
  --theme-color: #D7693B

// Dark theme
.dark
  --background-primary: #282727
  --background-secondary: #1B1B1B
  --background-tertiary: #383737
  --text-primary: #ffffff
  --text-secondary: #8d8d8d
  --text-tertiary: #525252
  --text-accent: #533883
  --text-accent2: #7A3F98
  --text-accent3: #D7693B
  --border-default: #313131
  --border-light: #292929
  --border-dark: #474747
  --theme-color: #D7693B

// Reduced motion
@media (prefers-reduced-motion: reduce)
  :root
    --duration-fast: 1ms
    --duration-normal: 1ms
    --duration-panel: 1ms
```

### Component SASS Pattern

```sass
// src/lib/components/Card/Card.sass
.card
  display: flex
  flex-direction: column
  border-radius: var(--size8)
  background: var(--background-primary)
  border: 1px solid var(--border-default)
  overflow: hidden
  transition: box-shadow var(--duration-normal) var(--ease-standard)

  &[data-variant='elevated']
    box-shadow: 0 var(--size4) var(--size12) rgba(0, 0, 0, 0.1)

  &[data-variant='default']:hover
    border-color: var(--text-accent)

  &__header
    padding: var(--size16)
    border-bottom: 1px solid var(--border-default)
    color: var(--text-primary)
    font-size: var(--text-lg)

  &__body
    padding: var(--size16)
    flex: 1
    color: var(--text-secondary)
    font-size: var(--text-sm)

  &__footer
    padding: var(--size12) var(--size16)
    border-top: 1px solid var(--border-default)
    color: var(--text-tertiary)
    font-size: var(--text-xs)
```

### Global Styles Entry

```sass
// src/lib/styles/index.sass
@forward 'tokens'
@use 'typography'
@use 'primitives'
@use 'spacing'
@use 'components'
@use 'layouts'
@use 'pages'

// Reset
*, *::before, *::after
  box-sizing: border-box
  margin: 0
  padding: 0

html
  font-family: var(--font-sans)
  font-size: var(--text-base)
  color: var(--text-primary)
  background: var(--background-primary)

body
  min-height: 100vh
  line-height: 1.5
  -webkit-font-smoothing: antialiased
```

**Token naming convention (fractaldharma):**
- **Colors:** `--background-*`, `--text-*`, `--border-*`, `--theme-color`
- **Typography:** `--text-xs` through `--text-5xl`
- **Spacing:** `--size2` through `--size128` (4px root scale)
- **Layout:** `--content-narrow`, `--content-reading`, `--content-wide`, `--pane-*`
- **Motion:** `--duration-*`, `--ease-*`
- **Z-index:** `--z-panel`, `--z-popover`, `--z-dialog`, `--z-toast`

### Utility Primitives (fractals-styler pattern)

```sass
// src/lib/styles/_primitives.sass
.box
  display: flex
  flex-direction: column

.row
  display: flex
  flex-direction: row
  &.wrap
    flex-wrap: wrap

.col
  display: flex
  flex-direction: column

.grid
  display: grid

// Spacing utilities (numeric suffix = N * 4px)
@each $n in (2, 4, 6, 8, 12, 16, 24, 32)
  .gap#{$n}
    gap: #{$n}px
  .pad#{$n}
    padding: #{$n}px
  .margin#{$n}
    margin: #{$n}px
```

### Import in Layout

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '$lib/styles/index.sass';
  // OR with fractals-styler plugin:
  // import 'virtual:fractals-styler.css';
</script>
```

---

## §7 — TAURI + HOOKS + AUTH + TYPESCRIPT

### Tauri IPC Gateway

```ts
// src/lib/ipc.ts
import { invoke } from '@tauri-apps/api/core';
import { listen, type UnlistenFn } from '@tauri-apps/api/event';

export const isTauri = (): boolean =>
  typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;

// Typed command wrappers
export const listEntries = (): Promise<Entry[]> =>
  invoke('list_entries');

export const readEntry = (id: string): Promise<Entry> =>
  invoke('read_entry', { id });

export const saveEntry = (entry: Entry): Promise<void> =>
  invoke('save_entry', { entry });

// Event listener with cleanup
export function onMenuEvent(cb: (action: string) => void): () => void {
  if (!isTauri()) return () => {};
  let unlisten: UnlistenFn | null = null;
  listen<string>('menu-event', (e) => cb(e.payload))
    .then((fn) => { unlisten = fn; });
  return () => { unlisten?.(); };
}
```

```svelte
<!-- Usage in component -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { listEntries } from '$lib/ipc';

  let entries = $state<Entry[]>([]);
  let error = $state<string | null>(null);

  onMount(async () => {
    try { entries = await listEntries(); }
    catch (e) { error = String(e); }
  });
</script>
```

### Hooks — `hooks.server.ts`

```ts
// src/hooks.server.ts
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Set locals
  const session = event.cookies.get('session');
  event.locals.user = session ? await getUser(session) : null;

  // Timing header
  const start = Date.now();
  const response = await resolve(event);
  response.headers.set('x-response-time', `${Date.now() - start}ms`);

  return response;
};

export const handleError: HandleServerError = async ({ error, event }) => {
  console.error(`[${event.route.id}]`, error);
  return {
    message: 'Something went wrong',
    code: 'UNKNOWN'
  };
};
```

### Authentication Pattern

```ts
// src/app.d.ts
declare global {
  namespace App {
    interface Locals {
      user: { id: string; email: string; role: string } | null;
    }
  }
}

// src/hooks.server.ts
export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session');
  event.locals.user = sessionId
    ? await db.findSession(sessionId)
    : null;
  return resolve(event);
};

// Protected layout
// src/routes/(app)/+layout.server.ts
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
  if (!locals.user) throw redirect(302, '/login');
  return { user: locals.user };
};
```

### TypeScript — Generated Types

```ts
// In any +page.ts / +page.server.ts
import type { PageLoad, PageData, Actions } from './$types';

// In load functions
export const load: PageLoad = async ({ params, fetch }) => {
  // params is typed to route params
  // fetch is typed with return types
  return { data: 'value' };
};

// In +page.svelte — data is auto-typed
let { data }: { data: PageData } = $props();
```

```ts
// src/app.d.ts — Global type extensions
declare global {
  namespace App {
    interface Locals { user: User | null }
    interface PageData { title?: string }
    interface PageState { modal: boolean }
    interface Error { code: string; message: string }
    interface Platform { env: Env }
  }
}
export {};
```

---

## §8 — ADAPTERS & DEPLOYMENT

### Decision: Which adapter?

```
Deploying to...
├── Tauri / static files    → adapter-static
├── Vercel                  → adapter-vercel
├── Node.js server          → adapter-node
├── Netlify                 → adapter-netlify
├── Cloudflare Pages        → adapter-cloudflare
└── Cloudflare Workers      → adapter-cloudflare-workers
```

### SPA Mode (Tauri / Electron)

```js
// svelte.config.js
import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({ fallback: 'index.html' })
  }
};
```

```ts
// src/routes/+layout.ts
export const ssr = false;
export const prerender = true;
```

### Full Prerender (Static Site)

```ts
// src/routes/+layout.ts
export const prerender = true;

// Or per-page
// src/routes/about/+page.ts
export const prerender = true;
```

### Server-Side Rendered (Vercel)

```js
import adapter from '@sveltejs/adapter-vercel';
export default {
  kit: { adapter: adapter({ runtime: 'edge' }) }
};
```

### Build Commands

```bash
# Dev
pnpm dev

# Build
pnpm build

# Preview build
pnpm preview

# Tauri dev
pnpm tauri dev

# Tauri build
pnpm tauri build

# Type check
pnpm svelte-check
```

---

## §9 — ANTI-PATTERNS & COMMON MISTAKES

### NEVER Do This in Svelte 5

```ts
// WRONG — $: reactive statements (Svelte 4 legacy)
$: doubled = count * 2;
// RIGHT
let doubled = $derived(count * 2);

// WRONG — export let props (Svelte 4)
export let title: string;
// RIGHT
let { title } = $props();

// WRONG — writable stores for component state
import { writable } from 'svelte/store';
const count = writable(0);
// RIGHT
let count = $state(0);

// WRONG — $derived with arrow function
let x = $derived(() => count * 2);
// RIGHT
let x = $derived(count * 2);

// WRONG — $effect for computed values
$effect(() => { doubled = count * 2; });
// RIGHT
let doubled = $derived(count * 2);

// WRONG — accessing window/document in SSR
$effect(() => {
  window.addEventListener('resize', handler);
});
// RIGHT
import { browser } from '$app/environment';
$effect(() => {
  if (!browser) return;
  window.addEventListener('resize', handler);
});

// WRONG — optional chaining breaking reactivity
let x = $derived(user?.profile?.name);
// RIGHT — provide fallback to keep reactivity chain
let x = $derived(user?.profile?.name ?? '');

// WRONG — <style> blocks in components (this monorepo)
<style>.card { ... }</style>
// RIGHT — external .sass file
// Card.sass imported by build system
```

### Common Pitfalls

| Mistake | Fix |
|---|---|
| `$effect` for derived state | Use `$derived` |
| Runes inside regular functions | Runes only work at top-level of `<script>` or `.svelte.ts` |
| Mutating `$state.raw()` | Reassign instead: `data = { ...data, key: val }` |
| `onMount` for reactive sync | Use `$effect` |
| `export let` in Svelte 5 | Use `$props()` |
| `$$props` / `$$restProps` | Use `$props()` with rest: `let { known, ...rest } = $props()` |
| Slots in Svelte 5 | Use snippets: `{#snippet}` / `{@render}` |
| `createEventDispatcher` | Use callback props: `let { onChange } = $props()` |
| `svelte/store` for local state | Use `$state` |
| SCSS syntax in this monorepo | Use indented `.sass` only |

---

## §10 — QUICK-REFERENCE CHEAT SHEETS

### File Naming

| File | Purpose |
|---|---|
| `+page.svelte` | Page component |
| `+page.ts` | Universal load (server + client) |
| `+page.server.ts` | Server-only load + form actions |
| `+layout.svelte` | Layout wrapper (nestable) |
| `+layout.ts` | Layout load |
| `+layout.server.ts` | Server-only layout load |
| `+server.ts` | API endpoint (GET, POST, etc.) |
| `+error.svelte` | Error page |
| `*.svelte.ts` | Reactive module (runes outside .svelte) |
| `hooks.server.ts` | Server hooks (auth, logging) |
| `hooks.client.ts` | Client hooks (error handling) |
| `app.d.ts` | Global type declarations |

### Runes Quick Reference

| Rune | Purpose | Returns |
|---|---|---|
| `$state(val)` | Reactive state | Deep reactive proxy |
| `$state.raw(val)` | Reactive state (immutable) | Raw value |
| `$state.snapshot(obj)` | Non-reactive copy | Plain object |
| `$derived(expr)` | Computed value | Sync derived value |
| `$derived.by(fn)` | Complex computation | Sync derived value |
| `$effect(fn)` | Side effect | Cleanup function |
| `$effect.pre(fn)` | Before DOM update | Cleanup function |
| `$props()` | Component inputs | Destructured props |
| `$bindable(val)` | Two-way bindable prop | Bindable value |
| `$inspect(val)` | Debug logging | void (dev only) |

### Template Blocks

| Block | Purpose |
|---|---|
| `{#if cond}...{:else}...{/if}` | Conditional |
| `{#each items as item (key)}...{/each}` | List |
| `{#await promise}...{:then v}...{:catch e}...{/await}` | Async |
| `{#key expr}...{/key}` | Force re-create |
| `{#snippet name(params)}...{/snippet}` | Reusable fragment |
| `{@render snippet(args)}` | Render snippet |
| `{@html rawHtml}` | Raw HTML (unsanitized!) |
| `{@const x = expr}` | Block-scoped constant |
| `{@debug var}` | Debugger breakpoint |

### Built-in Components

| Component | Purpose |
|---|---|
| `<svelte:head>` | Inject into `<head>` |
| `<svelte:window>` | Bind to window events/props |
| `<svelte:document>` | Bind to document events |
| `<svelte:body>` | Bind to body events |
| `<svelte:element this={tag}>` | Dynamic element |
| `<svelte:boundary>` | Error boundary |
| `<svelte:options>` | Compiler options |

### SvelteKit Modules

| Import | Provides |
|---|---|
| `$app/state` | `page`, `navigating`, `updated` |
| `$app/navigation` | `goto`, `invalidate`, `invalidateAll`, `preloadData`, `beforeNavigate` |
| `$app/forms` | `enhance` |
| `$app/environment` | `browser`, `dev`, `building` |
| `$app/paths` | `base`, `assets` |
| `$env/static/private` | Build-time private env vars |
| `$env/static/public` | Build-time public env vars (PUBLIC_ prefix) |
| `$env/dynamic/private` | Runtime private env vars |
| `$env/dynamic/public` | Runtime public env vars |
| `$lib/*` | Maps to `src/lib/*` |

### Directives

| Directive | Purpose |
|---|---|
| `bind:value` | Two-way binding |
| `bind:this={el}` | Element reference |
| `class:name={bool}` | Toggle CSS class |
| `style:prop={val}` | Inline CSS property |
| `use:action` | Element action |
| `transition:name` | In+out transition |
| `in:name` / `out:name` | Directional transition |
| `animate:name` | FLIP animation |

---

## CROSS-REFERENCE: Where to Find More

| Topic | Location in this repo |
|---|---|
| Full Svelte 5 knowledge base | `sites/fractalhome/docs/Sveltekit/` |
| SvelteKit skills & patterns | `packages/fractal-agentic/skills/sveltekit-structure/` |
| Svelte runes deep-dive | `packages/fractal-agentic/skills/svelte-runes/` |
| Component architecture | `packages/fractal-agentic/skills/svelte-components-patterns/` |
| Styling patterns | `packages/fractal-agentic/skills/svelte-styling/` |
| Template directives | `packages/fractal-agentic/skills/svelte-template-directives/` |
| Deployment & PWA | `packages/fractal-agentic/skills/svelte-deployment/` |
| Design system tokens | `basedocs/fractals-design-system.md` |
| Component library (fractalsvelte) | `packages/fractalsvelte/` |
| SVOCS docs framework | `repowiki/knowledge/docs-scaffolding/svdocs.md` |
| DocSmith docs framework | `repowiki/knowledge/docs-scaffolding/docsmith.md` |
| Tauri + SvelteKit conventions | `apps/fracta/AGENTS.md`, `apps/fractalengine/AGENTS.md` |
| Shadcn → Svelte porting guide | `packages/fractal-agentic/skills/shadcn-to-svelte/` |
