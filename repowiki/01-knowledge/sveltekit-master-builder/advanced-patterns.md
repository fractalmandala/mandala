# Advanced SvelteKit Patterns — Real-World Examples

> Battle-tested patterns from this monorepo's production apps.

---

## Complex State Management

### Undo/Redo with Command Pattern

```ts
// src/lib/state/undo.svelte.ts
interface Command {
  execute: () => void;
  undo: () => void;
  description: string;
}

export class UndoHistory {
  #history: Command[] = [];
  #pointer = -1;
  #maxSize = 50;

  canUndo = $derived(this.#pointer >= 0);
  canRedo = $derived(this.#pointer < this.#history.length - 1);

  transact(cmd: Command) {
    // Remove any redo states
    this.#history = this.#history.slice(0, this.#pointer + 1);
    this.#history.push(cmd);

    // Enforce max size
    if (this.#history.length > this.#maxSize) {
      this.#history = this.#history.slice(-this.#maxSize);
    }

    this.#pointer = this.#history.length - 1;
    cmd.execute();
  }

  undo() {
    if (!this.canUndo) return;
    this.#history[this.#pointer].undo();
    this.#pointer--;
  }

  redo() {
    if (!this.canRedo) return;
    this.#pointer++;
    this.#history[this.#pointer].execute();
  }

  clear() {
    this.#history = [];
    this.#pointer = -1;
  }
}

export const undo = new UndoHistory();
```

```svelte
<!-- Usage -->
<script lang="ts">
  import { undo } from '$lib/state/undo.svelte.ts';
  import { items } from '$lib/state/items.svelte.ts';

  function deleteItem(id: string) {
    const item = items.getById(id);
    undo.transact({
      execute: () => items.remove(id),
      undo: () => items.add(item),
      description: `Delete ${item.name}`
    });
  }
</script>

<button onclick={() => undo.undo()} disabled={!undo.canUndo}>Undo</button>
<button onclick={() => undo.redo()} disabled={!undo.canRedo}>Redo</button>
```

### Reactive Class with Persistence

```ts
// src/lib/state/prefs.svelte.ts
const STORAGE_KEY = 'app-prefs';

interface PrefsData {
  theme: 'light' | 'dark' | 'system';
  fontSize: number;
  fontFamily: string;
  sidebarOpen: boolean;
}

class Prefs {
  theme = $state<'light' | 'dark' | 'system'>('system');
  fontSize = $state(16);
  fontFamily = $state('Inter');
  sidebarOpen = $state(true);

  constructor() {
    this.#load();
  }

  #load() {
    if (typeof localStorage === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    try {
      const data: PrefsData = JSON.parse(stored);
      this.theme = data.theme ?? this.theme;
      this.fontSize = data.fontSize ?? this.fontSize;
      this.fontFamily = data.fontFamily ?? this.fontFamily;
      this.sidebarOpen = data.sidebarOpen ?? this.sidebarOpen;
    } catch {}
  }

  #persist() {
    if (typeof localStorage === 'undefined') return;
    const data: PrefsData = {
      theme: this.theme,
      fontSize: this.fontSize,
      fontFamily: this.fontFamily,
      sidebarOpen: this.sidebarOpen
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  setTheme(theme: PrefsData['theme']) {
    this.theme = theme;
    this.#persist();
  }

  setFontSize(size: number) {
    this.fontSize = size;
    this.#persist();
  }

  reset() {
    this.theme = 'system';
    this.fontSize = 16;
    this.fontFamily = 'Inter';
    this.sidebarOpen = true;
    this.#persist();
  }
}

export const prefs = new Prefs();
```

