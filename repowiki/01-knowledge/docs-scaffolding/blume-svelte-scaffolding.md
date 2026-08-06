# Svelte & SvelteKit Architecture for Blume (`blume-svelte`)

This document details how Blume's hidden engine pattern (currently powered by Astro under `.blume/`) can be replicated using **Svelte 5** and **SvelteKit 2** under `.blume-svelte/`.

---

## 1. How Blume Works Under the Hood (Astro Baseline)

In `sites/fractalhome/.blume/`, Blume operates by generating a hidden framework runtime workspace:

```text
sites/fractalhome/
├── blume.config.ts           # User config
├── theme.css                 # User CSS tokens
├── components.ts             # User component overrides
├── docs/                     # User Markdown content
└── .blume/                   # Generated Astro Workspace (git-ignored)
    ├── package.json          # Astro & plugin dependencies
    ├── astro.config.mjs      # Generated Astro config
    └── src/
        ├── pages/
        │   ├── [...slug].astro  # Catch-all Markdown renderer
        │   └── og/              # Social card generator
        └── content.config.ts    # Astro Content Collections
```

The CLI (`blume dev`, `blume build`) executes commands *inside* `.blume/` while pointing at the parent directory's `docs/` and `blume.config.ts`.

---

## 2. The Svelte 5 & SvelteKit 2 Alternative (`.blume-svelte`)

We can construct the exact same developer workflow powered entirely by Svelte 5 and SvelteKit 2.

### Workspace Comparison

```text
sites/fractalwikis/
├── blume.config.ts             # User site config
├── theme.css                   # User visual tokens
├── components.ts               # Svelte component overrides (PageHeader.svelte, Logo.svelte)
├── docs/                       # User Markdown content
└── .blume-svelte/              # Generated SvelteKit Workspace (git-ignored)
    ├── package.json            # SvelteKit, Svelte 5, mdsvex, Shiki, adapter-static
    ├── svelte.config.js        # mdsvex preprocessor + Svelte 5 runes mode
    ├── vite.config.ts          # SvelteKit plugin + content scanner
    └── src/
        ├── app.html
        ├── routes/
        │   ├── +layout.svelte   # Svelte 5 Shell with header, sidebar, TOC
        │   ├── [...slug]/
        │   │   ├── +page.ts     # Load function parsing doc metadata
        │   │   └── +page.svelte # Page renderer
        │   └── search.json/
        │       └── +server.ts   # Pagefind / FlexSearch endpoint
        └── lib/
            └── generated/       # Compiled page map & navigation tree
```

---

## 3. Svelte 5 Runes & Layout Architecture

### A. Root Layout (`.blume-svelte/src/routes/+layout.svelte`)

Using Svelte 5 runes (`$state`, `$derived`, `{@render children()}`), the generated shell handles responsive sidebar state, search toggles, and light/dark theme switching:

```svelte
<script lang="ts">
  import { page } from '$app/state';
  import config from '../../blume.config';
  import pageMap from '../lib/generated/page-map.json';
  import Header from '../lib/components/Header.svelte';
  import Sidebar from '../lib/components/Sidebar.svelte';
  import TOC from '../lib/components/TOC.svelte';
  import '../../theme.css';

  let { children } = $props();
  let themeMode = $state('dark');
  let sidebarOpen = $state(false);

  // Derived current active heading and TOC anchors
  let activeRoute = $derived(page.url.pathname);
</script>

<div class="blume-shell" data-theme={themeMode}>
  <Header {config} bind:sidebarOpen />
  
  <div class="blume-body">
    <Sidebar {pageMap} {activeRoute} bind:open={sidebarOpen} />
    
    <main id="blume-content" class="blume-main">
      <article class="prose">
        {@render children()}
      </article>
    </main>

    <TOC {activeRoute} />
  </div>
</div>
```

---

## 4. `blume-svelte` CLI Scaffolding Wrapper

The CLI script (`scripts/blume-svelte.mjs` or `npx blume-svelte`) manages the initialization of `.blume-svelte/` before delegating dev/build tasks to SvelteKit:

```javascript
#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const CWD = process.cwd();
const TARGET_BLUME_DIR = path.join(CWD, '.blume-svelte');
const command = process.argv[2] || 'dev';

// Step 1: Ensure .blume-svelte project exists
if (!fs.existsSync(TARGET_BLUME_DIR)) {
  console.log('[blume-svelte] Initializing SvelteKit 2 runtime workspace in .blume-svelte...');
  fs.mkdirSync(TARGET_BLUME_DIR, { recursive: true });
  
  // Scaffold package.json, svelte.config.js, vite.config.ts, and routes
  scaffoldSvelteKitWorkspace(TARGET_BLUME_DIR);
}

// Step 2: Sync parent config (blume.config.ts, theme.css, components.ts) into .blume-svelte
syncUserOverrides(CWD, TARGET_BLUME_DIR);

// Step 3: Delegate CLI command to SvelteKit / Vite
if (command === 'dev') {
  execSync('npx vite dev', { cwd: TARGET_BLUME_DIR, stdio: 'inherit' });
} else if (command === 'build') {
  execSync('npx vite build', { cwd: TARGET_BLUME_DIR, stdio: 'inherit' });
  // Copy static output from .blume-svelte/build -> dist/
  fs.cpSync(path.join(TARGET_BLUME_DIR, 'build'), path.join(CWD, 'dist'), { recursive: true });
  console.log('[blume-svelte] Build complete! Static site generated in dist/');
}
```

---

## 5. Architectural Comparison Matrix

| Architectural Axis | Blume Astro (`.blume/`) | Blume Svelte (`.blume-svelte/`) |
| :--- | :--- | :--- |
| **Framework Engine** | Astro 4 + Content Collections | SvelteKit 2 + Svelte 5 Runes |
| **Markdown Compiler** | `@astrojs/mdx` / Remark / Rehype | `mdsvex` + Shiki |
| **Reactivity System** | Client Islands (`client:load`) | Svelte 5 Runes (`$state`, `$derived`) |
| **Interactive Demos** | Astro `.astro` components | Native Svelte 5 `.svelte` components |
| **Static Adapter** | `@astrojs/static` | `@sveltejs/adapter-static` |
| **Client JS Footprint** | Minimal / zero JS by default | Extremely small (~3-5kb Svelte 5 runtime) |
