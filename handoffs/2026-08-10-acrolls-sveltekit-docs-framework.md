---
task: acrolls-sveltekit-docs-framework
status: active
host: grok-build
branch: acrolls main (independent repo); dharmalib main local dirty demo
boss: creator + svelte
updated: 2026-08-11
---

# Handoff — Acrolls (SvelteKit docs/publishing framework)

## Where we are

**Acrolls** lives at **`/Users/amrit/acrolls`** (own git, **not** inside mandala). Goal: Fumadocs-class docs + publication SDK for SvelteKit.

## Governing objective

The Mandala projects are intentional dogfooding and acceptance fixtures for Acrolls. The
objective is to use realistic SvelteKit consumers such as Mandala Repo and Fractal Mandala
to expose setup friction, content-shape edge cases, rendering failures, and confusing
documentation, then improve Acrolls until it is user- and market-ready. The consumer sites
are not separate end goals and their temporary wiring is not automatically the final Acrolls
API. Every site integration finding should be classified as one of:

- an Acrolls product/API gap;
- an Acrolls documentation or example gap; or
- a legitimate host-project decision.

The loop is: integrate a realistic host, verify rendered pages (not only type checks/builds),
capture the friction, fix the correct layer in Acrolls or the host, and repeat the same
documented workflow across the fixtures.

## Navigation findings from Fractal Mandala dogfooding

The content-source model must distinguish the public docs mount from a content page. A
configured `baseHref` such as `/docs`, `/blog`, or `/content` establishes the shell scope and
where navigation begins; it does not imply that the mount itself is a document. Only a root
`index.md` should create the mount's content page. If no root index exists, the host may supply
its own landing page or Acrolls may render a generated overview; it must not redirect to an
arbitrary first article.

The navigation tree should use the filesystem page-tree convention used by Fumadocs and Blume:

```text
docs/
├── index.md                              -> /docs
└── text-collection-organization/
    ├── index.md                          -> /docs/text-collection-organization
    ├── literary-works.md                  -> /docs/text-collection-organization/literary-works
    └── classical-kavya-literature/
        ├── index.md                      -> /docs/text-collection-organization/classical-kavya-literature
        └── stylistic-analysis.md          -> /docs/text-collection-organization/classical-kavya-literature/stylistic-analysis
```

A folder is therefore both a possible page and a group. Its index page is the folder link;
its remaining files and child folders are its children. A folder without an index remains a
non-linked group unless explicitly configured with a different index page. Files and folders
can coexist at the same level without a special case: files become page nodes, folders become
folder nodes, and folder nodes may have an optional index link plus child nodes.

Acrolls should support `index.md` by default and an optional folder-level override (for
example, a TypeScript config or `meta.json` `index`/`pagesIndex` field) when an existing file
such as `overview.md` should serve as the folder landing page. The current `DocsNavSection`
shape treats top-level sections as non-linked groups; this is a product gap because a top-level
section must be able to carry the same optional index link as every other folder node. The
long-term model should be a typed page/folder tree, with folder metadata controlling label,
order, default-open state, and optional explicit child order.

### Shipped and verified

| Layer | Package | Evidence |
|---|---|---|
| Compile | `@acrolls/mdsvex` | Shiki, fence meta, tables, slugs; `renderAcrollsArticleHtml` |
| Article UI | `@acrolls/svelte` | `Publication`, Callout, Figure, Mermaid enhance |
| Styles | `@acrolls/styles` | foundation + default CSS |
| **Docs shell** | **`@acrolls/docs` 0.3.0** | Nested nav, TOC, breadcrumbs, pager, localStorage open state, content source |
| CLI | `@acrolls/cli` | validate, studio (HTML preview), integrate --dry-run/--yes |
| **Self-serve docs** | `acrolls/docs/*.md` | Full handbook + snippets + checklist |

**Acrolls builds:** `pnpm build` green; `@acrolls/docs` unit tests green (5).  
**CLI:** `validate examples/starter/article.md` OK.  
**Human docs entry:** `/Users/amrit/acrolls/docs/README.md` (also linked from root README).  
**Agent rules:** `/Users/amrit/acrolls/AGENTS.md`.  
**gstack checkpoint:** `~/.gstack/projects/acrolls/checkpoints/20260810-152832-acrolls-docs-framework.md`.