### Theme Application with System Detection

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import { prefs } from '$lib/state/prefs.svelte.ts';
  import { browser } from '$app/environment';

  let systemTheme = $state<'light' | 'dark'>('dark');

  // Detect system theme
  $effect(() => {
    if (!browser) return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    systemTheme = mq.matches ? 'dark' : 'light';

    const handler = (e: MediaQueryListEvent) => {
      systemTheme = e.matches ? 'dark' : 'light';
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  });

  // Apply theme to document
  $effect(() => {
    if (!browser) return;
    const resolved = prefs.theme === 'system' ? systemTheme : prefs.theme;
    document.documentElement.dataset.theme = resolved;
  });
</script>
```

---

## Advanced Routing Patterns

### Nested Layouts with Shared State

```
src/routes/
├── +layout.svelte              # Root: theme, global nav
├── (app)/
│   ├── +layout.svelte          # App shell: sidebar, topbar
│   ├── +layout.server.ts       # Auth check, user data
│   ├── dashboard/
│   │   └── +page.svelte
│   └── settings/
│       ├── +layout.svelte      # Settings nav
│       ├── profile/
│       └── notifications/
└── (marketing)/
    ├── +layout.svelte          # Marketing shell: landing nav
    ├── about/
    └── pricing/
```

```svelte
<!-- src/routes/(app)/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { auth } from '$lib/state/auth.svelte.ts';
  import Sidebar from '$lib/components/Sidebar/Sidebar.svelte';
  import Topbar from '$lib/components/Topbar/Topbar.svelte';

  let { children }: { children: Snippet } = $props();

  // Redirect if not authenticated
  $effect(() => {
    if (!auth.user && !page.url.pathname.startsWith('/login')) {
      goto('/login');
    }
  });
</script>

<div class="app-shell">
  <Sidebar />
  <div class="app-main">
    <Topbar />
    <main>{@render children()}</main>
  </div>
</div>
```

### Route Groups for Auth Flows

```
src/routes/
├── (auth)/
│   ├── +layout.svelte          # Centered card layout
│   ├── login/+page.svelte
│   ├── register/+page.svelte
│   └── forgot-password/+page.svelte
└── (app)/
    ├── +layout.server.ts       # Requires auth
    └── dashboard/+page.svelte
```

```svelte
<!-- src/routes/(auth)/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children }: { children: Snippet } = $props();
</script>

<div class="auth-shell">
  <div class="auth-card">
    <img src="/logo.png" alt="Logo" class="auth-logo" />
    {@render children()}
  </div>
</div>
```

### Dynamic Route with Multiple Parameters

```
src/routes/blog/[category]/[slug]/+page.svelte
```

```ts
// src/routes/blog/[category]/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  return {
    category: params.category,
    slug: params.slug
  };
};
```

```svelte
<!-- src/routes/blog/[category]/[slug]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';
  let { data }: { data: PageData } = $props();
</script>

<h1>{data.category} / {data.slug}</h1>
```

### Shallow Routing (Update URL Without Reload)

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';
  import { page } from '$app/state';

  let tab = $state(page.url.searchParams.get('tab') ?? 'overview');

  function switchTab(newTab: string) {
    tab = newTab;
    // Update URL without running load functions
    goto(`?tab=${newTab}`, { replaceState: true, keepFocus: true });
  }
</script>

<nav>
  <button onclick={() => switchTab('overview')} data-active={tab === 'overview'}>
    Overview
  </button>
  <button onclick={() => switchTab('analytics')} data-active={tab === 'analytics'}>
    Analytics
  </button>
</nav>

{#if tab === 'overview'}
  <OverviewPanel />
{:else if tab === 'analytics'}
  <AnalyticsPanel />
{/if}
```

---

## Component Composition Patterns

### Compound Components with Context

```svelte
<!-- src/lib/components/Tabs/Tabs.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { setContext } from 'svelte';

  interface TabsContext {
    activeTab: string;
    setTab: (id: string) => void;
  }

  interface Props {
    defaultTab: string;
    children: Snippet;
  }

  let { defaultTab, children }: Props = $props();
  let activeTab = $state(defaultTab);

  function setTab(id: string) {
    activeTab = id;
  }

  setContext<TabsContext>('tabs', {
    get activeTab() { return activeTab; },
    setTab
  });
</script>

<div class="tabs">
  {@render children()}
</div>

<!-- src/lib/components/Tabs/TabList.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';

  interface Props { children: Snippet; }
  let { children }: Props = $props();

  const ctx = getContext<TabsContext>('tabs');
</script>

<div class="tabs__list" role="tablist">
  {@render children()}
</div>

<!-- src/lib/components/Tabs/Tab.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';

  interface Props { id: string; children: Snippet; }
  let { id, children }: Props = $props();

  const ctx = getContext<TabsContext>('tabs');
  let isActive = $derived(ctx.activeTab === id);
</script>

<button
  role="tab"
  aria-selected={isActive}
  class="tabs__tab"
  data-active={isActive}
  onclick={() => ctx.setTab(id)}
>
  {@render children()}
</button>

<!-- src/lib/components/Tabs/TabPanel.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { getContext } from 'svelte';

  interface Props { id: string; children: Snippet; }
  let { id, children }: Props = $props();

  const ctx = getContext<TabsContext>('tabs');
  let isActive = $derived(ctx.activeTab === id);
</script>

{#if isActive}
  <div role="tabpanel" class="tabs__panel">
    {@render children()}
  </div>
{/if}
```

