---
task: mandalarepo-acrolls-docs-route
status: blocked
host: qoder
branch: feat/mandalarepo-acrolls-docs-route
boss: svelte
updated: 2026-08-11T11:05:00+05:30
---

# Handoff — Mandalarepo Acrolls docs route (DocsShell + generated nav)

> Independent of the v1 catch-all proof in
> `2026-08-11-acrolls-mandalarepo-docs.md` (different session).
> This file documents the full `DocsShell` + generated-content-source
> integration on top of the same mdsvex wiring.

## Where we are

`pnpm check` is green. `pnpm build` reaches the full 619-document corpus
through the new docs route and fails on 5 documents whose content was
authored without ` ```mermaid ` code fences — mdsvex treats the loose
mermaid blocks as Svelte template and chokes on `<|--`, `--> `, and
curly-quoted node labels.

The remaining failure is content cleanup, not an Acrolls bug. The
Acrolls framework is a passive consumer of Svelte component output;
the other 614 docs (and all docs that already wrap mermaid in code
fences) build and prerender correctly through the new route.

## What's in the branch

Commit `480a01841` on `feat/mandalarepo-acrolls-docs-route`,
merged into `main` so other agents can review:

- `.gitignore` — `mandalarepo` line removed (Vite's gitignore-aware
  glob needs to be able to read the untracked `docs/` directory).
- `pnpm-lock.yaml` — `@acrolls/*` and `mode-watcher` entries added.

The mandalarepo site is untracked in this monorepo, so the seven
new files inside it are not visible via `git log`; they are
visible in the file tree at
`/Users/amrit/mandala/sites/mandalarepo/`.

## Files added (untracked; live in the persistent worktree)

- `sites/mandalarepo/src/lib/docs/source.ts` — generated content
  source using `createDocsContentSource` from `@acrolls/docs/content`,
  with `import.meta.glob('../../../docs/**/*.md')` for both modules
  and metadata. Config: `title: 'Mandalarepo'`, `baseHref: '/docs'`,
  `subtitle: 'Knowledge base for the mandala monorepo'`,
  `storageKey: 'mandalarepo-docs'`.
- `sites/mandalarepo/src/lib/docs/DocumentPage.svelte` — lazy
  article renderer. `{#await document.loader() then Article}` wraps
  the result in `<Publication>` from `@acrolls/svelte`.
- `sites/mandalarepo/src/routes/docs/+layout.svelte` — imports
  `@acrolls/styles/foundation.css` and `@acrolls/docs/styles.css`,
  wraps `{@render children()}` in `DocsShell` with `docs.nav`,
  `pathname`, `homeHref="/"`, `filterable: true`,
  `showToc`/`showPager` toggled off at the `/docs` index, and a
  mandalarepo → acrolls CSS-variable token bridge in
  `:global(:root)`.
- `sites/mandalarepo/src/routes/docs/+layout.ts` —
  `export const prerender = true;` (needed so SvelteKit crawls
  the `[...slug]` catch-all during build).
- `sites/mandalarepo/src/routes/docs/+page.svelte` — host-authored
  overview with a per-section card grid; uses
  `flattenDocsNav(docs.nav)` to find the first leaf slug per
  top-level section.
- `sites/mandalarepo/src/routes/docs/[...slug]/+page.ts` —
  `entries: EntryGenerator` returns `{ slug }` for every
  `docs.documents[i].slug` so the build knows what to prerender;
  `load` validates the slug and 404s on miss.
- `sites/mandalarepo/src/routes/docs/[...slug]/+page.svelte` —
  delegates to `DocumentPage`.

The host's root `+layout.svelte` is intentionally left untouched —
non-docs pages keep their existing mandalarepo styling. The
Acrolls foundation CSS is scoped to the docs area only via the
docs `+layout.svelte` import.

## Why the build is blocked (and why it's not Acrolls)

The 5 failing files are:

- `sites/mandalarepo/docs/html/fractal-agentic/ai-agent-system/ai-agent-system.md`
- `sites/mandalarepo/docs/html/fractal-agentic/ai-agent-system/agent-configuration.md`
- `sites/mandalarepo/docs/html/fractal-agentic/ai-agent-system/boss-orchestration.md`
- `sites/mandalarepo/docs/html/fractal-agentic/ai-agent-system/skill-system.md`
- `sites/mandalarepo/docs/html/fractal-agentic/api-reference/cli-api/cli-api.md`

