# Packages reference

| Package | Import | Role |
|---|---|---|
| `@acrolls/mdsvex` | `createAcrollsMdsvexPreprocessor`, `createAcrollsMdsvexOptions`, `renderAcrollsArticleHtml`, … | Compile pipeline + source safety |
| `@acrolls/svelte` | `Publication`, `Callout`, `Figure`, … | Article components |
| `@acrolls/styles` | CSS / SASS entrypoints | Article styles |
| `@acrolls/docs` | `DocsShell`, `DocsNav` types, helpers | Docs chrome |
| `acrolls` | installable binary wrapper | `acrolls onboard`, `validate`, `studio`, `integrate` |
| `@acrolls/cli` | CLI implementation package | Runtime behind the `acrolls` binary |
| `@acrolls/sveltekit` | Kit helpers | Workspace-only for now; do **not** add through `file:` in an external host |

---

## `@acrolls/mdsvex`

```ts
import {
  createAcrollsMdsvexOptions,
  renderAcrollsArticleHtml,
  parseFenceMeta,
  createAcrollsHighlighter
} from '@acrolls/mdsvex';
```

| Export | Use |
|---|---|
| `createAcrollsMdsvexPreprocessor(opts?)` | Preferred Svelte preprocessor; normalizes unsafe Markdown before mdsvex |
| `createAcrollsMdsvexOptions(opts?)` | Lower-level options object for direct `mdsvex(...)` usage |
| `normalizeAcrollsMarkdown(source, opts?)` | Normalize Markdown and return source-safety findings |
| `renderAcrollsArticleHtml(source)` | Studio / HTML preview string |
| `parseFenceMeta` | Test or custom tools |

---

## `@acrolls/svelte`

```ts
import {
  Publication,
  Banner,
  Callout,
  Figure,
  Video,
  ZoomableImage,
  PublicationLayout
} from '@acrolls/svelte';
```

Wrap article content with **`Publication`** so code-frame enhancement + mermaid run.

---

## `@acrolls/styles`

```
@acrolls/styles/foundation.css
@acrolls/styles/default.css
@acrolls/styles/sass/tokens.sass
```

---

## `@acrolls/docs`

```ts
import {
  DocsShell,
  DocsSidebar,
  DocsToc,
  DocsBreadcrumbs,
  DocsPager,
  flattenDocsNav,
  docsPager,
  buildDocsCrumbs,
  clearOpenState,
  type DocsNav,
  type DocsNavNode
} from '@acrolls/docs';

import '@acrolls/docs/styles.css';
```

---

## Local-host compatibility

For an external SvelteKit app using a local Acrolls clone, install only
`@acrolls/mdsvex`, `@acrolls/svelte`, `@acrolls/styles`, and `@acrolls/docs`. Import the
generated source API from `@acrolls/docs/content`. `@acrolls/sveltekit` is used by this
monorepo's workspace example and cannot currently be consumed safely through a `file:`
dependency because it declares `workspace:*` dependencies.

## Versioning

Monorepo packages currently track independent alpha versions (for example docs `0.3.x` and
SvelteKit helpers `0.2.x`). Pin local `file:` paths consciously, rebuild Acrolls before a
host refresh, and expect API changes before 1.0.