```svelte
<!-- Usage -->
<script lang="ts">
  import Tabs from '$lib/components/Tabs/Tabs.svelte';
  import TabList from '$lib/components/Tabs/TabList.svelte';
  import Tab from '$lib/components/Tabs/Tab.svelte';
  import TabPanel from '$lib/components/Tabs/TabPanel.svelte';
</script>

<Tabs defaultTab="overview">
  <TabList>
    <Tab id="overview">Overview</Tab>
    <Tab id="analytics">Analytics</Tab>
    <Tab id="settings">Settings</Tab>
  </TabList>

  <TabPanel id="overview">Overview content</TabPanel>
  <TabPanel id="analytics">Analytics content</TabPanel>
  <TabPanel id="settings">Settings content</TabPanel>
</Tabs>
```

### Polymorphic Component with `as` Prop

```svelte
<!-- src/lib/components/Button/Button.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    as?: 'button' | 'a' | 'div';
    href?: string;
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    children: Snippet;
    [key: string]: any;
  }

  let {
    as = 'button',
    href,
    variant = 'primary',
    size = 'md',
    disabled = false,
    children,
    ...rest
  }: Props = $props();
</script>

<svelte:element
  this={as}
  {href}
  {disabled}
  class="btn"
  data-variant={variant}
  data-size={size}
  aria-disabled={disabled}
  {...rest}
>
  {@render children()}
</svelte:element>
```

```svelte
<!-- Usage -->
<Button as="button" onclick={() => {}}>Click me</Button>
<Button as="a" href="/about">Link Button</Button>
<Button as="div" role="button" tabindex="0">Div Button</Button>
```

---

## Form Patterns

### Multi-Step Form with Validation

```svelte
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';

  let { form }: { form: PageData } = $props();

  let step = $state(1);
  let data = $state({
    name: form?.name ?? '',
    email: form?.email ?? '',
    password: '',
    confirm: ''
  });

  let errors = $derived.by(() => {
    const e: Record<string, string> = {};
    if (step === 1) {
      if (!data.name) e.name = 'Required';
    }
    if (step === 2) {
      if (!data.email) e.email = 'Required';
      else if (!/\S+@\S+\.\S+/.test(data.email)) e.email = 'Invalid email';
    }
    if (step === 3) {
      if (!data.password) e.password = 'Required';
      else if (data.password.length < 8) e.password = 'Min 8 characters';
      if (data.password !== data.confirm) e.confirm = 'Passwords do not match';
    }
    return e;
  });

  let isValid = $derived(Object.keys(errors).length === 0);

  function nextStep() {
    if (isValid && step < 3) step++;
  }

  function prevStep() {
    if (step > 1) step--;
  }
</script>

<form method="POST" use:enhance>
  {#if step === 1}
    <fieldset>
      <label>Name</label>
      <input bind:value={data.name} name="name" />
      {#if errors.name}<span class="error">{errors.name}</span>{/if}
    </fieldset>
  {:else if step === 2}
    <fieldset>
      <label>Email</label>
      <input bind:value={data.email} name="email" type="email" />
      {#if errors.email}<span class="error">{errors.email}</span>{/if}
    </fieldset>
  {:else if step === 3}
    <fieldset>
      <label>Password</label>
      <input bind:value={data.password} name="password" type="password" />
      {#if errors.password}<span class="error">{errors.password}</span>{/if}
    </fieldset>
    <fieldset>
      <label>Confirm Password</label>
      <input bind:value={data.confirm} name="confirm" type="password" />
      {#if errors.confirm}<span class="error">{errors.confirm}</span>{/if}
    </fieldset>
  {/if}

  <div class="form-actions">
    {#if step > 1}
      <button type="button" onclick={prevStep}>Back</button>
    {/if}
    {#if step < 3}
      <button type="button" onclick={nextStep} disabled={!isValid}>Next</button>
    {:else}
      <button type="submit" disabled={!isValid}>Submit</button>
    {/if}
  </div>
</form>
```

### File Upload with Progress

```ts
// src/routes/upload/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
  upload: async ({ request }) => {
    const data = await request.formData();
    const file = data.get('file') as File;

    if (!file || file.size === 0) {
      return fail(400, { error: 'No file selected' });
    }

    if (file.size > 10 * 1024 * 1024) {
      return fail(413, { error: 'File too large (max 10MB)' });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    // Save to disk, S3, etc.
    await saveFile(file.name, buffer);

    return { success: true, filename: file.name };
  }
};
```