Pattern: the files contain ~30 mermaid diagrams
(`graph TB`, `flowchart TD`, `sequenceDiagram`, `classDiagram`,
`stateDiagram-v2`) that are bare text in the markdown body instead
of being wrapped in ` ```mermaid ` fences. mdsvex parses each
diagram as Svelte template and fails on the first angle-bracket
sequence (`<|--`, `--> `), with cascading
`element_implicitly_closed` and `element_invalid_closing_tag`
errors afterward.

Acrolls does not run mdsvex; it consumes Svelte components. The
proof that this is content-only is that the other 614 documents
build and prerender through the same route without issue.

## Open question

The user asked: "is the problem with Acrolls or with implementation?"
**Answer: implementation, but in the corpus, not the routing code.**

To unblock:

1. Wrap the ~30 loose mermaid blocks in ` ```mermaid … ``` ` fences.
   A small Node script at
   `sites/mandalarepo/scripts/wrap-mermaid.mjs` works: a line
   matching
   `^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|stateDiagram-v2|erDiagram|journey|gantt|pie|gitGraph)(\s|$)`
   outside a code fence, ending at the first blank line or a
   `^#{1,6}\s` heading, starts a block. Wrap and unescape `\_` →
   `_` inside the block (some generators emit `FRACTAL\_AGENTIC`,
   which mermaid cannot parse).
2. Decide whether to keep the generated `createDocsContentSource`
   (recommended by the Acrolls guide) or restore the legacy manual
   `docs-nav.ts` (4,295 lines, pre-Acrolls artifact). The generated
   source is the canonical pattern.
3. Re-run `pnpm check` and `pnpm build` from `sites/mandalarepo/`
   to confirm all 619 routes prerender.

## Decisions

- Use `createDocsContentSource` from `@acrolls/docs/content`, not
  the legacy manual `docs-nav.ts`. The guide treats the generated
  source as canonical; the manual file was a pre-Acrolls artifact.
- Use Acrolls's **Foundation** CSS, not the **Default** theme. The
  host site already has a type system; Foundation is a neutral base
  that can be bridged.
- Bridge the host's existing token names (`--background`,
  `--foreground`, `--primary`, `--border`, `--surface-1`,
  `--surface-2`, `--muted`, `--text-muted`) to `--acrolls-*`
  variables in the docs `+layout.svelte`. Non-docs pages keep their
  existing styling.
- Add `+layout.ts` with `prerender = true;` at the docs layout
  level. SvelteKit does not crawl `[...slug]` automatically; this
  is required for the catch-all to be prerendered.
- Suppress `showToc` and `showPager` at the `/docs` index (no
  article to show). Keep them on for all article pages.

## Gotchas

- `pnpm check` does not compile every Markdown module imported by
  a lazy Vite glob; only `pnpm build` does. Always run both gates.
- The mandalarepo site is untracked in this monorepo, so the new
  files are not visible in `git log`. They are visible in the file
  tree after the manual sync to the persistent worktree.
- Removing `mandalarepo` from `.gitignore` was required so Vite's
  gitignore-aware glob would find the untracked `docs/` directory.
  Without it, `import.meta.glob('../../../docs/**/*.md')` resolves
  to an empty object and prerender finds no `[...slug]` entries.
- The worktree's `.gitignore.bak` (a backup from the `sed` fix) is
  still present; harmless but worth removing in a follow-up.
- The main worktree holds unrelated uncommitted work on
  fractalmandala docs, etc. — do not reset, clean, or stash that
  work when landing further changes here.
- mdsvex is run by Vite through `createAcrollsMdsvexOptions`, not
  by Acrolls. The 5 broken files will fail to compile under any
  mdsvex-using Svelte site, not just under Acrolls.

## Key files

- `sites/mandalarepo/svelte.config.js` — `createAcrollsMdsvexOptions`
  wiring (untouched in this session; was already configured).
- `sites/mandalarepo/src/lib/docs/source.ts`
- `sites/mandalarepo/src/lib/docs/DocumentPage.svelte`
- `sites/mandalarepo/src/routes/docs/+layout.svelte`
- `sites/mandalarepo/src/routes/docs/+layout.ts`
- `sites/mandalarepo/src/routes/docs/+page.svelte`
- `sites/mandalarepo/src/routes/docs/[...slug]/+page.ts`
- `sites/mandalarepo/src/routes/docs/[...slug]/+page.svelte`
- `.gitignore` — `mandalarepo` line removed (commit `480a01841`).
- `pnpm-lock.yaml` — `@acrolls/*` and `mode-watcher` entries.
- `handoffs/2026-08-11-mandalarepo-acrolls-docs-route.md` — this note.
