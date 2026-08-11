# Getting started

Goal: in one existing SvelteKit app, render a Markdown page with Acrolls article styling, then (optionally) wrap a docs area with the shell.

**Time:** ~15 minutes if the app already uses Svelte 5 + Kit 2.

For the next drop-in trial, use the CLI-led path first. Run `acrolls onboard` from the host root,
follow the returned checkpoints, and use this guide when you need the human-readable detail
behind a generated file.

---

## Recommended: CLI-led installation

Build Acrolls once, then ask the CLI to inspect the existing SvelteKit host:

```bash
# terminal 1 — Acrolls clone
cd /path/to/acrolls
pnpm install
pnpm build

# terminal 2 — existing host root
cd /path/to/your-sveltekit-app
node /path/to/acrolls/packages/cli/dist/index.js onboard --docs-dir docs --base-href /docs
```

For an agent or another UI, render the same plan as JSON:

```bash
node /path/to/acrolls/packages/cli/dist/index.js \
  onboard --non-interactive --docs-dir docs --base-href /docs --json
```

The walkthrough is read-only. It tells you what to add to `svelte.config.js`, the host layout,
the generated docs source, the docs routes, and the document renderer. It also runs through
corpus validation, local browser checks, production build, and deployment verification. Use the
manual sections below only for the checkpoint you are currently completing.

If the CLI reports `detected node`, you are not in an existing SvelteKit host; change into the
host root before rerunning it.

---

## 0. Build Acrolls (once)

```bash
cd /Users/amrit/acrolls   # or your clone path
pnpm install
pnpm build
```

Confirm:

```bash
ls packages/mdsvex/dist/index.js
ls packages/svelte/dist/index.js
ls packages/docs/dist/index.js
ls packages/styles/default.css
```

---

## 1. Add packages to your app

From **your SvelteKit project root**:

```bash
pnpm add \
  file:/Users/amrit/acrolls/packages/mdsvex \
  file:/Users/amrit/acrolls/packages/svelte \
  file:/Users/amrit/acrolls/packages/styles \
  file:/Users/amrit/acrolls/packages/docs

pnpm add -D mdsvex
```

If `pnpm` complains about `workspace:*` from a package, only add the four above — do **not** add `@acrolls/sveltekit` via `file:` until published (it has workspace deps). Import the mdsvex preprocessor from `@acrolls/mdsvex` instead.

---

## 2. Wire mdsvex in `svelte.config.js`

```js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { createAcrollsMdsvexPreprocessor } from '@acrolls/mdsvex';

const acrolls = createAcrollsMdsvexPreprocessor({
  // no default layout — you wrap with Publication in the page/layout
  extensions: ['.md', '.svx']
});

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', '.md', '.svx'],
  preprocess: [vitePreprocess(), acrolls],
  kit: { adapter: adapter() }
};

export default config;
```

Full file: [snippets/svelte.config.js](./snippets/svelte.config.js).

---

## 3. Minimal article page (no docs shell)

**`src/routes/blog/hello.md`**

```md
---
title: Hello Acrolls
description: First article
---

# Hello Acrolls

Write normal Markdown. Code fences get Shiki:

```ts filename="src/hi.ts" lineNumbers
export const hi = 'acrolls';
```
```

**`src/routes/blog/hello/+page.svelte`** — if you prefer a folder route, or import the md:

```svelte
<script lang="ts">
  import Article from './hello.md';
  import { Publication } from '@acrolls/svelte';
  import '@acrolls/styles/default.css';
</script>

<main class="wrap">
  <Publication>
    <Article />
  </Publication>
</main>

<style>
  .wrap {
    max-width: 70ch;
    margin: 2rem auto;
    padding: 0 1rem;
  }
</style>
```

Or use a catch-all that loads `*.md` with `import.meta.glob` (see [integrate-sveltekit.md](./integrate-sveltekit.md)).

---

## 4. Run

```bash
pnpm dev
# open the route that renders your .md
```