```svelte
<!-- src/routes/upload/+page.svelte -->
<script lang="ts">
  import { enhance } from '$app/forms';
  import type { PageData } from './$types';

  let { form }: { form: PageData } = $props();
  let uploading = $state(false);
  let progress = $state(0);
  let selectedFile: File | null = $state(null);

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    selectedFile = input.files?.[0] ?? null;
  }
</script>

<form
  method="POST"
  enctype="multipart/form-data"
  use:enhance={({ submit }) => {
    uploading = true;
    progress = 0;

    return async ({ update }) => {
      await update();
      uploading = false;
      progress = 100;
    };
  }}
>
  <input type="file" name="file" onchange={handleFileSelect} accept="image/*" />

  {#if selectedFile}
    <p>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)</p>
  {/if}

  {#if uploading}
    <progress value={progress} max="100"></progress>
  {/if}

  {#if form?.error}
    <p class="error">{form.error}</p>
  {/if}

  {#if form?.success}
    <p class="success">Uploaded: {form.filename}</p>
  {/if}

  <button type="submit" disabled={!selectedFile || uploading}>
    {uploading ? 'Uploading...' : 'Upload'}
  </button>
</form>
```

---

## Performance Patterns

### Lazy Loading Components

```svelte
<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  let HeavyComponent = $state(null);

  onMount(async () => {
    if (!browser) return;
    const module = await import('$lib/components/HeavyComponent/HeavyComponent.svelte');
    HeavyComponent = module.default;
  });
</script>

{#if HeavyComponent}
  <svelte:component this={HeavyComponent} />
{:else}
  <p>Loading...</p>
{/if}
```

### Virtual Scrolling for Large Lists

```svelte
<script lang="ts">
  interface Props {
    items: any[];
    itemHeight: number;
    containerHeight: number;
  }

  let { items, itemHeight, containerHeight }: Props = $props();

  let scrollTop = $state(0);

  const visibleCount = Math.ceil(containerHeight / itemHeight);
  const startIndex = $derived(Math.floor(scrollTop / itemHeight));
  const endIndex = $derived(Math.min(startIndex + visibleCount, items.length));

  const visibleItems = $derived(items.slice(startIndex, endIndex));
  const offsetY = $derived(startIndex * itemHeight);

  function handleScroll(e: Event) {
    scrollTop = (e.target as HTMLDivElement).scrollTop;
  }
</script>

<div
  class="virtual-list"
  style="height: {containerHeight}px; overflow: auto;"
  onscroll={handleScroll}
>
  <div style="height: {items.length * itemHeight}px; position: relative;">
    <div style="transform: translateY({offsetY}px);">
      {#each visibleItems as item, i (startIndex + i)}
        <div style="height: {itemHeight}px;">
          <slot item={item} index={startIndex + i} />
        </div>
      {/each}
    </div>
  </div>
</div>
```

### Image Lazy Loading with Blurhash

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    src: string;
    alt: string;
    blurhash?: string;
    width?: number;
    height?: number;
  }

  let { src, alt, blurhash, width, height }: Props = $props();

  let loaded = $state(false);
  let visible = $state(false);
  let imgElement: HTMLImageElement;

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          visible = true;
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgElement) observer.observe(imgElement);
    return () => observer.disconnect();
  });
</script>

<img
  bind:this={imgElement}
  {src}
  {alt}
  {width}
  {height}
  loading="lazy"
  class="lazy-img"
  class:loaded
  onload={() => (loaded = true)}
/>

{#if !loaded && blurhash}
  <div class="blurhash-placeholder" style="--blurhash: {blurhash}"></div>
{/if}

<style>
  .lazy-img {
    opacity: 0;
    transition: opacity 0.3s;
  }
  .lazy-img.loaded {
    opacity: 1;
  }
</style>
```

---

## Testing Patterns

### Component Testing with Vitest

```ts
// src/lib/components/Button/Button.test.ts
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Button from './Button.svelte';

describe('Button', () => {
  it('renders with default props', () => {
    const { getByRole } = render(Button, {
      props: { children: 'Click me' }
    });
    const button = getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.textContent).toBe('Click me');
  });

  it('calls onclick when clicked', async () => {
    let clicked = false;
    const { getByRole } = render(Button, {
      props: {
        children: 'Click',
        onclick: () => { clicked = true; }
      }
    });

    await fireEvent.click(getByRole('button'));
    expect(clicked).toBe(true);
  });

  it('applies variant class', () => {
    const { getByRole } = render(Button, {
      props: { children: 'Primary', variant: 'primary' }
    });
    expect(getByRole('button')).toHaveAttribute('data-variant', 'primary');
  });

  it('disables button when disabled prop is true', () => {
    const { getByRole } = render(Button, {
      props: { children: 'Disabled', disabled: true }
    });
    expect(getByRole('button')).toBeDisabled();
  });
});
```

### Load Function Testing

```ts
// src/routes/blog/[slug]/+page.test.ts
import { describe, it, expect, vi } from 'vitest';
import { load } from './+page';

