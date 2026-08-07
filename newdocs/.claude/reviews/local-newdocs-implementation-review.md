# Code Review: newdocs (full implementation)

**Reviewed**: 2026-08-06  
**Mode**: Local — entire `newdocs/` implementation (not a PR)  
**Scope**: App source, scripts, config; excluded bulk `src/content/**`, `node_modules`, `.svelte-kit`  
**Decision**: **REQUEST_CHANGES**

## Summary

The vault → sync → registry → routes pipeline is sound after the INDEX/slug fixes, but the site is not shippable as a complete docs product. The polished shell (`doc-renderer`, SEO, TOC, pagefind, footer/prev-next) is largely disconnected from routes; client search can pull the full vault into the browser graph; navigation flattens huge trees; and `svelte-check` reports ~132 errors (mostly incomplete UI deps). No CRITICAL secrets or live exploit paths under a trusted-vault model.

## Findings

### CRITICAL

None.

### HIGH

1. **Doc page UI disconnected** — `src/routes/docs/[...slug]/+page.svelte`  
   Renders bare title + mdsvex component. Does not use `doc-renderer`, `SeoHead`, `DocsFooter`, `KeyboardNav`. Load returns `prev`/`next`/`sourcePath` unused. TOC never extracted → right rail empty.  
   **Fix:** Wire article through `DocRenderer` + SEO + footer/prev-next.

2. **Client bundle can include full vault** — `search-command.svelte` → `getNavigation()` → `content.ts` eager `?raw` glob  
   Pulls markdown bodies into the client module graph.  
   **Fix:** Pass `navigation` from layout `data`; split list/meta from raw bodies; keep raw server-only.

3. **Pagefind never built** — `package.json` has `pagefind` dep; no postbuild index; `data-pagefind-body` only on unused renderer  
   **Fix:** Postbuild `pagefind --site …`; mark real article DOM for indexing.

4. **Vault `.md` links not rewritten** — mdsvex leaves `projects/INDEX.md` etc.  
   **Fix:** remark/rehype rewrite to `/docs/<slug>`.

5. **Hard-coded absolute vault path** — `scripts/sync-wiki.mjs:30`  
   Default `/Users/amrit/mandala/repowiki` breaks other machines/CI.  
   **Fix:** Repo-relative `../repowiki` or require `WIKI_VAULT_PATH`.

6. **Flat sidebar over entire vault sections** — `navigation.ts` + config `projects`/`repo`/`wiki`  
   Hundreds of items (e.g. ~196 wiki cards) in one list.  
   **Fix:** Nested tree from slug segments / INDEX hierarchy.

7. **Broken/incomplete UI dependencies** — validation  
   Missing: `tailwind-variants`, `svelte-sonner`, `@internationalized/date` (used by UI). Local `tv.ts` exists but several components still import real packages.  
   **Fix:** Install deps or migrate all imports to local `tv` / drop unused UI.

### MEDIUM

1. **Naive frontmatter parser** — YAML bare arrays, nested `sidebar`, multiline fail → empty tags.  
2. **mdsvex trust boundary** — vault MD compiled as Svelte; no sanitizer; docs MDX components not registered.  
3. **JSON-LD `{@html}`** — `seo-head.svelte` should escape `</script>` (`\u003c`).  
4. **Pagefind excerpt `{@html}`** — sanitize or text-only highlights.  
5. **Starter social URLs** — layout hardcodes `code-gio/svelte-docs-starter`; ignores `docsConfig.site.social`.  
6. **`getPrevNext` global sort** — not section-tree order.  
7. **Root INDEX unused** — `/docs` is flat grid, not vault `INDEX.md`.  
8. **Draft pages still load by direct URL** — filter only in listing.  
9. **Duplicate SearchCommand** — left footer + right header.

### LOW

- Default SvelteKit home page / scaffold README  
- Config typo “monoropo”  
- No `site.url` → weak OG/canonical  
- Docs `tabs.svelte` only renders first tab  
- No unit tests for slug/INDEX registry  
- Empty package-root `content/` vs `src/content`  
- Prerender without explicit `entries()` on `[...slug]`  
- Skip-to-content targets `#doc-content` only present on unused `doc-renderer`

## Validation results

| Check      | Result |
| ---------- | ------ |
| Type check | **Fail** — `svelte-check` ~132 errors / 1 warning in 126 files |
| Lint       | Skipped (not run; typecheck already red) |
| Tests      | **None** in project |
| Build      | Not run (typecheck already failing; large content compile risk) |
| Sync script | **Pass** — ran successfully against default vault |

Notable typecheck failures: missing modules (`tailwind-variants`, `svelte-sonner`, `@internationalized/date`), widespread `ClassValue` mismatches in UI, docs pipeline files clean after recent fixes.

## Files reviewed (categories)

| Category | Paths |
| -------- | ----- |
| Config | `package.json`, `vite.config.ts`, `tsconfig.json`, `eslint.config.js` |
| Scripts | `scripts/sync-wiki.mjs` |
| Docs core | `src/lib/docs/*` |
| Routes | `src/routes/**` |
| Docs UI | `doc-renderer`, layout, search, seo, nav, docs/* components |
| Spot content | INDEX, projects INDEX, sample wiki frontmatter |
| Excluded | bulk vault mirror, `node_modules`, `.svelte-kit` |

## Suggested fix order

1. Wire `[...slug]` → DocRenderer + SEO + prev/next (unblocks TOC/a11y skip target).  
2. Stop client import of `content.ts`; pass nav via layout data.  
3. Install or purge missing UI deps until `check` is green for app shell.  
4. Pagefind postbuild + index real HTML.  
5. Nested nav tree + `.md` link rewrite.  
6. Repo-relative vault default; real YAML; social/config cleanup; registry unit tests.

## Decision gate

Per review policy: **any HIGH issue → REQUEST CHANGES** (do not treat as merge-ready / production docs site until addressed).
