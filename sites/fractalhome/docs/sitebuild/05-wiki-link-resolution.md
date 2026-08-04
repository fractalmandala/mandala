---
title: Wiki Link Resolution
description: Root-causing why [[Wiki Links]] stayed literal in Blume builds — the persisted content-store cache.
---

Continuing from `04-backlinks.md`: the `[[Agentic Systems]]` test stayed literal even after wrapping `config.markdown.processor`. This doc records the full investigation and the actual fix.

## The two false trails

Before the real cause surfaced, two things looked like they should work but didn't:

1. **`updateConfig({ markdown: { processor: wrapped } })`.** The hook runs, and in `astro:config:done` the final config *does* carry the wrapped `createRenderer`. But it was never invoked during the build — the content never went through it.
2. **In-place mutation** of `config.markdown.processor.createRenderer` (so components that captured the original processor object reference would see the wrapper). Still no invocation.

Instrumenting Astro's own code (`content-layer.js` `#processMarkdown`, `vite-plugin-markdown/content-entry-type.js` `getRenderFunction`, `content/loaders/glob.js`, `content/runtime.js` `renderEntry`) proved the point:

- `renderEntry` is called for every page and reports `deferredRender=false, hasRendered=true`.
- But the **glob loader's render branch never fired** — meaning the `.md` files were never re-rendered during sync.

So the rendered HTML was coming from *somewhere*, just not from any path that called `createRenderer`.

## The real cause: a persisted content store

Astro's production sync loads the content store from disk:

```
content/paths.js:
  getDataStoreFile(settings, isDev) =>
    new URL(DATA_STORE_FILE, isDev ? settings.dotAstroDir : settings.config.cacheDir)
```

With Blume, the generated config root is `.blume/` (or `.blume-verify/` for `--isolated`), and Astro's default `cacheDir` is `./node_modules/.astro`. So the persisted store lives at:

```
.blume/node_modules/.astro/data-store.json          # real build
.blume-verify/node_modules/.astro/data-store.json   # blume build --isolated
```

The glob loader's `syncData` short-circuits on a matching digest:

```js
if (existingEntry && existingEntry.digest === digest && existingEntry.filePath) { … return; }
```

Our integration only became wired after the store was first populated — so every subsequent build reused the **stale pre-integration renders**, never re-rendering through the wrapper. Deleting `data-store.json` (and the `fonts/` cache dir alongside it) made the wrapper actually run on the next build.

## Why both wrapping approaches were needed

Astro's `runHookConfigSetup` copies the config shallowly once (`updatedConfig = { ...settings.config }`) and `updateConfig` **replaces** `updatedConfig` with a fresh merged object each call. Any component that captured `config.markdown.processor` during an *earlier* `astro:config:setup` (Astro's content entry type, Blume's integration) holds a reference to the **original** processor object — so a `updateConfig` replacement alone is invisible to them.

Final approach in `wiki-links.mjs` — do **both**:

```js
// 1. Patch the original processor object IN-PLACE so captured references
//    (Astro content entry type / Blume integration) see the wrapper.
if (typeof proc.createRenderer === "function")  proc.createRenderer  = wrapCreate(proc.createRenderer);
if (typeof proc.createMdxRenderer === "function") proc.createMdxRenderer = wrapCreate(proc.createMdxRenderer);

// 2. Push a shallow copy through updateConfig so renderers created later
//    from the merged config also get the wrapper.
updateConfig({ markdown: { processor: { ...proc } } });
```

The wrapper wraps the Sätteri renderer's `render`:

```js
const wrapRenderer = async (renderer) => {
  const r = await renderer;                                   // createRenderer is async
  if (!r || typeof r.render !== "function") return r;
  const orig = r.render.bind(r);
  r.render = async (content, opts) => orig(convertWikiLinks(content, resolve), opts);
  return r;
};
```

## How the converter works

`wiki-links.mjs` is a self-contained Blume integration (`blume-wiki-links`) registered via `integrations: [wikiLinks()]` in `blume.config.ts`.

- **Route map** (`buildMap`) — scans `docs/**/*.md|.mdx`, reads frontmatter `title`, registers `title`, `title.toLowerCase()`, and the lowercased filename; strips numeric/date prefixes (`01-`, `2026-08-02-`) from route slugs.
- **Conversion** — one regex per line, fence-aware (skips ` ``` ` / `~~~` blocks) and code-span aware (skips `` `...` ``):

  ```
  [[Page]]        →  [Page](/route)
  [[Page|label]]  →  [label](/route)
  ```

  Unknown names fall back to `/llmwiki/concepts/<slugified-name>`.
- **Both markdown and MDX** are covered — `createRenderer` (`.md`) and `createMdxRenderer` (`.mdx`).

## Verification

- `blume build --isolated` and plain `blume build` both pass: 74 pages, exit 0.
- Rendered `index.html` pages have **zero** raw `[[…]]` except two pages where it appears inside inline `<code>` spans (`sveltekit-routing`, `sitebuild/backlinks`) — intentional, the converter preserves code spans.
- Sample page `llmwiki/concepts/agent-harness-design` emits 31 distinct `/llmwiki/concepts/…` links.
- The single `.mdx` doc (`sveltekit/Svelte-5-Template-Directives.mdx`) is covered by the wrapper; it contains no wiki links, so nothing to convert there.
- The `.md`/`.mdx` raw-markdown endpoints (`/<route>.md`) still serve the verbatim source — `[[…]]` remaining there is correct.

## Gotchas / notes for the next session

- **Clear the store after changing `wiki-links.mjs`.** The digest cache won't re-render unchanged docs, so new resolution logic won't apply until `data-store.json` is deleted (and `fonts/` if it lingers):
  ```
  rm -f .blume/node_modules/.astro/data-store.json .blume-verify/node_modules/.astro/data-store.json
  rm -rf .blume/node_modules/.astro/fonts .blume-verify/node_modules/.astro/fonts
  ```
- `.DS_Store` inside `.blume-verify/` makes `rm -rf .blume-verify/dist` fail with "Directory not empty" — delete the `.DS_Store` first (or `find … -name .DS_Store -delete`).
- The Node/pnpm mismatch is still in play: `fnm exec --using 22.13.0 -- pnpm --filter fractalhome …` for any build/install command.
- A stale `blume dev` server on port 4321 still blocks plain `blume build`; prefer `blume build --isolated` for verification.