You should see:

- Readable article measure (default CSS)  
- Code frame with filename + copy/wrap after hydrate  
- Heading anchors on hover  

---

## 5. Optional: docs shell for a `/docs` area

See [docs-shell.md](./docs-shell.md) for a manually authored shell. If you use the
generated source in the next section, `docs.nav` replaces the hand-written object. Short
version:

1. Define or generate a `DocsNav` object
2. Put `<DocsShell>` in `src/routes/docs/+layout.svelte`  
3. Render articles with `<Publication>` inside pages  

---

## 6. Generate a docs area from Markdown

If your docs live in a directory, Acrolls can build the navigation and route records from
the files instead of maintaining a hand-written `DocsNav` object. You do not need to
organize the files under a directory literally named `docs`; `content/`, `posts/`, or any
other host-owned directory works the same way.

Three paths are independent:

| Concern | Example | Purpose |
|---|---|---|
| Filesystem content root | `../../docs` | Where the Markdown files live relative to `source.ts` |
| Public URL root | `/docs` | The URL prefix Acrolls generates for the documents |
| SvelteKit route directory | `src/routes/docs` | The route that renders the docs shell |

For example, the same content can be served as `/docs`, `/content`, or `/posts` by
changing `baseHref` and placing the catch-all route under the corresponding SvelteKit
route directory. The filesystem directory and public URL do not have to share a name.

Put Markdown files in a content directory. `index.md` becomes the route for its containing
folder:

```text
docs/
├── index.md
├── guides/
│   ├── index.md
│   └── installation.md
└── reference/
    └── configuration.md
```

Create `src/lib/docs/source.ts`. This example uses `docs/`, but replace both glob paths
and `contentPrefix` if your content lives under `content/` or `posts/`:

```ts
import type { Component } from 'svelte';
import {
  createDocsContentSource,
  defineDocsConfig,
  type DocsMetadata
} from '@acrolls/docs/content';

type DocsArticle = Component;
const contentPrefix = '../../docs/';

const modules = import.meta.glob('../../docs/**/*.md', {
  import: 'default'
}) as Record<string, () => Promise<DocsArticle>>;

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
    subtitle: 'Generated from Markdown'
  })
});
```

The source interprets the filesystem tree as navigation automatically. You do **not** need to
list every directory in `folders`:

- The first directory level becomes a top-level `DocsNav` section.
- Markdown files directly inside that directory become section items.
- Deeper directories become nested groups with their own child items.
- `index.md` becomes the route for its containing directory.

The source provides:

- `docs.nav` — generated `DocsNav` for `DocsShell`
- `docs.get(slug)` — document lookup for route validation
- `docs.load(slug)` — lazy document loading
- `docs.entries()` — route entries for prerendering

Titles come from frontmatter. Folder names are humanized by default and can be overridden
selectively in `folders`; omit `folders` entirely when the natural filesystem structure is what
you want. For example, `docs/foo/bar.md` becomes `/docs/foo/bar`, while `docs/foo/index.md`
becomes `/docs/foo`. Set `hidden: true` in frontmatter or configuration to remove a page from
navigation while keeping it routable; it is not an access-control mechanism.

Use `folders` only for presentation overrides such as a human-friendly title, ordering, badge,
hidden state, default-open state, or a custom landing filename:

```ts
folders: {
  api: { title: 'API', order: 1 },
  // Other directories continue to be discovered automatically.
}
```

`@acrolls/sveltekit` contains a convenience adapter used by this monorepo's workspace
example. When working from the local Acrolls packages, use the pure `@acrolls/docs/content`
source shown above: the SvelteKit adapter is not yet safe to install through `file:`.

Add a docs layout using the generated nav:

```svelte
<script lang="ts">
  import '@acrolls/styles/default.css';
  import '@acrolls/docs/styles.css';
  import { page } from '$app/state';
  import { DocsShell } from '@acrolls/docs';
  import { docs } from '$lib/docs/source';
  import type { Snippet } from 'svelte';

  let { children }: { children: Snippet } = $props();
</script>

<DocsShell nav={docs.nav} pathname={page.url.pathname}>
  {@render children()}
</DocsShell>
```

