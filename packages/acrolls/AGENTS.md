# AGENTS.md — Acrolls

Context for any coding agent working on **Acrolls** (`/Users/amrit/acrolls`).

## What this is

**Acrolls** = SvelteKit publishing + docs framework (Fumadocs-class for Svelte).

- **Not** a CMS, not a hosted product, not part of the mandala monorepo.
- Hosts keep routing, auth, deploy; Acrolls owns article compile, publication UI, docs chrome.

## Paths

| Path | Role |
|---|---|
| `/Users/amrit/acrolls` | Product monorepo (git `main`) |
| `/Users/amrit/dharmalib` | Optional **demo consumer** only (local trial, do not treat as product core) |
| `/Users/amrit/mandala` | Unrelated monorepo; handoffs may live there for cross-session pick-up |

## Tech stack

- pnpm workspaces, Node ≥ 20.19  
- Svelte 5 (runes), SvelteKit 2  
- mdsvex + remark-gfm + rehype-slug + Shiki  
- TypeScript, tsup for TS libs, `svelte-package` for Svelte packages  
- Apache-2.0  

## Packages

| Package | Purpose |
|---|---|
| `@acrolls/mdsvex` | Compile: GFM, slugs, tables, Shiki, fence meta, `renderAcrollsArticleHtml` |
| `@acrolls/svelte` | `Publication`, Callout, Figure, Banner, Mermaid enhance |
| `@acrolls/styles` | `foundation.css`, `default.css`, SASS tokens |
| `@acrolls/docs` | Docs shell: nested nav, TOC, breadcrumbs, pager, persist |
| `@acrolls/cli` | validate, studio, integrate, init |
| `@acrolls/sveltekit` | Kit helpers — **avoid `file:` install in hosts** (`workspace:*` deps) |

## Commands

```bash
cd /Users/amrit/acrolls
pnpm install
pnpm build
pnpm --filter @acrolls/docs test
pnpm --filter @acrolls/example-kit dev
./packages/cli/dist/index.js validate examples/starter/article.md
./packages/cli/dist/index.js studio examples/starter/article.md
```

After SDK changes, hosts with `file:` deps need `pnpm build` here then reinstall/refresh in the host.

## Conventions

- Prefer **mdsvex** `.md` / `.svx` over inventing a content format  
- Article body always under **`Publication`** for client enhancers  
- Docs chrome via **`DocsShell`** + `DocsNav` config (data-driven nav)  
- No default mdsvex layout that wraps every site `.md` — scope Publication to blog/docs routes  
- Avoid frontmatter key `metadata` (clashes with mdsvex export); use `reading`  
- Escape `{`/`}` in Shiki HTML for Svelte compile  
- Do not add `@acrolls/sveltekit` to external hosts via `file:` until published  

## Boundaries

- **Do not** couple product design to mandala or dharmalib conventions as hard requirements  
- **Do not** require dharmalib commits for Acrolls progress  
- **Do not** claim npm publish until packages are deliberately released  
- Themes / acrolls.dev site / npm publish are **next** product work after self-serve docs  

## Canonical docs for humans (and agents integrating hosts)

**Start:** `docs/README.md`  

Then: `getting-started.md`, `local-install.md`, `integrate-sveltekit.md`, `docs-shell.md`, `content-authoring.md`, `cli.md`, `troubleshooting.md`, `checklist.md`, `snippets/*`.

Product intent: `docs/VISION.md`, root `PRODUCT.md`, `TECH.md`.

## Patterns to follow

- Nested nav: `DocsNavNode.children` in `@acrolls/docs`  
- Open state: `localStorage` key `acrolls-docs:open:<storageKey>`  
- TOC: `scanHeadings` on shell article root after mount  
- Studio: HTML pipeline via `renderAcrollsArticleHtml`, not full SVX execute  

## Handoff

Mandala-tracked pick-up note:  
`/Users/amrit/mandala/handoffs/2026-08-10-acrolls-sveltekit-docs-framework.md`
