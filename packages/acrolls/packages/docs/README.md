# @acrolls/docs

**Fumadocs-class documentation shell for SvelteKit.**

Config-driven navigation, nested accordions, on-page TOC, breadcrumbs, prev/next pager, and persisted open state — without owning your content pipeline. Pair with `@acrolls/mdsvex` + `@acrolls/svelte` `Publication` for article bodies.

## Install

Until the scoped runtime packages are published, install supported packages from a built local
Acrolls clone:

```bash
pnpm add \
  file:/path/to/acrolls/packages/docs \
  file:/path/to/acrolls/packages/svelte \
  file:/path/to/acrolls/packages/styles \
  file:/path/to/acrolls/packages/mdsvex
pnpm add -D mdsvex
```

Do not install `@acrolls/sveltekit` through `file:` yet: it has workspace-internal
dependencies. Rebuild Acrolls, run `pnpm install` in the host, and restart the host dev
server after a local package update.

```js
import '@acrolls/docs/styles.css';
import '@acrolls/styles/foundation.css'; // or default.css
import { DocsShell, type DocsNav } from '@acrolls/docs';
```

## Generated content source

For a Markdown-first external host, use the pure source entry from `@acrolls/docs/content`.
The generated source owns the document records, routes, metadata, `DocsNav`, breadcrumbs,
pager order, and static route entries together:

```ts
import { createDocsContentSource, defineDocsConfig } from '@acrolls/docs/content';

const docs = createDocsContentSource({
  config: defineDocsConfig({
    title: 'Documentation',
    baseHref: '/docs'
  }),
  documents: [
    {
      key: 'index.md',
      metadata: { title: 'Welcome' },
      load: () => import('./content/index.md').then((module) => module.default)
    }
  ]
});
```

Folder names are humanized by default, so `guides/advanced` becomes nested `Guides` →
`Advanced` navigation without any folder configuration. You can omit `folders` entirely.
Typed configuration is only for presentation overrides such as folder labels, ordering,
visibility, badges, and landing filenames. `hidden: true` means unlisted from docs navigation;
it does not make a page private.

For example, this overrides one folder while all other folders remain automatic:

```ts
folders: {
  guides: { title: 'Guides & tutorials', order: 1 }
}
```

When the host owns a different information architecture from the filesystem, use `entries`
to define links, levels, page/group roles, landing pages, and route overrides. Acrolls uses
that definition to scaffold navigation, routes, breadcrumbs, pager order, and static
entries. Filesystem nesting and `index.md` are fallback conventions only.

```ts
entries: {
  guides: {
    kind: 'group',
    landing: 'guides/index.md'
  },
  'guides/installation': {
    parent: 'guides',
    href: '/docs/guides/install'
  }
}
```

The pure entry is intentionally separate from the Svelte component barrel so it can be
used from SvelteKit configuration and build-time source code without evaluating `.svelte`
components.

The current automatic source contract discovers `.md` files. Normal mdsvex routes may use
`.svx`; automatic `.svx` discovery is deliberately deferred. The workspace-only
`@acrolls/sveltekit` adapter accepts source globs directly and is used by
`examples/kit-consumer`, but it is not the external local-install path.

## Nested nav

```ts
export const developerNav: DocsNav = {
  title: 'Developer',
  baseHref: '/docs/developer',
  storageKey: 'dharmalib-developer', // localStorage namespace
  sections: [
    {
      id: 'core',
      title: 'Core systems',
      defaultOpen: true,
      items: [
        { title: 'Architecture', href: '/docs/developer/architecture' },
        {
          id: 'data',
          title: 'Data layer',
          defaultOpen: true,
          children: [
            { title: 'Corpus pipeline', href: '/docs/developer/corpus-pipeline' },
            { title: 'Artifact contracts', href: '/docs/developer/artifact-contracts' }
          ]
        }
      ]
    }
  ]
};
```

## Shell

```svelte
<script>
  import { page } from '$app/state';
  import { DocsShell } from '@acrolls/docs';
  import { developerNav } from '$lib/docs/developer-nav';
  import '@acrolls/docs/styles.css';
  let { children } = $props();
</script>

<DocsShell
  nav={developerNav}
  pathname={page.url.pathname}
  homeHref="/"
  homeLabel="App"
  showToc={true}
  persistOpen={true}
>
  {@render children()}
</DocsShell>
```

If the host already owns the page-level layout, compose only the generated navigation in its
existing sidebar:

```svelte
<script>
  import { page } from '$app/state';
  import { DocsSidebar } from '@acrolls/docs';
  import { developerNav } from '$lib/docs/developer-nav';
</script>

<main class="appbody">
  <aside class="sidebarleft">
    <DocsSidebar nav={developerNav} pathname={page.url.pathname} filterable />
  </aside>
  <article class="bodymain">{@render children()}</article>
  <aside class="sidebarright"><!-- host-owned TOC or tools --></aside>
</main>
```

Use `DocsShell` when Acrolls should own the complete docs page scaffold. If that complete
shell must remain inside a constrained host wrapper, pass `fullBleed`; otherwise prefer
mounting it outside the host's competing layout.

### Features

| Feature | API |
|---|---|
| Nested sidebar groups | `DocsNavNode.children` (unlimited depth) |
| Accordion open state | `persistOpen` → `localStorage` key `acrolls-docs:open:<storageKey>` |
| On-page TOC | `showToc` scans `h2–h3` in the article (configurable levels) |
| Breadcrumbs | Auto from nav trail |
| Prev / next | Flattened leaf order |
| Mobile | Drawer sidebar + menu button |
| Filter | Sidebar search expands matching groups |
| Host-owned layout | `DocsSidebar` composes generated navigation into an existing rail |

## Roadmap (product)

Themes, full marketing/docs site, npm publish — see root `PRODUCT.md`.
