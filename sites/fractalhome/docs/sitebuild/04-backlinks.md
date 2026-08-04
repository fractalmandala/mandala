---
title: Backlinks
description: Managing legacy docs which use double square bracket backlinks.
---

I checked the installed package's config schema — `markdown` is a strict Zod object allowing only `code`, `codeBlocks`, `headingAnchors`, and `imageZoom`. There is no `remarkPlugins`/`rehypePlugins` option and no built-in wiki-link/backlink support (the syntax docs never mention `[[…]]`).

Two ways to get it working:

1. **Custom Astro integration (least invasive).** Blume passes your top-level `integrations` through to the generated Astro runtime. A small integration can inject `markdown.remarkPlugins: [remark-wiki-link]` via `astro:config:setup` → `updateConfig`. Needs a `pageResolver` that maps titles to your routes (e.g. `[[Agentic Systems]]` → `/llmwiki/concepts/agentic-systems`) — buildable from `data.json`. Caveat: Blume's own markdown processors may override injected plugins; needs a quick test.
2. **`blume eject`** — gives you the real Astro project, where you add `remark-wiki-link` to `astro.config`'s markdown options directly and fully own the pipeline. One-way, but this is the "guaranteed" path.

Let me set up the test. First, inspect the generated Astro runtime to see how Blume configures markdown, and scan the wiki-links used in content.

Key finding: Blume overrides Astro's markdown with **custom processors** (`blumeMarkdownProcessor`/`blumeMdxProcessor` via `markdown.processor`), so `remarkPlugins` in the config won't apply — a processor-level override is what we need. That's injectable via an integration's `updateConfig`. Let me build the test.

Build passed. Now the real test — did `[[Agentic Systems]]` become a link?

Still literal — the link didn't get produced. Let me check whether the integration even ran and how the generated config looks now.

The integration IS passed to Astro. Let me isolate whether the processor-wrapping approach itself works, independent of Astro:

Only the CLI is compiled; the runtime is TS bundled at build time. Let me add debug tracing to the integration to see whether the hook runs and whether `config.markdown.processor` is present / our override is invoked.

No debug file — the `astro:config:setup` hook never ran. The integration isn't being invoked. Let me check how the generated config imports `blumeConfig`.

The config loader is `blume/core/load-module.ts`. Let me inspect how it loads `blume.config.ts` and whether integrations survive, plus add a module-level trace to `wiki-links.mjs`.

`loadBlumeConfig` uses jiti to import `blume.config.ts` and returns its default export. Let me add module-level traces to see whether `wiki-links.mjs` is even loaded:

### Objective

- Stand up `sites/fractalhome` as a Blume docs site and test whether `[[Wiki Links]]` can be resolved to real links via a custom Astro integration.

### Important Details

- Node on PATH is v22.12.0; pnpm v11 requires ≥22.13. Use `fnm exec --using 22.13.0 -- pnpm --filter fractalhome ...`.
- `blume dev` server runs on port 4321 → plain `blume build` aborts; always use `blume build --isolated` (writes `.blume-verify/dist`).
- Blume's `markdown` config is a strict Zod object allowing only `code`, `codeBlocks`, `headingAnchors`, `imageZoom` — no `remarkPlugins`/`rehypePlugins`, no built-in wiki-link support.
- Blume overrides Astro markdown with custom processors (`blumeMarkdownProcessor`, `blumeMdxProcessor` via `mdx({ processor })` in generated `.blume-verify/astro.config.mjs`) — so wiki-link support must wrap `config.markdown.processor`.
- `blume.config.ts` supports top-level `integrations` (passed through to generated Astro runtime).
- Navigation sidebar uses `display: "group"` for collapsible group accordions; font *sizes* are plain CSS (`.prose h2` is 1.5em via Tailwind Typography), override via `theme.css` at project root (`.prose h2` beats `.prose :where(h2)` via specificity).
- `dist/` is generated output, gitignored, and wiped on rebuild — never hand-place files there (a manually dropped `dist/_astro/fonts/GoogleSansFlex.woff2` is orphaned).