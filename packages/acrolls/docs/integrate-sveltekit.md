# Integrate into SvelteKit

Step-by-step host wiring. Assumes packages are already installed ([local-install.md](./local-install.md)).

---

## A. Compiler (`svelte.config.js`)

Use **`createAcrollsMdsvexPreprocessor` from `@acrolls/mdsvex`** (not `@acrolls/sveltekit` until published). It normalizes unsafe Markdown before mdsvex parses it.

```js
import adapter from '@sveltejs/adapter-auto'; // or adapter-vercel, etc.
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createAcrollsMdsvexPreprocessor } from '@acrolls/mdsvex';

const acrolls = createAcrollsMdsvexPreprocessor({
  extensions: ['.md', '.svx'],
  // Opt into safe migration pages for an existing Markdown corpus.
  // onInvalidDocument: 'error-page'
  // layout: omit for full control, or set a path to a layout .svelte
  // strict: true  // fail on unknown fence languages
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md', '.svx'],
  preprocess: [vitePreprocess(), acrolls],
  kit: {
    adapter: adapter()
  }
};

export default config;
```

### Options you care about

| Option | Default | Meaning |
|---|---|---|
| `extensions` | `['.svx','.md']` | Files mdsvex pretreats |
| `layout` | none | mdsvex layout map or string path |
| `strict` | `false` | Unknown code languages error instead of plaintext |
| `onInvalidDocument` | `fail` | `fail` or Markdown-only `error-page` in migration mode |
| source safety | enabled | Markdown-only Svelte-shaped literals are wrapped as inline code before parsing |

Do **not** set a global Publication layout unless every Markdown file on the site is an article (including random READMEs in routes). Prefer wrapping with `Publication` only on docs/blog routes.

For an existing corpus, preflight it first and opt into the same invalid-document policy in
the host:

```bash
acrolls validate ./docs --mode migration --on-invalid error-page --report acrolls-report.json
```

The preprocessor catches the transformed Svelte parse boundary for `.md` files and returns a
safe diagnostic module when `onInvalidDocument: 'error-page'` is enabled. The default remains
`fail`, so a host that does not opt into migration behavior keeps its existing build gate.

---

## B. TypeScript (optional but useful)

**`src/app.d.ts`** (merge with existing):

```ts
declare module '*.md' {
  import type { Component } from 'svelte';
  export default Component;
  export const metadata: Record<string, unknown>;
}

declare module '*.svx' {
  import type { Component } from 'svelte';
  export default Component;
  export const metadata: Record<string, unknown>;
}
```

---

## C. Styles

Pick **one** mode and import **once** per docs/blog surface (layout is ideal).

```ts
// Full editorial preset (good for greenfield)
import '@acrolls/styles/default.css';

// Or mechanics only (host already owns type scale / colors)
import '@acrolls/styles/foundation.css';
```

Bridge host tokens (optional):

```css
:root {
  --font-body: 'Your Serif', Georgia, serif;
  --font-heading: system-ui, sans-serif;
  --font-mono: ui-monospace, monospace;
  --foreground: #171714;
  --muted-foreground: #5c5c56;
  --border: #deded8;
  --accent: #6d28d9;
  --card: #fafaf7;
  --background: transparent;
  --radius: 0.75rem;
}
```

Foundation/default read these fallbacks via `--acrolls-*` mapping. Details: [styles.md](./styles.md).

---

## D. Pattern 1 — single imported article

```
src/routes/notes/
  first.md
  +page.svelte
```

**`+page.svelte`**

```svelte
<script lang="ts">
  import First from './first.md';
  import { Publication } from '@acrolls/svelte';
  import '@acrolls/styles/default.css';
</script>

<Publication>
  <First />
</Publication>
```

---

## E. Pattern 2 — generated docs tree

Use the content-source layer when the docs are maintained as a directory tree. The
filesystem root, public URL prefix, and SvelteKit route directory are independent choices:

| Filesystem | Public URL | SvelteKit route |
|---|---|---|
| `docs/**/*.md` | `/docs/...` | `src/routes/docs/` |
| `content/**/*.md` | `/content/...` | `src/routes/content/` |
| `posts/**/*.md` | `/posts/...` | `src/routes/posts/` |

The first directory level becomes a navigation section, files inside it become section
items, and deeper directories become nested groups. `index.md` becomes the route for its
containing directory. This means a tree such as:

```text
docs/
├── text-collection-organization/
│   ├── grammatical-studies.md
│   └── literary-works/
│       └── classical-kavya.md
└── user-guide/
    ├── getting-started.md
    └── reading-texts.md
```

can generate `DocsNav` sections for `Text Collection Organization` and `User Guide`
without a hand-written `nav.ts`.

Create `src/lib/docs/source.ts`:

```ts
import type { Component } from 'svelte';
import {
  createDocsContentSource,
  defineDocsConfig,
  type DocsMetadata
} from '@acrolls/docs/content';

const contentPrefix = '../../docs/';
const modules = import.meta.glob('../../docs/**/*.md', {
  import: 'default'
}) as Record<string, () => Promise<Component>>;
const metadata = import.meta.glob('../../docs/**/*.md', {
  eager: true,
  import: 'metadata'
}) as Record<string, DocsMetadata>;

export const docs = createDocsContentSource({
  documents: Object.entries(modules).map(([key, load]) => ({
    key: key.slice(contentPrefix.length),
    metadata: metadata[key],
    load
  })),
  config: defineDocsConfig({
    title: 'Documentation',
    baseHref: '/docs',
    subtitle: 'Guides and reference'
  })
});
```

Use `docs.nav` in `DocsShell`, `docs.get(params.slug)` for validation, and
`docs.entries()` for static route entries. The external local-install path supports Markdown
sources (`.md`) here; `.svx` can still be imported through normal mdsvex routes, but automatic
content discovery is Markdown-first. The workspace-only `@acrolls/sveltekit` adapter will
offer the same source shape when it is published as an installable package.

Use a catch-all route for nested documents:

```text
src/routes/docs/
├── +layout.svelte
├── +page.svelte
└── [...slug]/
    ├── +page.ts
    └── +page.svelte
```

The complete root page, catch-all files, and lazy `DocumentPage` are in
[`getting-started.md`](./getting-started.md). The root route renders `docs/index.md` rather
than redirecting; omit that source only when the host writes its own `/docs` overview. A
single `[slug]` route is only enough when every document is flat.

---

## F. Pattern 3 — `.svx` with components

```svx
---
title: With callout
---

<script>
  import { Callout, Figure } from '@acrolls/svelte';
</script>

<Callout variant="insight" title="Tip">
  SVX can import Svelte components.
</Callout>
```

Open only trusted local SVX (it is executable).

---

## G. What **not** to do

1. Import Acrolls CSS in root layout **and** docs layout twice (duplicated rules — pick one place).  
2. Use `createAcrollsMdsvexPreprocessor` from `@acrolls/mdsvex` while the adapter package is only `workspace:*`; it includes the Markdown source-safety layer.
3. Put non-article Markdown under the same extensions without wrapping (or they get Shiki transforms but no shell — usually fine).  
4. Expect Studio to execute full SVX component trees (Studio HTML pipeline strips `<script>` for safety).  

---

## H. Adapter note

Acrolls is adapter-agnostic (static, Node, Vercel). Ensure `md` / `svx` routes are not excluded from prerender if you prerender docs.
