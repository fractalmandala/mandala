---
task: acrolls-sveltekit-docs-framework
status: active
host: grok-build
branch: acrolls main (independent repo); dharmalib main local dirty demo
boss: creator + svelte
updated: 2026-08-10
---

# Handoff — Acrolls (SvelteKit docs/publishing framework)

## Where we are

**Acrolls** lives at **`/Users/amrit/acrolls`** (own git, **not** inside mandala). Goal: Fumadocs-class docs + publication SDK for SvelteKit.

### Shipped and verified

| Layer | Package | Evidence |
|---|---|---|
| Compile | `@acrolls/mdsvex` | Shiki, fence meta, tables, slugs; `renderAcrollsArticleHtml` |
| Article UI | `@acrolls/svelte` | `Publication`, Callout, Figure, Mermaid enhance |
| Styles | `@acrolls/styles` | foundation + default CSS |
| **Docs shell** | **`@acrolls/docs` 0.2.0** | Nested nav, TOC, breadcrumbs, pager, localStorage open state |
| CLI | `@acrolls/cli` | validate, studio (HTML preview), integrate --dry-run/--yes |
| **Self-serve docs** | `acrolls/docs/*.md` | Full handbook + snippets + checklist |

**Acrolls builds:** `pnpm build` green; `@acrolls/docs` unit tests green (5).  
**CLI:** `validate examples/starter/article.md` OK.  
**Human docs entry:** `/Users/amrit/acrolls/docs/README.md` (also linked from root README).  
**Agent rules:** `/Users/amrit/acrolls/AGENTS.md`.  
**gstack checkpoint:** `~/.gstack/projects/acrolls/checkpoints/20260810-152832-acrolls-docs-framework.md`.

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
5. Hosts install via **`file:`** until npm; **do not** `file:`-install `@acrolls/sveltekit`.  
6. Docs shell is first-class (nested `DocsNavNode.children`, TOC, persist).  
7. Self-serve docs before themes so user can trial hosts alone.  
8. Next big product steps: themes → acrolls site → npm publish.

## Remaining (priority order)

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
