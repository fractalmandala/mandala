# Content authoring

Acrolls content is **source-owned** Markdown or mdsvex. Git is the CMS.

---

## File types

| Extension | Use |
|---|---|
| `.md` | Pure Markdown + YAML frontmatter; best default |
| `.svx` | Markdown + Svelte (import Callout, Figure, …) |

---

## Frontmatter

Frontmatter is optional. When it is absent, the Acrolls mdsvex preprocessor emits an
empty `metadata` export so eager metadata globs remain build-safe. Docs navigation then
falls back to the configured entry title or a humanized filename. A body `# Heading`
still renders normally, but it is not used as navigation metadata.

```md
---
title: Getting started
description: Orientation to the product
eyebrow: Guide
reading: 5 min
---
```

Common keys (for banners / metadata):

| Key | Purpose |
|---|---|
| `title` | Document title |
| `description` / `brief` | Subtitle |
| `eyebrow` / `series` / `project` | Small label above title |
| `reading` | Meta line (avoid key `metadata` — clashes with mdsvex export) |
| `image` / `imageAlt` | Banner image |

Acrolls uses these YAML frontmatter fields to display page titles and descriptions when the
standard `PublicationLayout` or `Banner` is used. With only `<Publication>`, frontmatter is
still available as `export const metadata` from the module, so a host-owned route must pass it
to `Banner` (or render an equivalent accessible header) if it composes the article itself.

For generated docs, frontmatter `title`, then `description` (or `brief`) supplies the
navigation record by default. A matching `documents` or `entries` configuration value in
`defineDocsConfig` takes precedence. Use configuration for deliberate navigation labels and
frontmatter for content-owned defaults.

### File URI links

Markdown link destinations cannot contain raw spaces. Exported `file://` references must
percent-encode them as `%20`; otherwise the Markdown parser preserves the source as literal
text instead of creating an anchor. Acrolls does not make a local file URI portable or resolve
it into a web route—the host owns that policy. A host may add its own link-normalization
preprocess, but hand-authored file URIs should already be encoded.

---

## Markdown features

### Headings

Stable slug ids + hover `#` anchors (compile-time). Prefer one `h1` per page if the shell already shows the title.

### Tables

GFM tables wrap in a keyboard-focusable scroll region.

```md
| State | Meaning |
| --- | --- |
| `choked` | Requests paused |
```

### Code fences

Shiki dual-theme (light/dark CSS variables). Meta fields:

```md
​```ts filename="src/peer.ts" lineNumbers highlight="2-4" focus="1-5" wrap
export type PeerState = 'choked' | 'unchoked';

export function canRequest(s: PeerState) {
  return s === 'unchoked';
}
​```
```

| Meta | Effect |
|---|---|
| `filename="…"` | Header label |
| `lineNumbers` | Gutter numbers |
| `wrap` | Soft-wrap by default |
| `highlight="2,4-6"` | Emphasize lines |
| `focus="2-5"` | Dim non-focused lines |
| `add="3-4"` / `remove="1"` | Diff colors |

Copy + wrap controls appear after hydration inside `Publication`.

### Mermaid

```md
​```mermaid
graph TD
  A[Start] --> B{Ok?}
  B -->|yes| C[Done]
​```
```

Renders client-side (lazy). Fallback shows source until JS runs.

### Literal examples in Markdown

Use inline code for syntax that resembles Svelte or a typed-language generic:

```md
The return type is `Result<T, String>` and the path is `content/<Category>/`.
```

The Acrolls preprocessor also protects a narrow set of these constructs automatically in
`.md` files. `.svx` files are intentionally not rewritten because they may contain real
Svelte components. Run `acrolls validate --strict` in CI when explicit authoring is preferred.

## Existing corpus migration

Acrolls distinguishes a controlled authored corpus from a folder of documents imported from
somewhere else. A missing frontmatter block is acceptable in migration mode and receives the
same readable filename fallback used by generated navigation. It is not evidence that the
document body is valid Svelte.

Preflight the entire directory before deployment:

```bash
acrolls validate ./docs --mode migration --on-invalid error-page --report acrolls-report.json
```

Each document is classified as `ready`, `normalized`, or `rejected`. A rejected Markdown
document can become a safe, routable “Document unavailable” page in migration `error-page`
mode, while valid documents continue to render. The diagnostic page is intentionally visible:
Acrolls does not silently discard broken source. Use authored mode or `--on-invalid fail` when
the deployment must be all-or-nothing.

This protection applies to `.md` prose. `.svx` is executable Svelte and remains trusted
content with fail-fast behavior; only open local `.svx` files that you intend to execute.

### Callouts / figures (SVX or imported components)

```svx
<script>
  import { Callout, Figure, Banner } from '@acrolls/svelte';
</script>

<Banner title="Release notes" description="What changed" />

<Callout variant="warning" title="Careful">
  Variants: note, insight, warning, success, error.
</Callout>

<Figure caption="Diagram" wide={true}>
  <img src="/diagram.svg" alt="…" />
</Figure>
```

### Images

Markdown images work. Zoomable dialog is available via `ZoomableImage` in SVX; plain `img` stays static unless you override components.

---

## What the compiler does **not** do

- Site search  
- i18n routing  
- Automatic Open Graph images  
- CMS draft workflows  

Those stay host responsibilities.

---

## Validate before shipping

```bash
/Users/amrit/acrolls/packages/cli/dist/index.js validate ./path/to/page.md
/Users/amrit/acrolls/packages/cli/dist/index.js validate ./path/to/page.md --strict
```

Strict mode fails on unsupported languages and hard errors.

---

## Studio (local authoring)

```bash
/Users/amrit/acrolls/packages/cli/dist/index.js studio ./path/to/page.md --mode default
```

- Source is truth (atomic Save)  
- Live Publication **HTML** preview (banner, code, tables, mermaid)  
- SVX `<script>` blocks stripped in preview for safety  
- Binds `127.0.0.1` only  

---

## Authoring tips

1. Keep docs pages focused; put long reference in nested nav groups.  
2. Use `foundation` CSS when your app already has a strong type system.  
3. Prefer `.md` unless you need interactive components.  
4. After changing Acrolls packages, rebuild Acrolls then refresh the host install.  
