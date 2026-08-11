# Component extension models in comparable docs systems

> Research note, 2026-08-11. This note records the component boundaries visible in the
> referenced documentation sites before Acrolls finalizes its shell/content API.

## Summary

The three systems extend different layers of the documentation product:

| System | What the author extends | How it is exposed | What the framework still owns |
| --- | --- | --- | --- |
| [SVOCS](https://svocs.dev/docs/components) | Svelte content components and page-level metadata helpers | Import Svelte components from `$lib/components` in `.svx`; some components also have explicit import paths | The docs shell, routing, sidebar registration, and content compilation |
| [Svelte DocSmith](https://docsmith.geodask.com/docs/components/callout) | A framework-provided Svelte component API used from Markdown/Svelte content | Import named components such as `Callout` from `svelte-docsmith`; individual component pages document props and variants | The SvelteKit route, docs navigation, article layout, theming, and generated page chrome |
| [Blume](https://useblume.dev/docs/content/components) | MDX content primitives and project example previews | Built-in components are available in `.mdx` without imports; `Component` points at an example file and renders it in an isolated preview frame | The MDX compiler, generated docs shell, theme tokens, preview frame, and source highlighting |

## SVOCS

SVOCS describes its components as built-in Svelte components for `.svx` content. The page
explicitly directs authors to import them from `$lib/components`, with examples such as
`Callout`, `Tabs`, `Steps`, `Card`, `FileTree`, and `ImageZoom`. It also treats page icons
as a separate extension surface through `$lib/icons/PageIcon.svelte` and metadata.

This is a source-level extension model: the consumer owns the component files and imports
them into enhanced Markdown. SVOCS supplies the docs application and its content
conventions, but the component itself is a normal Svelte component rather than a slot in
the docs shell.

## Svelte DocSmith

The requested aggregate URL `/docs/components` currently resolves to a not-found page. Its
live navigation exposes individual pages under `/docs/components/*`, including Callout,
Steps, Card & CardGrid, Tabs, Accordion, Badge, Kbd, File Tree, Props Table, and Landing
Page.

The live Callout page shows the public usage boundary as:

```ts
import { Callout } from 'svelte-docsmith';
```

DocSmith therefore presents a package-level named-component API. The docs page is itself a
real SvelteKit route and documents component behavior, props, and variants inside the same
framework-owned article shell. The author extends article content with named Svelte
components; the site scaffolding and navigation remain DocSmith-owned.

## Blume

Blume takes the most content-authoring-oriented approach. Its component page says that the
built-in set is available in any `.mdx` page with no imports, and lists cards, steps, tabs,
badges, file trees, accordions, code groups, frames, columns, panels, type tables, and more.
The content author extends the MDX vocabulary directly.

Blume also has a distinct `Component` primitive for documentation of project components.
That primitive points to a file under `examples/`, renders a live preview beside highlighted
source, and uses an isolated frame so docs typography and theme chrome do not leak into the
example. The frame receives Blume tokens and optional example CSS, while the example may be
React, Vue, Svelte, or Astro.

## Implication for Acrolls

Acrolls should keep three extension boundaries separate:

1. **Content components:** `@acrolls/svelte` / SVX components such as `Publication`,
   `Callout`, `Figure`, and future interactive content primitives.
2. **Navigation primitive:** `DocsSidebar`, which supplies generated navigation behavior
   without claiming the host's page-level grid.
3. **Composed page shell:** `DocsShell`, which owns the left nav rail, article body grid,
   optional TOC rail, breadcrumbs, and pager when the host wants a complete docs layout.

The Fractal Mandala finding confirms that the navigation primitive must remain independently
embeddable. A host that already owns a sidebar / center / sidebar app shell should place
`DocsSidebar` in its existing rail rather than nest `DocsShell` inside the center column.
This preserves Acrolls' responsibility for generated links, hierarchy, active state, and
filtering while preserving the host's responsibility for page-level layout and styling.

The full shell still needs an explicit `fullBleed` escape hatch for hosts that cannot move it
outside a constrained wrapper, but that is a compatibility mode—not the sidebar-only
composition.