The content-source/navigation layer is now implemented. `@acrolls/docs/content` provides
the pure builder: hosts supply Markdown module loaders and eager frontmatter metadata,
and it derives normalized routes, humanized folder labels, typed `DocsNav`, document
lookups, and route entries. `@acrolls/sveltekit` provides the SvelteKit glob adapter and
the kit-consumer example demonstrates generated docs routes. The comparison section uses
the local Scribe source at `/Users/amrit/acrolls/ref/scribe-main` as the concrete reference
for host ownership, reviewed integration, and package boundaries.

Review decisions remain: humanized folder labels by default, a first-class TypeScript
config API, optional later folder-only `meta.json` support, no YAML convention,
navigation-hidden-but-routable pages, and deferred automatic `.svx` discovery. Styling is
intentionally a later phase: custom CSS and pure indented SASS aligned with CUBE CSS,
informed by `/Users/amrit/mandala/packages/fractals-styler`; Tailwind is not part of the
direction.

Mandalarepo is now dogfooding the source layer through
`/Users/amrit/mandala/sites/mandalarepo/src/lib/docs/source.ts`. Its old hand-written docs
navigation is replaced by generated navigation and generated catch-all route entries. The
consumer currently includes the repaired `getting-started.md` page as a curated source;
the remaining legacy corpus should be added as it is repaired instead of reintroducing the
mdsvex failures that prompted the integration work.

### Dharmalib (demo only — not product)

Local trial at `/Users/amrit/dharmalib` (uncommitted):

- `file:` deps on acrolls packages  
- User + **developer** docs shells (`src/lib/docs/user-nav.ts`, `developer-nav.ts`)  
- `Publication` + foundation CSS on `/docs/user` and `/docs/developer`  
- User does **not** prioritize committing dharmalib; use as dogfood.

### Product decisions (do not re-litigate)

1. Independent monorepo from mandala/dharmalib.  
2. mdsvex `.md`/`.svx` dialect (not React MDX).  
3. CSS-first (foundation/default); themes later.  
4. No global mdsvex Publication layout — wrap per docs/blog routes.  
5. Hosts install via **`file:`** until npm; the current mandalarepo dogfood consumes the
   pure `@acrolls/docs/content` API because `@acrolls/sveltekit` still has workspace-only
   package dependencies and should not be file-installed before publication.
6. Docs shell is first-class (nested `DocsNavNode.children`, TOC, persist).  
7. Self-serve docs before themes so user can trial hosts alone.  
8. Next big product steps: themes → acrolls site → npm publish.

## Verification and remaining work

### FractalSvelte integration correction (2026-08-11)

- FractalSvelte now forces Svelte runes mode only for authored `.svelte` files; mdsvex
  `.md`/`.svx` output and dependencies use compiler auto-detection.
- The Vercel adapter explicitly targets Node 24, allowing the host build to run from the
  local Node 25 toolchain while producing a supported deployment runtime.
- `@acrolls/mdsvex` now guarantees a named `metadata` export for documents without
  frontmatter. Export detection is syntax-aware (Acorn plus the Svelte TypeScript parser),
  so existing bindings, aliases, comments, strings, and Svelte 5 module scripts are safe.
- Acrolls mdsvex: 19 tests passing; package check and build passing. FractalSvelte:
  `svelte-check` reports 0 errors/0 warnings and the full Vercel-adapted Vite build passes.
- Fresh-review verdict: **ship**. No blocking correctness or public-contract issues remain.
- The local host's `file:` dependency cache was refreshed by pointing only
  `node_modules/@acrolls/mdsvex` at the Acrolls package; no workspace-wide module purge
  was performed. A normal install should refresh the copied package after Acrolls is built.

### Mandalarepo and FractalMandala wiring follow-up (2026-08-11)

- Mandalarepo's `svelte.config.js` mixed the old options API with the new preprocessor
  API and referenced three undefined identifiers. It now imports and uses
  `createAcrollsMdsvexPreprocessor()` directly; configuration evaluation and
  `svelte-check` pass with 0 errors/0 warnings.