Then use a root page and catch-all route under the same public URL prefix. For `/docs`,
the route directory is `src/routes/docs`; for `/content`, it would be
`src/routes/content`. The root page renders the discovered `docs/index.md` (whose slug is
an empty string); it does **not** redirect to an arbitrary child. Use `[...slug]`, rather
than `[slug]`, whenever nested folders are allowed:

```ts
// src/routes/docs/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = () => ({ slug: '' });
```

```svelte
<!-- src/routes/docs/+page.svelte -->
<script lang="ts">
  import DocumentPage from '$lib/docs/DocumentPage.svelte';
</script>

<DocumentPage slug="" />
```

If the docs area needs a host-authored overview instead, write that in `+page.svelte` and
omit the root `+page.ts`; do not add `docs/index.md` for that route.

```ts
// src/routes/docs/[...slug]/+page.ts
import { error } from '@sveltejs/kit';
import type { EntryGenerator, PageLoad } from './$types';
import { docs } from '$lib/docs/source';

export const entries: EntryGenerator = () =>
  docs.documents
    .filter((document) => document.slug)
    .map((document) => ({ slug: document.slug }));

export const load: PageLoad = ({ params }) => {
  const slug = params.slug ?? '';
  if (!docs.get(slug)) error(404, `Documentation page "${slug || 'index'}" not found`);
  return { slug };
};
```

```svelte
<!-- src/routes/docs/[...slug]/+page.svelte -->
<script lang="ts">
  import DocumentPage from '$lib/docs/DocumentPage.svelte';
  let { data }: { data: { slug: string } } = $props();
</script>

<DocumentPage slug={data.slug} />
```

In `DocumentPage.svelte`, load the matching component and render it inside your existing
article presentation:

```svelte
<script lang="ts">
  import { docs } from '$lib/docs/source';
  import { Publication } from '@acrolls/svelte';
  let { slug }: { slug: string } = $props();
  const document = $derived(docs.get(slug));
</script>

{#if document}
  {#await document.loader() then Article}
    <Publication>
      <Article />
    </Publication>
  {/await}
{:else}
  <p>Documentation page not found.</p>
{/if}
```

Copy-ready versions live in [snippets/docs-source.ts](./snippets/docs-source.ts),
[snippets/docs-generated-layout.svelte](./snippets/docs-generated-layout.svelte),
[snippets/docs-root-page.svelte](./snippets/docs-root-page.svelte),
[snippets/page-load.ts](./snippets/page-load.ts), and
[snippets/document-page.svelte](./snippets/document-page.svelte). The working workspace
example is in [`examples/kit-consumer`](../examples/kit-consumer/); it intentionally uses
the workspace-only SvelteKit adapter and is not the external `file:` install path.

## 7. Validate content from the CLI

```bash
/Users/amrit/acrolls/packages/cli/dist/index.js validate ./src/routes/blog/hello.md
/Users/amrit/acrolls/packages/cli/dist/index.js studio ./src/routes/blog/hello.md
```

---

## Checklist

- [ ] `pnpm build` succeeded in acrolls monorepo  
- [ ] Host has `mdsvex` + four `@acrolls/*` packages  
- [ ] `svelte.config.js` uses `createAcrollsMdsvexOptions`  
- [ ] Extensions include `.md` / `.svx`  
- [ ] CSS imported once (`default` or `foundation`)  
- [ ] Body wrapped in `Publication`  
- [ ] `pnpm dev` shows the article  
- [ ] Docs root renders `docs/index.md` (or a deliberate host-owned overview)
- [ ] A nested docs URL renders through `[...slug]`
- [ ] `pnpm build` succeeds in the host

If something fails → [troubleshooting.md](./troubleshooting.md).