describe('Blog load function', () => {
  it('fetches post by slug', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ title: 'Test Post', content: 'Content' })
    });

    const result = await load({
      params: { slug: 'test-post' },
      fetch: mockFetch,
      url: new URL('/blog/test-post', 'http://localhost')
    } as any);

    expect(mockFetch).toHaveBeenCalledWith('/api/posts/test-post');
    expect(result.post.title).toBe('Test Post');
  });
});
```

---

## Debugging Patterns

### Reactive Debugging with $inspect

```svelte
<script lang="ts">
  let count = $state(0);
  let doubled = $derived(count * 2);

  // Logs whenever count or doubled changes
  $inspect(count, doubled);

  // With custom callback
  $inspect.with((type, ...values) => {
    console.log(`[${type}]`, ...values);
  })(count);
</script>
```

### Error Boundary with Logging

```svelte
<script lang="ts">
  import { goto } from '$app/navigation';

  function handleError(error: Error, reset: () => void) {
    console.error('Component error:', error);

    // Send to error tracking service
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error);
    }

    // Auto-reset after 5 seconds
    setTimeout(() => {
      reset();
    }, 5000);
  }
</script>

<svelte:boundary onerror={handleError}>
  {#snippet failed(error, reset)}
    <div class="error-fallback">
      <h2>Something went wrong</h2>
      <p>{error.message}</p>
      <button onclick={reset}>Try again</button>
      <button onclick={() => goto('/')}>Go home</button>
    </div>
  {/snippet}

  <RiskyComponent />
</svelte:boundary>
```

---

## Real-World App Shell

### Complete Tauri Desktop App Shell

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { page } from '$app/state';
  import { prefs } from '$lib/state/prefs.svelte.ts';
  import { ui } from '$lib/state/ui.svelte.ts';
  import { isTauri, onMenuEvent } from '$lib/ipc';
  import '../app.sass';

  let { children }: { children: Snippet } = $props();

  // Apply theme
  $effect(() => {
    if (!browser) return;
    document.documentElement.dataset.theme = prefs.theme;
  });

  // Tauri menu events
  onMount(() => {
    if (!isTauri()) return;
    return onMenuEvent((action) => {
      if (action === 'new-file') ui.newFile();
      if (action === 'save') ui.save();
      if (action === 'toggle-sidebar') ui.toggleSidebar();
    });
  });
</script>

<svelte:head>
  <meta name="theme-color" content={prefs.theme === 'dark' ? '#121815' : '#FFFEFC'} />
</svelte:head>

<div class="app" data-platform={isTauri() ? 'tauri' : 'web'}>
  {#if ui.sidebarOpen}
    <aside class="app-sidebar">
      <nav>Sidebar Nav</nav>
    </aside>
  {/if}

  <main class="app-main">
    {@render children()}
  </main>
</div>
```

```sass
// src/app.sass
@use 'lib/styles/index'

.app
  display: flex
  min-height: 100vh
  background: var(--color-bg)
  color: var(--color-fg)

.app-sidebar
  width: 260px
  border-right: 1px solid var(--color-muted)
  background: var(--color-bg-alt)

.app-main
  flex: 1
  overflow: auto
```

---

## Summary: Decision Matrix

| Task | Pattern | File Location |
|---|---|---|
| Share state across components | Reactive class singleton | `src/lib/state/*.svelte.ts` |
| Component-local state | `$state()` | Component `<script>` |
| Computed values | `$derived()` | Component or state file |
| Side effects | `$effect()` | Component or state file |
| Two-way binding | `$bindable()` | Component props |
| Reusable template | `{#snippet}` / `{@render}` | Component |
| Error boundary | `<svelte:boundary>` | Wrap risky component |
| Protect route | `+layout.server.ts` + `redirect()` | Route directory |
| Fetch data (web) | `+page.ts` or `+page.server.ts` | Route directory |
| Fetch data (Tauri) | `onMount` + `invoke()` | Component |
| Form submission | Form actions in `+page.server.ts` | Route directory |
| API endpoint | `+server.ts` | Route directory |
| Share context | `setContext` / `getContext` | Component |
| Lazy load | Dynamic `import()` in `onMount` | Component |
| Undo/redo | Command pattern with history | `src/lib/state/undo.svelte.ts` |