- Mandalarepo's content glob resolved to nonexistent `src/docs`. It now points from
  `src/lib/docs/source.ts` to the site-root `docs/`, discovers all 619 documents, and
  generates catch-all entries. The build now reaches 27 raw-HTML/Svelte parsing failures
  in the generated `docs/html/**` corpus; routing and config are no longer the blocker.
- FractalMandala evaluates, checks, and completes its Vercel production build. It still
  uses `mdsvex(createAcrollsMdsvexOptions(...))`, so it bypasses the newer Acrolls
  source-safety and guaranteed-metadata preprocessor. Its 98 docs currently all have
  frontmatter, which masks the metadata-export risk.
- FractalMandala intentionally composes `DocsSidebar` into its existing global
  three-column shell rather than adopting `DocsShell`; this is an integration choice,
  but it omits Acrolls' integrated TOC, breadcrumbs, and pager.

Completed verification:

- Acrolls docs tests: 10 tests passing; package check passing.
- Acrolls SvelteKit adapter check passing.
- Kit-consumer example check and build passing.
- Full Acrolls build and check passing; the existing Publication `<slot>` deprecation
  warning remains.
- The primary [`docs/getting-started.md`](/Users/amrit/acrolls/docs/getting-started.md) now
  includes the generated Markdown source, root redirect, catch-all route, and lazy article
  rendering workflow.
- Mandalarepo `pnpm check`: 0 errors and 0 warnings.
- Mandalarepo production build compiles, but its Vercel adapter rejects the installed
  Node `v25.9.0`; rerun under Node 20, 22, or 24 for a complete deployment build.

Remaining (priority order):

- [ ] Expand mandalarepo's curated Markdown source list as the legacy corpus is repaired
- [ ] Add optional folder-level `meta.json` labels/order/default-open configuration
- [ ] Decide and implement automatic `.svx` discovery after the Markdown path is stable
- [ ] **User dogfood** other projects using only `acrolls/docs/` handbook; fix doc/code gaps from friction  
- [ ] **Themes** for docs shell + article (Fumadocs-grade density, light/dark)  
- [ ] **`examples/docs-site` or `sites/acrolls`** — Acrolls own docs built with Acrolls  
- [ ] **npm publish** `@acrolls/*`  
- [ ] CLI: `acrolls docs init`; improve integrate for real hosts  
- [ ] Optional later: Medium import, full SVX Studio, search  

## Gotchas

- After Acrolls package edits: `cd /Users/amrit/acrolls && pnpm build` then host `pnpm install` if `file:` cache is stale.  
- Frontmatter key **`metadata`** clashes with mdsvex export → use `reading`.  
- Shiki HTML must escape `{`/`}` for Svelte.  
- Studio strips SVX `<script>` for preview; use host `pnpm dev` for full SVX.  
- `integrate` from monorepo root reports `Host: node` — run inside a Kit app.  
- Mandala main worktree often dirty (openreel); do not `stash -u` across untracked preprojects.  
- Dharmalib trial is optional; **do not block** Acrolls work on dharmalib git hygiene.

## Key files

### Acrolls product

- `docs/README.md` — human self-serve index  
- `docs/getting-started.md`, `local-install.md`, `integrate-sveltekit.md`, `docs-shell.md`  
- `docs/snippets/*` — copy-paste host wiring  
- `docs/VISION.md` — product layers + roadmap  
- `AGENTS.md` — agent context  
- `packages/docs/` — shell implementation (`DocsShell`, `DocsNavTree`, `DocsToc`, `nav.ts`, `storage.ts`)  
- `packages/mdsvex/` — compile + HTML render  
- `packages/svelte/` — Publication  
- `packages/cli/` — validate / studio / integrate  
- `examples/starter/article.md`, `examples/kit-consumer/`  

### Dharmalib demo (optional)

- `src/lib/docs/user-nav.ts`, `developer-nav.ts`  
- `src/routes/docs/user/+layout.svelte`, `developer/+layout.svelte`  
- `docs/ACROLLS-TRIAL.md`  

## Resume commands

```bash
cd /Users/amrit/acrolls
pnpm install && pnpm build
# Self-serve: open docs/README.md
# Next product work: themes or examples/docs-site per VISION.md
```

## Session context-save

Also saved under gstack:  
`~/.gstack/projects/acrolls/checkpoints/20260810-152832-acrolls-docs-framework.md`  
Restore with host `/context-restore` when available.
