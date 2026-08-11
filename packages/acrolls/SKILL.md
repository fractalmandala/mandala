# Acrolls skill

Use when integrating or authoring publication content with **Acrolls** on SvelteKit.

## Install

For published packages, install the packages appropriate to the host. During local
development, add only `@acrolls/svelte`, `@acrolls/styles`, `@acrolls/mdsvex`, and (for a
docs surface) `@acrolls/docs` through `file:` paths. Do not add `@acrolls/sveltekit` through
`file:` yet: it has workspace-internal dependencies. See `docs/local-install.md`.

## Wire SvelteKit

1. Extend `svelte.config.js` with `createAcrollsMdsvexPreprocessor()` from `@acrolls/mdsvex` and extensions `.svx`, `.md`. Use `onInvalidDocument: 'error-page'` only for an explicitly chosen migration corpus.
2. Import `@acrolls/styles/default.css` (or `foundation.css`) in root layout.
3. Wrap article content with `Publication` or use the provided mdsvex layout.
4. Write content as `.md` / `.svx` with optional YAML frontmatter.

## Primitives in content

```md
---
title: Peer state
description: How peers negotiate
---

<Callout variant="insight" title="Note">
  Something important.
</Callout>

```ts filename="src/peer.ts" lineNumbers highlight="2-3"
export type State = 'choked' | 'interested';
```
```

Use `Figure`, `Banner`, `Video` as imported Svelte components in `.svx` or via mdsvex components map.

## CLI

Use the built local binary until the CLI is published:

```bash
/path/to/acrolls/packages/cli/dist/index.js validate ./content/article.md
/path/to/acrolls/packages/cli/dist/index.js studio ./content/article.md
```

For a local external host, follow the handbook rather than `integrate`; its generator targets
the future registry package layout.

## Invariants

- Source file is authoritative.
- Host owns chrome, routing, theme toggle.
- Prefer foundation mode when host already styles prose.
- Never invent a second document store in Studio.
