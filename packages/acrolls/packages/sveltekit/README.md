# @acrolls/sveltekit

> Workspace-only adapter for now. It declares `workspace:*` dependencies and must not be
> installed through `file:` in an external SvelteKit app. For the supported local-host path,
> use `@acrolls/mdsvex` and `@acrolls/docs/content`; see [`../../docs/getting-started.md`](../../docs/getting-started.md).

```js
import { createAcrollsSvelteKitMdsvexPreprocessor } from '@acrolls/sveltekit';

preprocess: [vitePreprocess(), createAcrollsSvelteKitMdsvexPreprocessor()]
```

Also re-exports `createAcrollsMdsvexPreprocessor` from `@acrolls/mdsvex`. The preprocessor
normalizes narrow Svelte-shaped literals in Markdown before parsing while leaving `.svx`
components untouched. The lower-level options API is exercised by
`examples/kit-consumer` inside the Acrolls workspace and documents the intended published
adapter shape; it is not the current external installation contract.

## Generated Markdown docs

Point a SvelteKit host at any Markdown directory (`docs/`, `content/`, `posts/`, or a
custom path) with one lazy component glob and one eager metadata glob. The filesystem root,
public URL prefix, and SvelteKit route directory are independent:

```text
contentRoot: ../../docs       # filesystem location
baseHref: /docs               # public URL location
src/routes/docs/              # SvelteKit route location
```

The first directory level becomes a navigation section, files directly inside it become
items, and deeper directories become nested groups. `index.md` becomes the route for its
containing directory.

```ts
// src/lib/docs/source.ts
import type { Component } from 'svelte';
import { createAcrollsDocsSource, defineDocsConfig, type DocsMetadata } from '@acrolls/sveltekit';

const modules = import.meta.glob('../../content/**/*.md', { import: 'default' }) as Record<
  string,
  () => Promise<Component>
>;
const metadata = import.meta.glob('../../content/**/*.md', {
  eager: true,
  import: 'metadata'
}) as Record<string, DocsMetadata>;

export const docs = createAcrollsDocsSource({
  modules,
  metadata,
  contentRoot: '../../content',
  config: defineDocsConfig({
    title: 'Documentation',
    baseHref: '/docs',
    folders: {
      guides: { title: 'Guides' }
    }
  })
});
```

Use `docs.nav` for `DocsShell`, `docs.get(params.slug)` for route validation,
`docs.load(params.slug)` for the lazy document component, and `docs.entries()` for static
route generation. `index.md` maps to its containing folder route. The first automatic
source contract is Markdown-first; `.svx` remains supported through normal mdsvex imports
but is not automatically discovered by this helper yet.
